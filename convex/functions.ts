import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ===== NEW SYSTEM QUERIES =====

export const listDashboard = query({
  args: { ownerId: v.string(), today: v.string() },
  handler: async (ctx, { ownerId, today }) => {
    const projects = await ctx.db.query("projects").withIndex("by_owner", q => q.eq("ownerId", ownerId)).collect();
    
    // Get tasks from workItems (type: "task")
    const allTasks = await ctx.db
      .query("workItems")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .filter((q) => q.eq(q.field("type"), "task"))
      .collect();
    
    // Tasks for today
    const tasksToday = allTasks.filter(t => t.endDate === today).slice(0, 20);
    
    // Overdue tasks
    const overdue = allTasks.filter(t => 
      t.status !== "done" && 
      t.endDate && 
      t.endDate < today
    ).slice(0, 10);
    
    // Get docs from workItems (type: "document")
    const docs = await ctx.db
      .query("workItems")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .filter((q) => q.eq(q.field("type"), "document"))
      .order("desc")
      .take(5);
    
    // Get recent activities from all user workspaces
    const workspaces = await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("ownerId"), ownerId))
      .collect();

    const allActivities = [];
    for (const workspace of workspaces) {
      const activities = await ctx.db
        .query("activities")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .order("desc")
        .take(20);
      allActivities.push(...activities);
    }

    // Sort by timestamp and take most recent
    const recentActivities = allActivities
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
    
    return { projects, tasksToday, overdue, docs, recentActivities };
  }
});

export const getWeeklyProgress = query({
  args: { ownerId: v.string(), dates: v.array(v.string()) },
  handler: async (ctx, { ownerId, dates }) => {
    const weeklyData = [];
    
    // Get all user tasks
    const allTasks = await ctx.db
      .query("workItems")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .filter((q) => q.eq(q.field("type"), "task"))
      .collect();
    
    for (const date of dates) {
      const userTasks = allTasks.filter(t => t.endDate === date);
      const completed = userTasks.filter(t => t.status === "done").length;
      const total = userTasks.length;
      
      weeklyData.push({ date, completed, total });
    }
    
    return weeklyData;
  }
});

export const listProjects = query({
  args: { 
    ownerId: v.optional(v.string()),
    workspaceId: v.optional(v.id("workspaces"))
  },
  handler: async (ctx, args) => {
    if (args.workspaceId) {
      return await ctx.db
        .query("projects")
        .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
        .order("desc")
        .collect();
    } else if (args.ownerId) {
      return await ctx.db
        .query("projects")
        .withIndex("by_owner", q => q.eq("ownerId", args.ownerId))
        .order("desc")
        .collect();
    }
    return [];
  }
});

// Daily Task Templates
export const listDailyTaskTemplates = query({
  args: { ownerId: v.string() },
  handler: async (ctx, { ownerId }) => {
    return await ctx.db
      .query("dailyTaskTemplates")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
  }
});

export const upsertDailyTaskTemplate = mutation({
  args: {
    id: v.optional(v.id("dailyTaskTemplates")),
    ownerId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      // Update existing
      await ctx.db.patch(args.id, {
        title: args.title,
        description: args.description,
        priority: args.priority,
        order: args.order,
        isActive: args.isActive,
        updatedAt: Date.now(),
      });
      return args.id;
    } else {
      // Create new
      return await ctx.db.insert("dailyTaskTemplates", {
        ownerId: args.ownerId,
        title: args.title,
        description: args.description,
        priority: args.priority,
        order: args.order,
        isActive: args.isActive,
        createdAt: Date.now(),
      });
    }
  },
});

export const deleteDailyTaskTemplate = mutation({
  args: { templateId: v.id("dailyTaskTemplates") },
  handler: async (ctx, { templateId }) => {
    await ctx.db.delete(templateId);
  },
});

// Tasks by date range (for calendar)
export const tasksByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, { startDate, endDate, ownerId }) => {
    const allTasks = await ctx.db
      .query("workItems")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .filter((q) => q.eq(q.field("type"), "task"))
      .collect();

    return allTasks.filter(t => 
      t.endDate && t.endDate >= startDate && t.endDate <= endDate
    );
  }
});

// Analytics
export const getAnalytics = query({
  args: { ownerId: v.string(), days: v.number() },
  handler: async (ctx, { ownerId, days }) => {
    const projects = await ctx.db.query("projects").withIndex("by_owner", q => q.eq("ownerId", ownerId)).collect();
    
    // Get all tasks from workItems
    const allTasks = await ctx.db
      .query("workItems")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .filter((q) => q.eq(q.field("type"), "task"))
      .collect();
    
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Initialize daily completions
    const dailyCompletions: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      dailyCompletions[dateStr] = 0;
    }
    
    // Count completed tasks per day
    const doneTasks = allTasks.filter(t => t.status === "done");
    for (const task of doneTasks) {
      if (task.endDate && task.endDate >= startDateStr) {
        if (dailyCompletions.hasOwnProperty(task.endDate)) {
          dailyCompletions[task.endDate]++;
        }
      }
    }
    
    // Time per project (mock for now)
    const timeByProject: Record<string, number> = {};
    projects.forEach(p => timeByProject[p.name] = Math.floor(Math.random() * 100));
    
    return {
      totalCompleted: doneTasks.length,
      totalActive: allTasks.filter(t => t.status !== "done").length,
      dailyCompletions,
      timeByProject,
      projects: projects.length
    };
  }
});

