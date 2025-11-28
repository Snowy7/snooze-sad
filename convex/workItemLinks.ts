import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

// Query links from a work item
export const listFromLinks = query({
  args: { workItemId: v.id("workItems") },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("workItemLinks")
      .withIndex("by_from", (q) => q.eq("fromItemId", args.workItemId))
      .collect();
  },
});

// Query links to a work item
export const listToLinks = query({
  args: { workItemId: v.id("workItems") },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("workItemLinks")
      .withIndex("by_to", (q) => q.eq("toItemId", args.workItemId))
      .collect();
  },
});

// Query all links (from + to) for a work item
export const listAllLinks = query({
  args: { workItemId: v.id("workItems") },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);
    
    const fromLinks = await ctx.db
      .query("workItemLinks")
      .withIndex("by_from", (q) => q.eq("fromItemId", args.workItemId))
      .collect();
    
    const toLinks = await ctx.db
      .query("workItemLinks")
      .withIndex("by_to", (q) => q.eq("toItemId", args.workItemId))
      .collect();
    
    return { fromLinks, toLinks };
  },
});

// Get linked work items with details (for subtasks)
export const getSubtasks = query({
  args: { workItemId: v.id("workItems") },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);
    
    const links = await ctx.db
      .query("workItemLinks")
      .withIndex("by_from", (q) => q.eq("fromItemId", args.workItemId))
      .filter((q) => q.eq(q.field("linkType"), "parent_of"))
      .collect();
    
    const subtasks = await Promise.all(
      links.map(async (link) => {
        const workItem = await ctx.db.get(link.toItemId);
        return { link, workItem };
      })
    );
    
    return subtasks.filter((s) => s.workItem !== null);
  },
});

// Get relationship links with details
export const getRelationships = query({
  args: { workItemId: v.id("workItems") },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);
    
    // Get all links where this item is involved
    const fromLinks = await ctx.db
      .query("workItemLinks")
      .withIndex("by_from", (q) => q.eq("fromItemId", args.workItemId))
      .collect();
    
    const toLinks = await ctx.db
      .query("workItemLinks")
      .withIndex("by_to", (q) => q.eq("toItemId", args.workItemId))
      .collect();
    
    // Fetch work items for all links
    const fromWorkItems = await Promise.all(
      fromLinks.map(async (link) => {
        const workItem = await ctx.db.get(link.toItemId);
        return { link, workItem, direction: "from" as const };
      })
    );
    
    const toWorkItems = await Promise.all(
      toLinks.map(async (link) => {
        const workItem = await ctx.db.get(link.fromItemId);
        return { link, workItem, direction: "to" as const };
      })
    );
    
    const allRelationships = [...fromWorkItems, ...toWorkItems].filter((r) => r.workItem !== null);
    
    // Categorize by type
    const blocks = allRelationships.filter((r) => 
      (r.link.linkType === "blocks" && r.direction === "from") ||
      (r.link.linkType === "blocked_by" && r.direction === "to")
    );
    
    const blockedBy = allRelationships.filter((r) => 
      (r.link.linkType === "blocked_by" && r.direction === "from") ||
      (r.link.linkType === "blocks" && r.direction === "to")
    );
    
    const relatesTo = allRelationships.filter((r) => 
      r.link.linkType === "relates_to"
    );
    
    return { blocks, blockedBy, relatesTo };
  },
});

// Create a link between work items
export const createLink = mutation({
  args: {
    fromItemId: v.id("workItems"),
    toItemId: v.id("workItems"),
    linkType: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);
    
    // Check if link already exists
    const existing = await ctx.db
      .query("workItemLinks")
      .withIndex("by_from", (q) => q.eq("fromItemId", args.fromItemId))
      .filter((q) => 
        q.and(
          q.eq(q.field("toItemId"), args.toItemId),
          q.eq(q.field("linkType"), args.linkType)
        )
      )
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    return await ctx.db.insert("workItemLinks", {
      fromItemId: args.fromItemId,
      toItemId: args.toItemId,
      linkType: args.linkType,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

// Delete a link
export const deleteLink = mutation({
  args: { linkId: v.id("workItemLinks") },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);
    await ctx.db.delete(args.linkId);
  },
});

// Create subtask relationship
export const createSubtask = mutation({
  args: {
    parentId: v.id("workItems"),
    title: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    // Create the subtask work item
    const subtaskId = await ctx.db.insert("workItems", {
      workspaceId: args.workspaceId,
      parentId: args.parentId,
      ownerId: user.externalId || user._id,
      type: "task",
      title: args.title,
      description: "",
      status: "backlog",
      priority: "medium",
      tags: [],
      assignees: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create the parent-child link
    await ctx.db.insert("workItemLinks", {
      fromItemId: args.parentId,
      toItemId: subtaskId,
      linkType: "parent_of",
      createdAt: Date.now(),
    });
    
    return subtaskId;
  },
});
