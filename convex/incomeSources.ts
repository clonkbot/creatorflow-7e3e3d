import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("incomeSources")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    icon: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("incomeSources", {
      userId,
      name: args.name,
      type: args.type,
      icon: args.icon,
      color: args.color,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("incomeSources"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const source = await ctx.db.get(args.id);
    if (!source || source.userId !== userId) throw new Error("Not found");

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.type !== undefined) updates.type = args.type;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.color !== undefined) updates.color = args.color;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("incomeSources") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const source = await ctx.db.get(args.id);
    if (!source || source.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
