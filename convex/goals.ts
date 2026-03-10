import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentMonthGoal = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const now = new Date();
    const currentMonth = now.getFullYear() * 100 + (now.getMonth() + 1);

    const goals = await ctx.db
      .query("monthlyGoals")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", userId).eq("month", currentMonth)
      )
      .first();

    return goals;
  },
});

export const setGoal = mutation({
  args: {
    month: v.number(),
    targetAmount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("monthlyGoals")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", userId).eq("month", args.month)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        targetAmount: args.targetAmount,
        currency: args.currency,
      });
      return existing._id;
    }

    return await ctx.db.insert("monthlyGoals", {
      userId,
      month: args.month,
      targetAmount: args.targetAmount,
      currency: args.currency,
      createdAt: Date.now(),
    });
  },
});
