import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// List sprints for a project
export const listSprints = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const sprints = await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    // Get task counts for each sprint
    const sprintsWithTasks = await Promise.all(
      sprints.map(async (sprint) => {
        const assignments = await ctx.db
          .query("taskAssignments")
          .withIndex("by_sprint", (q) => q.eq("sprintId", sprint._id))
          .collect();

        const tasks = await Promise.all(
          assignments.map(async (assignment) => {
            return await ctx.db.get(assignment.taskId);
          })
        );

        const validTasks = tasks.filter(Boolean);
        const completedTasks = validTasks.filter((t: any) => t?.status === "done").length;

        return {
          ...sprint,
          taskCount: validTasks.length,
          completedTaskCount: completedTasks,
        };
      })
    );

    return sprintsWithTasks;
  },
});

// Get a single sprint
export const getSprint = query({
  args: {
    sprintId: v.id("sprints"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return await ctx.db.get(args.sprintId);
  },
});

// Create a sprint
export const createSprint = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.string(),
    goal: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    const sprintId = await ctx.db.insert("sprints", {
      projectId: args.projectId,
      name: args.name,
      status: "planned",
      startDate: args.startDate,
      endDate: args.endDate,
      goal: args.goal,
      createdAt: Date.now(),
    });

    return sprintId;
  },
});

// Update a sprint
export const updateSprint = mutation({
  args: {
    sprintId: v.id("sprints"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    goal: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const { sprintId, ...updates } = args;

    await ctx.db.patch(sprintId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a sprint
export const deleteSprint = mutation({
  args: {
    sprintId: v.id("sprints"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Delete all task assignments
    const assignments = await ctx.db
      .query("taskAssignments")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
      .collect();

    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    await ctx.db.delete(args.sprintId);
  },
});

// Assign task to sprint
export const assignTaskToSprint = mutation({
  args: {
    taskId: v.id("workItems"),
    sprintId: v.id("sprints"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    // Check if assignment already exists
    const existing = await ctx.db
      .query("taskAssignments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId as any))
      .filter((q) => q.eq(q.field("sprintId"), args.sprintId))
      .first();

    if (existing) return existing._id;

    const assignmentId = await ctx.db.insert("taskAssignments", {
      taskId: args.taskId as any,
      sprintId: args.sprintId,
      createdAt: Date.now(),
    });

    return assignmentId;
  },
});

// Remove task from sprint
export const removeTaskFromSprint = mutation({
  args: {
    taskId: v.id("workItems"),
    sprintId: v.id("sprints"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const assignment = await ctx.db
      .query("taskAssignments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId as any))
      .filter((q) => q.eq(q.field("sprintId"), args.sprintId))
      .first();

    if (assignment) {
      await ctx.db.delete(assignment._id);
    }
  },
});

// Get tasks for a sprint
export const getSprintTasks = query({
  args: {
    sprintId: v.id("sprints"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const assignments = await ctx.db
      .query("taskAssignments")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
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

