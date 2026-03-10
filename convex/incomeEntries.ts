import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("incomeEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const listBySource = query({
  args: { sourceId: v.id("incomeSources") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("incomeEntries")
      .withIndex("by_source", (q) => q.eq("sourceId", args.sourceId))
      .order("desc")
      .collect();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const entries = await ctx.db
      .query("incomeEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const thisMonthEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const thisMonthTotal = thisMonthEntries
      .filter((e) => e.status === "received")
      .reduce((sum, e) => sum + e.amount, 0);

    const lastMonthTotal = lastMonthEntries
      .filter((e) => e.status === "received")
      .reduce((sum, e) => sum + e.amount, 0);

    const pendingTotal = entries
      .filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalAllTime = entries
      .filter((e) => e.status === "received")
      .reduce((sum, e) => sum + e.amount, 0);

    const percentChange = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    return {
      thisMonthTotal,
      lastMonthTotal,
      pendingTotal,
      totalAllTime,
      percentChange,
      entryCount: entries.length,
    };
  },
});

export const getMonthlyBreakdown = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const entries = await ctx.db
      .query("incomeEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const sources = await ctx.db
      .query("incomeSources")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const sourceMap = new Map(sources.map((s) => [s._id, s]));

    // Group by month and source
    const monthlyData: Record<string, Record<string, number>> = {};

    entries
      .filter((e) => e.status === "received")
      .forEach((entry) => {
        const d = new Date(entry.date);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const source = sourceMap.get(entry.sourceId);
        const sourceName = source?.name || "Unknown";

        if (!monthlyData[monthKey]) monthlyData[monthKey] = {};
        if (!monthlyData[monthKey][sourceName]) monthlyData[monthKey][sourceName] = 0;
        monthlyData[monthKey][sourceName] += entry.amount;
      });

    // Convert to array and sort
    return Object.entries(monthlyData)
      .map(([month, sources]) => ({
        month,
        sources,
        total: Object.values(sources).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);
  },
});

export const create = mutation({
  args: {
    sourceId: v.id("incomeSources"),
    amount: v.number(),
    currency: v.string(),
    description: v.optional(v.string()),
    date: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const source = await ctx.db.get(args.sourceId);
    if (!source || source.userId !== userId) throw new Error("Source not found");

    return await ctx.db.insert("incomeEntries", {
      userId,
      sourceId: args.sourceId,
      amount: args.amount,
      currency: args.currency,
      description: args.description,
      date: args.date,
      status: args.status,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("incomeEntries"),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== userId) throw new Error("Not found");

    const updates: Record<string, unknown> = {};
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.description !== undefined) updates.description = args.description;
    if (args.date !== undefined) updates.date = args.date;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("incomeEntries") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
