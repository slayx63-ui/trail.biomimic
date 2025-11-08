import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  problems: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    submittedBy: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("solved"), v.literal("in_progress")),
    tags: v.array(v.string()),
  }).index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_submitter", ["submittedBy"]),

  solutions: defineTable({
    problemId: v.id("problems"),
    title: v.string(),
    description: v.string(),
    natureInspiration: v.string(),
    biomimicryPrinciple: v.string(),
    implementation: v.string(),
    benefits: v.array(v.string()),
    generatedBy: v.union(v.literal("ai"), v.literal("user")),
    submittedBy: v.optional(v.id("users")),
    likes: v.number(),
    likedBy: v.array(v.id("users")),
  }).index("by_problem", ["problemId"])
    .index("by_likes", ["likes"])
    .index("by_submitter", ["submittedBy"]),

  natureInspirations: defineTable({
    title: v.string(),
    organism: v.string(),
    mechanism: v.string(),
    description: v.string(),
    engineeringApplications: v.array(v.string()),
    category: v.string(),
    imageUrl: v.optional(v.string()),
  }).index("by_category", ["category"])
    .index("by_organism", ["organism"]),

  chatMessages: defineTable({
    content: v.string(),
    sender: v.union(v.literal("user"), v.literal("ai")),
    userId: v.optional(v.id("users")),
    sessionId: v.string(),
    context: v.optional(v.string()),
  }).index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),

  likes: defineTable({
    userId: v.id("users"),
    solutionId: v.id("solutions"),
  }).index("by_user", ["userId"])
    .index("by_solution", ["solutionId"])
    .index("by_user_and_solution", ["userId", "solutionId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
