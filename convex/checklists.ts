import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getCurrentUserOrThrow } from "./users"

// Query to get all checklists for a work item
export const listChecklists = query({
  args: {
    workItemId: v.id("workItems"),
  },
  handler: async (ctx, args) => {
    const checklists = await ctx.db
      .query("checklists")
      .withIndex("by_work_item", (q) => q.eq("workItemId", args.workItemId))
      .collect()

    return checklists
  },
})

// Mutation to create a checklist
export const createChecklist = mutation({
  args: {
    workItemId: v.id("workItems"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx)

    const checklistId = await ctx.db.insert("checklists", {
      workItemId: args.workItemId,
      title: args.title,
      items: [],
      createdAt: Date.now(),
    })

    return checklistId
  },
})

// Mutation to add an item to a checklist
export const addChecklistItem = mutation({
  args: {
    checklistId: v.id("checklists"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx)

    const checklist = await ctx.db.get(args.checklistId)
    if (!checklist) {
      throw new Error("Checklist not found")
    }

    const newItem = {
      id: crypto.randomUUID(),
      text: args.text,
      completed: false,
      order: checklist.items.length,
    }

    await ctx.db.patch(args.checklistId, {
      items: [...checklist.items, newItem],
      updatedAt: Date.now(),
    })

    return newItem.id
  },
})

// Mutation to toggle checklist item
export const toggleChecklistItem = mutation({
  args: {
    checklistId: v.id("checklists"),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx)

    const checklist = await ctx.db.get(args.checklistId)
    if (!checklist) {
      throw new Error("Checklist not found")
    }

    const updatedItems = checklist.items.map(item =>
      item.id === args.itemId
        ? { ...item, completed: !item.completed }
        : item
    )

    await ctx.db.patch(args.checklistId, {
      items: updatedItems,
      updatedAt: Date.now(),
    })

    return args.itemId
  },
})

// Mutation to update checklist item text
export const updateChecklistItem = mutation({
  args: {
    checklistId: v.id("checklists"),
    itemId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx)

    const checklist = await ctx.db.get(args.checklistId)
    if (!checklist) {
      throw new Error("Checklist not found")
    }

    const updatedItems = checklist.items.map(item =>
      item.id === args.itemId
        ? { ...item, text: args.text }
        : item
    )

    await ctx.db.patch(args.checklistId, {
      items: updatedItems,
      updatedAt: Date.now(),
    })

    return args.itemId
  },
})

// Mutation to delete checklist item
export const deleteChecklistItem = mutation({
  args: {
    checklistId: v.id("checklists"),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx)

    const checklist = await ctx.db.get(args.checklistId)
    if (!checklist) {
      throw new Error("Checklist not found")
    }

    const updatedItems = checklist.items.filter(item => item.id !== args.itemId)

    await ctx.db.patch(args.checklistId, {
      items: updatedItems,
      updatedAt: Date.now(),
    })

    return args.itemId
  },
})

// Mutation to delete a checklist
export const deleteChecklist = mutation({
  args: {
    checklistId: v.id("checklists"),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx)

    await ctx.db.delete(args.checklistId)

    return args.checklistId
  },
})
