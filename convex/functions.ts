import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listDashboard = query({
  args: { ownerId: v.string(), today: v.string() },
  handler: async (ctx, { ownerId, today }) => {
    const projects = await ctx.db.query("projects").withIndex("by_owner", q => q.eq("ownerId", ownerId)).collect();
    const allTasks = await ctx.db.query("tasks").withIndex("by_date", q => q.eq("date", today)).order("desc").collect();
    const tasksToday = allTasks.filter(t => t.ownerId === ownerId).slice(0, 20);
    const allOverdueTasks = await ctx.db.query("tasks").collect();
    const overdue = allOverdueTasks.filter(t => 
      t.ownerId === ownerId && 
      t.status !== "done" && 
      t.endDate && 
      t.endDate < today
    ).slice(0, 10);
    const notes = await ctx.db.query("notes").withIndex("by_owner", q => q.eq("ownerId", ownerId)).order("desc").take(5);
    return { projects, tasksToday, overdue, notes };
  }
});

export const listProjects = query({
  args: { 
    ownerId: v.optional(v.string()),
    workspaceId: v.optional(v.id("workspaces"))
  },
  handler: async (ctx, args) => {
    // If workspaceId is provided, filter by workspace
    if (args.workspaceId) {
      return await ctx.db
        .query("projects")
        .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
        .order("desc")
        .collect();
    }
    // Otherwise, filter by owner (backward compatibility)
    if (args.ownerId) {
      return await ctx.db
        .query("projects")
        .withIndex("by_owner", q => q.eq("ownerId", args.ownerId))
        .order("desc")
        .collect();
    }
    return [];
  }
});

export const listProjectBoard = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const tasks = await ctx.db.query("tasks").withIndex("by_project", q => q.eq("projectId", projectId)).collect();
    const byStatus: Record<string, any[]> = { backlog: [], in_progress: [], done: [] };
    for (const t of tasks) {
      const s = (t.status as string) || "backlog";
      if (!byStatus[s]) byStatus[s] = [];
      byStatus[s].push(t);
    }
    Object.keys(byStatus).forEach(k => byStatus[k].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    return byStatus;
  }
});

export const createProject = mutation({
  args: { 
    name: v.string(), 
    description: v.optional(v.string()), 
    ownerId: v.string(),
    workspaceId: v.optional(v.id("workspaces")), // Optional for backward compatibility
    color: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For backward compatibility, create a default workspace if not provided
    let workspaceId = args.workspaceId;
    
    if (!workspaceId) {
      // Find or create default workspace for user
      const membership = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_user", (q) => q.eq("userId", args.ownerId))
        .first();
        
      if (membership) {
        workspaceId = membership.workspaceId;
      } else {
        // Create default workspace
        workspaceId = await ctx.db.insert("workspaces", {
          name: "Personal Workspace",
          ownerId: args.ownerId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        await ctx.db.insert("workspaceMembers", {
          workspaceId,
          userId: args.ownerId,
          role: "owner",
          joinedAt: Date.now(),
        });
      }
    }
    
    return await ctx.db.insert("projects", { 
      ...args, 
      workspaceId,
      status: "active", 
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
});

export const getProjectDetails = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) return null;
    
    const tasks = await ctx.db.query("tasks").withIndex("by_project", q => q.eq("projectId", projectId)).collect();
    const notes = await ctx.db.query("notes").withIndex("by_project", q => q.eq("projectId", projectId)).collect();
    const milestones = await ctx.db.query("milestones").withIndex("by_project", q => q.eq("projectId", projectId)).collect();
    const sprints = await ctx.db.query("sprints").withIndex("by_project", q => q.eq("projectId", projectId)).collect();
    
    return {
      project,
      stats: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === "done").length,
        inProgressTasks: tasks.filter(t => t.status === "in_progress").length,
        backlogTasks: tasks.filter(t => t.status === "backlog").length,
        totalNotes: notes.length,
        totalMilestones: milestones.length,
        completedMilestones: milestones.filter(m => m.status === "completed").length,
      },
      milestones,
      sprints,
    };
  }
});

export const upsertProject = mutation({
  args: {
    id: v.union(v.id("projects"), v.null()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      const { id, ...rest } = args;
      const updates = Object.fromEntries(Object.entries(rest).filter(([_, v]) => v !== undefined));
      await ctx.db.patch(id, updates);
      return id;
    }
    if (!args.name) throw new Error("Name is required for new projects");
    const { id, ...insertData } = args;
    return await ctx.db.insert("projects", { ...insertData, createdAt: Date.now() } as any);
  }
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    // Delete all related data
    const tasks = await ctx.db.query("tasks").withIndex("by_project", q => q.eq("projectId", id)).collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }
    const notes = await ctx.db.query("notes").withIndex("by_project", q => q.eq("projectId", id)).collect();
    for (const note of notes) {
      await ctx.db.delete(note._id);
    }
    const milestones = await ctx.db.query("milestones").withIndex("by_project", q => q.eq("projectId", id)).collect();
    for (const milestone of milestones) {
      await ctx.db.delete(milestone._id);
    }
    const sprints = await ctx.db.query("sprints").withIndex("by_project", q => q.eq("projectId", id)).collect();
    for (const sprint of sprints) {
      await ctx.db.delete(sprint._id);
    }
    await ctx.db.delete(id);
  }
});

// Milestones
export const upsertMilestone = mutation({
  args: {
    id: v.union(v.id("milestones"), v.null()),
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      const { id, ...rest } = args;
      const updates = Object.fromEntries(Object.entries(rest).filter(([_, v]) => v !== undefined));
      await ctx.db.patch(id, updates);
      return id;
    }
    if (!args.title) throw new Error("Title is required for new milestones");
    const { id, ...insertData } = args;
    return await ctx.db.insert("milestones", { ...insertData, createdAt: Date.now() } as any);
  }
});

export const deleteMilestone = mutation({
  args: { id: v.id("milestones") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  }
});

// Sprints
export const upsertSprint = mutation({
  args: {
    id: v.union(v.id("sprints"), v.null()),
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    goal: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      const { id, ...rest } = args;
      const updates = Object.fromEntries(Object.entries(rest).filter(([_, v]) => v !== undefined));
      await ctx.db.patch(id, updates);
      return id;
    }
    if (!args.name || !args.startDate || !args.endDate) throw new Error("Name and dates are required for new sprints");
    const { id, ...insertData } = args;
    return await ctx.db.insert("sprints", { ...insertData, createdAt: Date.now() } as any);
  }
});

export const deleteSprint = mutation({
  args: { id: v.id("sprints") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  }
});

export const upsertTask = mutation({
  args: {
    id: v.optional(v.id("tasks")),
    projectId: v.optional(v.id("projects")),
    ownerId: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assigneeId: v.optional(v.string()),
    labels: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    milestoneId: v.optional(v.id("milestones")),
    sprintId: v.optional(v.id("sprints")),
    estimatedHours: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    date: v.optional(v.string()),
    isDaily: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      const { id, ...rest } = args;
      // Filter out undefined values
      const updates = Object.fromEntries(Object.entries(rest).filter(([_, v]) => v !== undefined));
      await ctx.db.patch(id, updates);
      return id;
    }
    // For new tasks, title and ownerId are required
    if (!args.title) throw new Error("Title is required for new tasks");
    if (!args.ownerId) throw new Error("OwnerId is required for new tasks");
    return await ctx.db.insert("tasks", { ...args, createdAt: Date.now() } as any);
  }
});

export const moveTask = mutation({
  args: { id: v.id("tasks"), status: v.string(), order: v.number() },
  handler: async (ctx, { id, status, order }) => {
    await ctx.db.patch(id, { status, order });
  }
});

export const tasksByDate = query({
  args: { date: v.string(), ownerId: v.string() },
  handler: async (ctx, { date, ownerId }) => {
    const allTasks = await ctx.db.query("tasks").withIndex("by_date", q => q.eq("date", date)).order("desc").collect();
    return allTasks.filter(t => t.ownerId === ownerId);
  }
});

export const startTimelog = mutation({
  args: { taskId: v.string(), userId: v.string(), start: v.string() },
  handler: async (ctx, { taskId, userId, start }) => {
    return await ctx.db.insert("timelogs", { taskId, userId, start });
  }
});

export const stopTimelog = mutation({
  args: { logId: v.id("timelogs"), end: v.string() },
  handler: async (ctx, { logId, end }) => {
    const existing = await ctx.db.get(logId);
    if (!existing) return;
    const duration = (new Date(end).getTime() - new Date(existing.start as string).getTime()) / 1000;
    await ctx.db.patch(logId, { end, duration });
  }
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  }
});

export const getTask = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  }
});

export const listNotes = query({
  args: { ownerId: v.string() },
  handler: async (ctx, { ownerId }) => {
    return await ctx.db.query("notes").withIndex("by_owner", q => q.eq("ownerId", ownerId)).order("desc").collect();
  }
});

export const upsertNote = mutation({
  args: {
    id: v.union(v.id("notes"), v.null()),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    ownerId: v.string(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      const { id, ...rest } = args;
      const updates = Object.fromEntries(Object.entries(rest).filter(([_, v]) => v !== undefined));
      await ctx.db.patch(id, updates);
      return id;
    }
    if (!args.title) throw new Error("Title is required for new notes");
    const { id, ...insertData } = args;
    return await ctx.db.insert("notes", { ...insertData, createdAt: Date.now() } as any);
  }
});

export const deleteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  }
});

export const tasksByDateRange = query({
  args: { startDate: v.string(), endDate: v.string(), ownerId: v.string() },
  handler: async (ctx, { startDate, endDate, ownerId }) => {
    const allTasks = await ctx.db.query("tasks").collect();
    return allTasks.filter(t => {
      // Must belong to the owner
      if (t.ownerId !== ownerId) return false;
      // Include if task has a specific date in range
      if (t.date && t.date >= startDate && t.date <= endDate) return true;
      // Include if task's date range overlaps with query range
      if (t.startDate && t.endDate) {
        return !(t.endDate < startDate || t.startDate > endDate);
      }
      return false;
    });
  }
});

export const allActiveTasks = query({
  args: { ownerId: v.string() },
  handler: async (ctx, { ownerId }) => {
    // Get all projects owned by user
    const projects = await ctx.db.query("projects").withIndex("by_owner", q => q.eq("ownerId", ownerId)).collect();
    const projectIds = projects.map(p => p._id);
    
    // Get all tasks from those projects that are not done
    const tasks = await ctx.db.query("tasks").collect();
    return tasks.filter(t => 
      t.ownerId === ownerId &&
      ((t.projectId && projectIds.includes(t.projectId) && t.status !== "done") ||
      (t.isDaily && t.status !== "done"))
    );
  }
});

// Habits
export const listHabits = query({
  args: { ownerId: v.string() },
  handler: async (ctx, { ownerId }) => {
    return await ctx.db.query("habits").withIndex("by_owner", q => q.eq("ownerId", ownerId)).order("desc").collect();
  }
});

export const upsertHabit = mutation({
  args: {
    id: v.union(v.id("habits"), v.null()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    frequency: v.optional(v.string()),
    targetDays: v.optional(v.array(v.number())),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      const { id, ...rest } = args;
      const updates = Object.fromEntries(Object.entries(rest).filter(([_, v]) => v !== undefined));
      await ctx.db.patch(id, updates);
      return id;
    }
    if (!args.title) throw new Error("Title is required for new habits");
    const { id, ...insertData } = args;
    return await ctx.db.insert("habits", { ...insertData, createdAt: Date.now() } as any);
  }
});

export const deleteHabit = mutation({
  args: { id: v.id("habits") },
  handler: async (ctx, { id }) => {
    // Delete all logs for this habit
    const logs = await ctx.db.query("habitLogs").withIndex("by_habit", q => q.eq("habitId", id)).collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
    await ctx.db.delete(id);
  }
});

export const getHabitLogs = query({
  args: { habitId: v.id("habits"), startDate: v.string(), endDate: v.string() },
  handler: async (ctx, { habitId, startDate, endDate }) => {
    const logs = await ctx.db.query("habitLogs").withIndex("by_habit", q => q.eq("habitId", habitId)).collect();
    return logs.filter(l => l.date >= startDate && l.date <= endDate);
  }
});

export const toggleHabitLog = mutation({
  args: { habitId: v.id("habits"), date: v.string() },
  handler: async (ctx, { habitId, date }) => {
    const existing = await ctx.db.query("habitLogs")
      .withIndex("by_habit_and_date", q => q.eq("habitId", habitId).eq("date", date))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { completed: !existing.completed });
      return existing._id;
    }
    
    return await ctx.db.insert("habitLogs", {
      habitId,
      date,
      completed: true,
      createdAt: Date.now()
    });
  }
});

// Analytics
export const getAnalytics = query({
  args: { ownerId: v.string(), days: v.number() },
  handler: async (ctx, { ownerId, days }) => {
    const projects = await ctx.db.query("projects").withIndex("by_owner", q => q.eq("ownerId", ownerId)).collect();
    const projectIds = projects.map(p => p._id);
    const allTasks = await ctx.db.query("tasks").collect();
    const tasks = allTasks.filter(t => t.ownerId === ownerId && t.projectId && projectIds.includes(t.projectId));
    
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    // Tasks completed per day
    const dailyCompletions: Record<string, number> = {};
    const doneTasks = tasks.filter(t => t.status === "done");
    
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      dailyCompletions[dateStr] = 0;
    }
    
    // Time per project
    const timeByProject: Record<string, number> = {};
    projects.forEach(p => timeByProject[p.name] = 0);
    
    const timelogs = await ctx.db.query("timelogs").collect();
    for (const log of timelogs) {
      const task = tasks.find(t => t._id === log.taskId);
      if (task && task.projectId) {
        const project = projects.find(p => p._id === task.projectId);
        if (project && log.duration) {
          timeByProject[project.name] = (timeByProject[project.name] || 0) + log.duration;
        }
      }
    }
    
    return {
      totalCompleted: doneTasks.length,
      totalActive: tasks.filter(t => t.status !== "done").length,
      dailyCompletions,
      timeByProject,
      projects: projects.length
    };
  }
});


