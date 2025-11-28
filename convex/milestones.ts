import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// List milestones for a project
export const listMilestones = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("asc")
      .collect();

    // Get task counts for each milestone
    const milestonesWithTasks = await Promise.all(
      milestones.map(async (milestone) => {
        const assignments = await ctx.db
          .query("taskAssignments")
          .withIndex("by_milestone", (q) => q.eq("milestoneId", milestone._id))
          .collect();

        const tasks = await Promise.all(
          assignments.map(async (assignment) => {
            return await ctx.db.get(assignment.taskId);
          })
        );

        const validTasks = tasks.filter(Boolean);
        const completedTasks = validTasks.filter((t: any) => t?.status === "done").length;

        return {
          ...milestone,
          taskCount: validTasks.length,
          completedTaskCount: completedTasks,
          progress: validTasks.length > 0 ? Math.round((completedTasks / validTasks.length) * 100) : 0,
        };
      })
    );

    return milestonesWithTasks;
  },
});

// Get a single milestone
export const getMilestone = query({
  args: {
    milestoneId: v.id("milestones"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return await ctx.db.get(args.milestoneId);
  },
});

// Create a milestone
export const createMilestone = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    const milestoneId = await ctx.db.insert("milestones", {
      projectId: args.projectId,
      name: args.name,
      description: args.description,
      status: "planned",
      dueDate: args.endDate,
      createdAt: Date.now(),
    });

    return milestoneId;
  },
});

// Update a milestone
export const updateMilestone = mutation({
  args: {
    milestoneId: v.id("milestones"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    progress: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const { milestoneId, ...updates } = args;

    await ctx.db.patch(milestoneId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a milestone
export const deleteMilestone = mutation({
  args: {
    milestoneId: v.id("milestones"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Delete all task assignments
    const assignments = await ctx.db
      .query("taskAssignments")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", args.milestoneId))
      .collect();

    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    await ctx.db.delete(args.milestoneId);
  },
});

// Assign task to milestone
export const assignTaskToMilestone = mutation({
  args: {
    taskId: v.id("workItems"),
    milestoneId: v.id("milestones"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    // Check if assignment already exists
    const existing = await ctx.db
      .query("taskAssignments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId as any))
      .filter((q) => q.eq(q.field("milestoneId"), args.milestoneId))
      .first();

    if (existing) return existing._id;

    const assignmentId = await ctx.db.insert("taskAssignments", {
      taskId: args.taskId as any,
      milestoneId: args.milestoneId,
      createdAt: Date.now(),
    });

    return assignmentId;
  },
});

// Remove task from milestone
export const removeTaskFromMilestone = mutation({
  args: {
    taskId: v.id("workItems"),
    milestoneId: v.id("milestones"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const assignment = await ctx.db
      .query("taskAssignments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId as any))
      .filter((q) => q.eq(q.field("milestoneId"), args.milestoneId))
      .first();

    if (assignment) {
      await ctx.db.delete(assignment._id);
    }
  },
});

// Get tasks for a milestone
export const getMilestoneTasks = query({
  args: {
    milestoneId: v.id("milestones"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const assignments = await ctx.db
      .query("taskAssignments")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", args.milestoneId))
      .collect();

    const tasks = await Promise.all(
      assignments.map(async (assignment) => {
        const task = await ctx.db.get(assignment.taskId);
        return task ? { ...task, assignmentId: assignment._id } : null;
      })
    );

    return tasks.filter(Boolean);
  },
});

