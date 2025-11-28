import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getCurrentUser } from "./users"

// Get calendar graph for a user
export const getCalendarGraph = query({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) return null

    const graph = await ctx.db
      .query("graphs")
      .withIndex("by_type", (q) => q.eq("type", "calendar"))
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first()

    return graph
  },
})

// Create calendar graph for a user
export const createCalendarGraph = mutation({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user?.externalId) throw new Error("Not authenticated")

    // Check if calendar graph already exists
    const existing = await ctx.db
      .query("graphs")
      .withIndex("by_type", (q) => q.eq("type", "calendar"))
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first()

    if (existing) return existing._id

    // Create new calendar graph (no workspaceId needed for personal graphs)
    const graphId = await ctx.db.insert("graphs", {
      name: "Calendar & Schedule",
      description: "Your calendar and upcoming tasks",
      ownerId: args.ownerId,
      type: "calendar",
      isDefault: false,
      settings: {
        zoom: 1,
        pan: { x: 0, y: 0 },
      },
      createdAt: Date.now(),
    })

    // Get the first workspace for the user (we need a workspace for workItems if any)
    const workspace = await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first()
    
    if (!workspace) {
      throw new Error("No workspace found for user")
    }

    // Add default calendar nodes
    const calendarNodes = [
      {
        type: "calendar-widget",
        position: { x: 40, y: 40 },
        size: { width: 400, height: 420 },
      },
      {
        type: "upcoming-tasks",
        position: { x: 480, y: 40 },
        size: { width: 380, height: 420 },
      },
      {
        type: "note",
        position: { x: 40, y: 500 },
        size: { width: 820, height: 280 },
        workItem: {
          type: "note",
          title: "Meeting Notes",
          content: "📅 Important Meetings:\n\n• Weekly team sync\n• Project review\n• Client presentation\n\nAdd your meeting notes here...",
        },
      },
    ]

    for (const nodeConfig of calendarNodes) {
      let workItemId = undefined
      if (nodeConfig.workItem) {
        workItemId = await ctx.db.insert("workItems", {
          workspaceId: workspace._id,
          ownerId: args.ownerId,
          type: nodeConfig.workItem.type,
          title: nodeConfig.workItem.title,
          content: nodeConfig.workItem.content,
          createdAt: Date.now(),
        })
      }

      await ctx.db.insert("graphNodes", {
        graphId,
        workItemId,
        type: nodeConfig.type,
        position: nodeConfig.position,
        size: nodeConfig.size,
        zIndex: 1,
        createdAt: Date.now(),
      })
    }

    return graphId
  },
})

