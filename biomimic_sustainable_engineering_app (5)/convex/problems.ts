import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let problems;
    
    if (args.category) {
      problems = await ctx.db
        .query("problems")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .collect();
    } else if (args.status) {
      problems = await ctx.db
        .query("problems")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "solved" | "in_progress"))
        .order("desc")
        .collect();
    } else {
      problems = await ctx.db.query("problems").order("desc").collect();
    }
    
    return Promise.all(
      problems.map(async (problem) => {
        const user = await ctx.db.get(problem.submittedBy);
        const solutionsCount = await ctx.db
          .query("solutions")
          .withIndex("by_problem", (q) => q.eq("problemId", problem._id))
          .collect();
        
        return {
          ...problem,
          submitterName: user?.name || user?.email || "Anonymous",
          solutionsCount: solutionsCount.length,
        };
      })
    );
  },
});

export const submit = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to submit problems");
    }

    const problemId = await ctx.db.insert("problems", {
      title: args.title,
      description: args.description,
      category: args.category,
      submittedBy: userId,
      status: "pending",
      tags: args.tags,
    });

    return problemId;
  },
});

export const get = query({
  args: { id: v.id("problems") },
  handler: async (ctx, args) => {
    const problem = await ctx.db.get(args.id);
    if (!problem) return null;
    
    const user = await ctx.db.get(problem.submittedBy);
    return {
      ...problem,
      submitterName: user?.name || user?.email || "Anonymous",
    };
  },
});
