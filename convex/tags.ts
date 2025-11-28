import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getCurrentUserOrThrow } from "./users"

// Get all tags for a project
export const listProjectTags = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const tags = await ctx.db
      .query("tags")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()

    return tags
  },
})

// Create a new tag for a project
export const createTag = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    // Check if tag already exists
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_project_and_name", (q) => 
        q.eq("projectId", args.projectId).eq("name", args.name)
      )
      .first()

    if (existing) {
      return existing._id
    }

    const tagId = await ctx.db.insert("tags", {
      projectId: args.projectId,
      name: args.name,
      color: args.color,
      createdAt: Date.now(),
      createdBy: user.externalId!,
    })

    return tagId
  },
})

// Delete a tag
export const deleteTag = mutation({
  args: {
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx)
    await ctx.db.delete(args.tagId)
  },
})

// Update a tag
export const updateTag = mutation({
  args: {
    tagId: v.id("tags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx)
    
    const { tagId, ...updates } = args
    await ctx.db.patch(tagId, updates)
  },
})
