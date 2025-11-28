import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// List task lists for a project
export const listTaskLists = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const taskLists = await ctx.db
      .query("taskLists")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("asc")
      .collect();

    // Get task counts for each list
    const taskListsWithCounts = await Promise.all(
      taskLists.map(async (taskList) => {
        const assignments = await ctx.db
          .query("taskAssignments")
          .withIndex("by_task_list", (q) => q.eq("taskListId", taskList._id))
          .collect();

        const tasks = await Promise.all(
          assignments.map(async (assignment) => {
            return await ctx.db.get(assignment.taskId);
          })
        );

        const validTasks = tasks.filter(Boolean);
        const completedTasks = validTasks.filter((t: any) => t?.status === "done").length;

        return {
          ...taskList,
          taskCount: validTasks.length,
          completedTaskCount: completedTasks,
        };
      })
    );

    return taskListsWithCounts;
  },
});

// Get a single task list
export const getTaskList = query({
  args: {
    taskListId: v.id("taskLists"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return await ctx.db.get(args.taskListId);
  },
});

// Create a task list
export const createTaskList = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    const taskListId = await ctx.db.insert("taskLists", {
      projectId: args.projectId,
      name: args.name,
      description: args.description,
      createdAt: Date.now(),
    });

    return taskListId;
  },
});

// Update a task list
export const updateTaskList = mutation({
  args: {
    taskListId: v.id("taskLists"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const { taskListId, ...updates } = args;

    await ctx.db.patch(taskListId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a task list
export const deleteTaskList = mutation({
  args: {
    taskListId: v.id("taskLists"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Delete all task assignments
    const assignments = await ctx.db
      .query("taskAssignments")
      .withIndex("by_task_list", (q) => q.eq("taskListId", args.taskListId))
      .collect();

    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    await ctx.db.delete(args.taskListId);
  },
});

// Assign task to task list
export const assignTaskToList = mutation({
  args: {
    taskId: v.id("workItems"),
    taskListId: v.id("taskLists"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    // Check if assignment already exists
    const existing = await ctx.db
      .query("taskAssignments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId as any))
      .filter((q) => q.eq(q.field("taskListId"), args.taskListId))
      .first();

    if (existing) return existing._id;

    const assignmentId = await ctx.db.insert("taskAssignments", {
      taskId: args.taskId as any,
      taskListId: args.taskListId,
      createdAt: Date.now(),
    });

    return assignmentId;
  },
});

// Remove task from task list
export const removeTaskFromList = mutation({
  args: {
    taskId: v.id("workItems"),
    taskListId: v.id("taskLists"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const assignment = await ctx.db
      .query("taskAssignments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId as any))
      .filter((q) => q.eq(q.field("taskListId"), args.taskListId))
      .first();

    if (assignment) {
      await ctx.db.delete(assignment._id);
    }
  },
});

// Get tasks for a task list
export const getTaskListTasks = query({
  args: {
    taskListId: v.id("taskLists"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const assignments = await ctx.db
      .query("taskAssignments")
      .withIndex("by_task_list", (q) => q.eq("taskListId", args.taskListId))
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

