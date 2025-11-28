import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getCurrentUser } from "./users"

// Get analytics graph for a user
export const getAnalyticsGraph = query({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) return null

    const graph = await ctx.db
      .query("graphs")
      .withIndex("by_type", (q) => q.eq("type", "analytics"))
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first()

    return graph
  },
})

// Create analytics graph for a user
export const createAnalyticsGraph = mutation({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user?.externalId) throw new Error("Not authenticated")

    // Check if analytics graph already exists
    const existing = await ctx.db
      .query("graphs")
      .withIndex("by_type", (q) => q.eq("type", "analytics"))
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first()

    if (existing) return existing._id

    // Create new analytics graph
    const graphId = await ctx.db.insert("graphs", {
      name: "Analytics & Insights",
      description: "Your productivity analytics and insights",
      ownerId: args.ownerId,
      type: "analytics",
      isDefault: false,
      settings: {
        zoom: 1,
        pan: { x: 0, y: 0 },
      },
      createdAt: Date.now(),
    })

    // Get the first workspace for the user
    const workspace = await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first()
    
    if (!workspace) {
      throw new Error("No workspace found for user")
    }

    // Add default analytics nodes
    const analyticsNodes = [
      {
        type: "productivity-chart",
        position: { x: 40, y: 40 },
        size: { width: 500, height: 320 },
      },
      {
        type: "time-distribution",
        position: { x: 580, y: 40 },
        size: { width: 380, height: 360 },
      },
      {
        type: "widget",
        position: { x: 40, y: 400 },
        size: { width: 440, height: 260 },
        props: { widgetType: "stats", ownerId: args.ownerId },
      },
      {
        type: "widget",
        position: { x: 520, y: 440 },
        size: { width: 440, height: 220 },
        props: { widgetType: "activity", ownerId: args.ownerId },
      },
      {
        type: "note",
        position: { x: 40, y: 700 },
        size: { width: 920, height: 240 },
        workItem: {
          type: "note",
          title: "Analytics Insights",
          content: "📊 Key Insights:\n\n• Track your productivity trends\n• Identify peak performance times\n• Monitor project time allocation\n• Set and achieve goals\n\nUse these insights to optimize your workflow!",
        },
      },
    ]

    for (const nodeConfig of analyticsNodes) {
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
        props: nodeConfig.props,
        zIndex: 1,
        createdAt: Date.now(),
      })
    }

    return graphId
  },
})

