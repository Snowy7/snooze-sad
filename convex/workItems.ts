import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// ===== WORK ITEM QUERIES =====

// Get a single work item by ID
export const getWorkItem = query({
  args: {
    workItemId: v.id("workItems"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return await ctx.db.get(args.workItemId);
  },
});

// List work items by workspace
export const listWorkItems = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let query = ctx.db
      .query("workItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    const items = await query.collect();

    // Filter by type if specified
    if (args.type) {
      return items.filter((item) => item.type === args.type);
    }

    return items;
  },
});

// Get today's tasks (work items with type=task or type=daily due today)
export const getTodayWorkItems = query({
  args: {
    workspaceId: v.id("workspaces"),
    today: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const items = await ctx.db
      .query("workItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Filter for tasks due today or daily items
    return items.filter((item) => {
      const isTask = item.type === "task" || item.type === "daily";
      const isDueToday = item.endDate === args.today;
      return isTask && (isDueToday || item.type === "daily");
    });
  },
});

// ===== WORK ITEM MUTATIONS =====

// Create a new work item
export const createWorkItem = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")), // Optional for personal items
    type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    parentId: v.optional(v.id("workItems")),
    assignees: v.optional(v.array(v.string())),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    color: v.optional(v.string()),
    content: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    // If no workspaceId provided, get user's first workspace
    let workspaceId = args.workspaceId;
    if (!workspaceId) {
      const workspace = await ctx.db
        .query("workspaces")
        .filter((q) => q.eq(q.field("ownerId"), user.externalId))
        .first();
      
      if (workspace) {
        workspaceId = workspace._id;
      } else {
        // Create a personal workspace if none exists
        workspaceId = await ctx.db.insert("workspaces", {
          name: "Personal",
          ownerId: user.externalId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    const workItemId = await ctx.db.insert("workItems", {
      workspaceId,
      parentId: args.parentId,
      ownerId: user.externalId,
      type: args.type,
      title: args.title,
      description: args.description,
      status: args.status || "backlog",
      priority: args.priority,
      assignees: args.assignees,
      startDate: args.startDate,
      endDate: args.endDate,
      tags: args.tags,
      color: args.color,
      content: args.content,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    return workItemId;
  },
});

// Update a work item
export const updateWorkItem = mutation({
  args: {
    workItemId: v.id("workItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignees: v.optional(v.array(v.string())),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    estimatedHours: v.optional(v.number()),
    trackedHours: v.optional(v.number()),
    color: v.optional(v.string()),
    content: v.optional(v.string()),
    metadata: v.optional(v.any()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const { workItemId, ...updates } = args;

    await ctx.db.patch(workItemId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a work item
export const deleteWorkItem = mutation({
  args: {
    workItemId: v.id("workItems"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Delete associated links
    const linksFrom = await ctx.db
      .query("workItemLinks")
      .withIndex("by_from", (q) => q.eq("fromItemId", args.workItemId))
      .collect();

    const linksTo = await ctx.db
      .query("workItemLinks")
      .withIndex("by_to", (q) => q.eq("toItemId", args.workItemId))
      .collect();

    for (const link of [...linksFrom, ...linksTo]) {
      await ctx.db.delete(link._id);
    }

    // Delete associated graph nodes
    const nodes = await ctx.db
      .query("graphNodes")
      .withIndex("by_work_item", (q) => q.eq("workItemId", args.workItemId))
      .collect();

    for (const node of nodes) {
      await ctx.db.delete(node._id);
    }

    // Delete the work item
    await ctx.db.delete(args.workItemId);
  },
});

// Create a link between work items
export const createWorkItemLink = mutation({
  args: {
    fromItemId: v.id("workItems"),
    toItemId: v.id("workItems"),
    linkType: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const linkId = await ctx.db.insert("workItemLinks", {
      fromItemId: args.fromItemId,
      toItemId: args.toItemId,
      linkType: args.linkType,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    return linkId;
  },
});

// Delete a work item link
export const deleteWorkItemLink = mutation({
  args: {
    linkId: v.id("workItemLinks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.linkId);
  },
});

// Update work item order (for drag and drop sorting)
export const updateWorkItemOrder = mutation({
  args: {
    workItemId: v.id("workItems"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    await ctx.db.patch(args.workItemId, {
      order: args.order,
      updatedAt: Date.now(),
    });
  },
});

// Batch update work item orders (more efficient for reordering multiple items)
export const batchUpdateWorkItemOrder = mutation({
  args: {
    updates: v.array(
      v.object({
        workItemId: v.id("workItems"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const now = Date.now();
    
    for (const update of args.updates) {
      await ctx.db.patch(update.workItemId, {
        order: update.order,
        updatedAt: now,
      });
    }
  },
});

