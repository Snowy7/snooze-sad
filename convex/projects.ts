import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";
import { api } from "./_generated/api";

// Get a single project by ID
export const getProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const project = await ctx.db.get(args.projectId);
    return project;
  },
});

// List all projects for a workspace
export const listProjectsForWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return projects;
  },
});

// Create a new project
export const createProject = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    const projectId = await ctx.db.insert("projects", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      ownerId: user.externalId,
      color: args.color || "blue",
      status: args.status || "active",
      startDate: args.startDate,
      endDate: args.endDate,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Automatically add project card to projects graph
    try {
      await ctx.runMutation(api.graphs.addProjectCardToProjectsGraph, {
        projectId,
        workspaceId: args.workspaceId,
      });
    } catch (error) {
      console.error("Failed to add project card to projects graph:", error);
      // Don't fail the project creation if card addition fails
    }

    return projectId;
  },
});

// Update a project
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const { projectId, ...updates } = args;
    
    await ctx.db.patch(projectId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a project
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    await ctx.db.delete(args.projectId);
  },
});

// Get project details with stats (for legacy compatibility)
export const getProjectDetails = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // Get tasks for this project from workItems
    const tasks = await ctx.db
      .query("workItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", project.workspaceId!))
      .filter((q) => q.eq(q.field("type"), "task"))
      .collect();

    // Calculate stats
    const completedTasks = tasks.filter(t => t.status === "done").length;
    const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
    const backlogTasks = tasks.filter(t => t.status === "backlog" || !t.status).length;
    const totalTasks = tasks.length;

    return {
      project,
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        backlogTasks,
        totalMilestones: 0,
        completedMilestones: 0,
      },
      milestones: [],
      sprints: [],
      userRole: "owner",
    };
  },
});

// Get project board (tasks, milestones, sprints) for legacy compatibility
export const listProjectBoard = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // Get all tasks for this project from workItems
    const tasks = await ctx.db
      .query("workItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", project.workspaceId!))
      .filter((q) => q.eq(q.field("type"), "task"))
      .collect();

    return {
      project,
      tasks,
      sections: [
        { _id: "backlog", name: "Backlog", position: 0 },
        { _id: "todo", name: "To Do", position: 1 },
        { _id: "in_progress", name: "In Progress", position: 2 },
        { _id: "done", name: "Done", position: 3 },
      ],
      milestones: [],
      sprints: [],
      members: [],
    };
  },
});

