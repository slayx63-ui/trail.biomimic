import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const getMessages = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    content: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const messageId = await ctx.db.insert("chatMessages", {
      content: args.content,
      sender: "user",
      userId: userId || undefined,
      sessionId: args.sessionId,
    });

    return messageId;
  },
});

export const generateAIResponse = action({
  args: {
    userMessage: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    // Get recent conversation history
    const messages = await ctx.runQuery(api.chat.getRecentMessages, {
      sessionId: args.sessionId,
    });

    const conversationHistory = messages.map((msg: any) => ({
      role: msg.sender === "user" ? "user" as const : "assistant" as const,
      content: msg.content,
    }));

    const systemPrompt = `You are a biomimicry expert assistant helping users understand how nature solves engineering problems. You specialize in:

1. Explaining biological mechanisms and how they can inspire engineering solutions
2. Suggesting nature-inspired approaches to sustainability challenges
3. Providing examples of successful biomimicry applications
4. Helping users think creatively about biological solutions

Keep responses informative but conversational. Focus on practical applications and real-world examples. When possible, suggest specific organisms or natural phenomena that could inspire solutions.`;

    try {
      const response: Response = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: args.userMessage },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data: any = await response.json();
      const aiResponse: string = data.choices[0].message.content;

      // Save AI response
      await ctx.runMutation(api.chat.saveAIMessage, {
        content: aiResponse,
        sessionId: args.sessionId,
      });

      return aiResponse;
    } catch (error) {
      console.error("Error generating AI response:", error);
      throw new Error("Failed to generate AI response");
    }
  },
});

export const getRecentMessages = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(10);
  },
});

export const saveAIMessage = mutation({
  args: {
    content: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      content: args.content,
      sender: "ai",
      sessionId: args.sessionId,
    });
  },
});
