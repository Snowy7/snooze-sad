import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getCurrentUser } from "./users"

// Get daily checklist items for a user
export const getDailyChecklistItems = query({
  args: {
    ownerId: v.string(),
    date: v.string(), // YYYY-MM-DD format
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) return []

    const items = await ctx.db
      .query("workItems")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "task"),
          q.eq(q.field("endDate"), args.date),
          q.or(
            q.eq(q.field("tags"), undefined),
            q.eq(q.field("tags"), null)
          )
        )
      )
      .collect()

    return items
  },
})

// Create a daily checklist item
export const createDailyChecklistItem = mutation({
  args: {
    ownerId: v.string(),
    text: v.string(),
    date: v.string(), // YYYY-MM-DD format
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user?.externalId) throw new Error("Not authenticated")

    // Get or create a personal workspace
    let workspace = await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first()
    
    if (!workspace) {
      const workspaceId = await ctx.db.insert("workspaces", {
        name: "Personal",
        ownerId: args.ownerId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      workspace = await ctx.db.get(workspaceId)
    }

    const itemId = await ctx.db.insert("workItems", {
      workspaceId: workspace!._id,
      ownerId: args.ownerId,
      type: "task",
      title: args.text,
      status: "backlog",
      endDate: args.date,
      createdAt: Date.now(),
    })

    // Log activity
    await ctx.db.insert("activities", {
      workspaceId: workspace!._id,
      userId: args.ownerId,
      action: "created",
      entityType: "task",
      entityId: itemId.toString(),
      metadata: { title: args.text },
      createdAt: Date.now(),
    })

    return itemId
  },
})

// Update checklist item status
export const updateDailyChecklistItem = mutation({
  args: {
    itemId: v.id("workItems"),
    checked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) throw new Error("Not authenticated")

    const item = await ctx.db.get(args.itemId)
    if (!item) return

    await ctx.db.patch(args.itemId, {
      status: args.checked ? "done" : "backlog",
      updatedAt: Date.now(),
    })

    // Log activity when task is completed
    if (args.checked && item.workspaceId) {
      await ctx.db.insert("activities", {
        workspaceId: item.workspaceId,
        userId: user.externalId!,
        action: "completed",
        entityType: "task",
        entityId: args.itemId.toString(),
        metadata: { title: item.title },
        createdAt: Date.now(),
      })
    }
  },
})

// Delete checklist item
export const deleteDailyChecklistItem = mutation({
  args: {
    itemId: v.id("workItems"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) throw new Error("Not authenticated")

    await ctx.db.delete(args.itemId)
  },
})

