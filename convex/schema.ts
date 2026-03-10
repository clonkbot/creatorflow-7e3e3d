import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Income sources (platforms like YouTube, Instagram, TikTok, etc.)
  incomeSources: defineTable({
    userId: v.id("users"),
    name: v.string(), // e.g., "YouTube", "Instagram", "TikTok", "Patreon"
    type: v.string(), // "sponsorship", "adsense", "affiliate", "merchandise", "subscription", "other"
    icon: v.string(), // emoji or icon identifier
    color: v.string(), // hex color for the platform
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Individual income entries
  incomeEntries: defineTable({
    userId: v.id("users"),
    sourceId: v.id("incomeSources"),
    amount: v.number(),
    currency: v.string(), // "EUR", "USD", etc.
    description: v.optional(v.string()),
    date: v.number(), // timestamp
    status: v.string(), // "pending", "received", "cancelled"
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_source", ["sourceId"])
    .index("by_user_and_date", ["userId", "date"]),

  // Monthly goals
  monthlyGoals: defineTable({
    userId: v.id("users"),
    month: v.number(), // e.g., 202401 for January 2024
    targetAmount: v.number(),
    currency: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_month", ["userId", "month"]),
});
