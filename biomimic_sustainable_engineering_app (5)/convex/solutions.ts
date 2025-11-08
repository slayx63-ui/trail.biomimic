import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

export const listByProblem = query({
  args: { problemId: v.id("problems") },
  handler: async (ctx, args) => {
    const solutions = await ctx.db
      .query("solutions")
      .withIndex("by_problem", (q) => q.eq("problemId", args.problemId))
      .order("desc")
      .collect();

    return Promise.all(
      solutions.map(async (solution) => {
        const user = solution.submittedBy ? await ctx.db.get(solution.submittedBy) : null;
        return {
          ...solution,
          submitterName: user?.name || user?.email || "AI Assistant",
        };
      })
    );
  },
});

export const listPopular = query({
  args: {},
  handler: async (ctx) => {
    const solutions = await ctx.db
      .query("solutions")
      .withIndex("by_likes")
      .order("desc")
      .take(20);

    return Promise.all(
      solutions.map(async (solution) => {
        const problem = await ctx.db.get(solution.problemId);
        const user = solution.submittedBy ? await ctx.db.get(solution.submittedBy) : null;
        return {
          ...solution,
          problemTitle: problem?.title || "Unknown Problem",
          submitterName: user?.name || user?.email || "AI Assistant",
        };
      })
    );
  },
});

export const toggleLike = mutation({
  args: { solutionId: v.id("solutions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to like solutions");
    }

    const solution = await ctx.db.get(args.solutionId);
    if (!solution) {
      throw new Error("Solution not found");
    }

    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_solution", (q) => 
        q.eq("userId", userId).eq("solutionId", args.solutionId)
      )
      .unique();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.solutionId, {
        likes: Math.max(0, solution.likes - 1),
        likedBy: solution.likedBy.filter(id => id !== userId),
      });
      return false;
    } else {
      // Like
      await ctx.db.insert("likes", {
        userId,
        solutionId: args.solutionId,
      });
      await ctx.db.patch(args.solutionId, {
        likes: solution.likes + 1,
        likedBy: [...solution.likedBy, userId],
      });
      return true;
    }
  },
});

export const generateAISolution = action({
  args: { problemId: v.id("problems") },
  handler: async (ctx, args) => {
    const problem = await ctx.runQuery(api.problems.get, { id: args.problemId });
    if (!problem) {
      throw new Error("Problem not found");
    }

    const prompt = `As a biomimicry expert, analyze this sustainability challenge and provide a nature-inspired solution:

Problem: ${problem.title}
Description: ${problem.description}
Category: ${problem.category}
Tags: ${problem.tags.join(", ")}

Please provide a detailed biomimicry solution in the following JSON format:
{
  "title": "Concise solution title",
  "description": "Detailed description of the solution",
  "natureInspiration": "Which organism or natural phenomenon inspired this",
  "biomimicryPrinciple": "The specific biological mechanism being mimicked",
  "implementation": "How this could be implemented in practice",
  "benefits": ["benefit1", "benefit2", "benefit3"]
}

Focus on practical, innovative solutions that directly address the sustainability challenge.`;

    try {
      const response = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      const solutionData = JSON.parse(content);
      
      // Save the solution to the database
      await ctx.runMutation(api.solutions.createAISolution, {
        problemId: args.problemId,
        ...solutionData,
      });

      return solutionData;
    } catch (error) {
      console.error("Error generating AI solution:", error);
      throw new Error("Failed to generate AI solution");
    }
  },
});

export const createAISolution = mutation({
  args: {
    problemId: v.id("problems"),
    title: v.string(),
    description: v.string(),
    natureInspiration: v.string(),
    biomimicryPrinciple: v.string(),
    implementation: v.string(),
    benefits: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("solutions", {
      problemId: args.problemId,
      title: args.title,
      description: args.description,
      natureInspiration: args.natureInspiration,
      biomimicryPrinciple: args.biomimicryPrinciple,
      implementation: args.implementation,
      benefits: args.benefits,
      generatedBy: "ai",
      likes: 0,
      likedBy: [],
    });
  },
});
