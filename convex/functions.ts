import { Id } from "./_generated/dataModel";
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

export const getWeeklyProgress = query({
  args: { ownerId: v.string(), dates: v.array(v.string()) },
  handler: async (ctx, { ownerId, dates }) => {
    const weeklyData = [];
    
    for (const date of dates) {
      // Get all tasks for this date
      const allTasksForDate = await ctx.db
        .query("tasks")
        .withIndex("by_date", q => q.eq("date", date))
        .collect();
      
      const userTasks = allTasksForDate.filter(t => t.ownerId === ownerId);
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
    
    // Get all subtasks for these tasks
    const allSubtasks = await ctx.db.query("subtasks").collect();
    
    // Get all comments for count
    const allComments = await ctx.db.query("comments").collect();
    
    // Get all users for assignee info
    const allUsers = await ctx.db.query("users").collect();
    
    // Enrich tasks with subtask info and assignee details
    const enrichedTasks = tasks.map(task => {
      const subtasks = allSubtasks.filter(s => s.taskId === task._id);
      const comments = allComments.filter(c => c.taskId === task._id);
      
      // Get assignee user details
      const assigneeDetails = task.assignees?.map(userId => {
        const user = allUsers.find(u => u.externalId === userId);
        return user ? {
          id: user.externalId,
          name: user.fullName || user.firstName || user.email,
          avatar: user.profilePictureUrl || user.avatar,
        } : null;
      }).filter(Boolean) || [];
      
      return {
        ...task,
        subtasksTotal: subtasks.length,
        subtasksCompleted: subtasks.filter(s => s.completed).length,
        commentsCount: comments.length,
        assigneeDetails,
      };
    });
    
    const byStatus: Record<string, any[]> = { 
      backlog: [], 
      in_progress: [], 
      in_review: [],
      stuck: [],
      done: [] 
    };
    
    for (const t of enrichedTasks) {
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
    
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity ? (identity.subject || identity.tokenIdentifier) : null;
    
    const tasks = await ctx.db.query("tasks").withIndex("by_project", q => q.eq("projectId", projectId)).collect();
    const notes = await ctx.db.query("notes").withIndex("by_project", q => q.eq("projectId", projectId)).collect();
    const milestones = await ctx.db.query("milestones").withIndex("by_project", q => q.eq("projectId", projectId)).collect();
    const sprints = await ctx.db.query("sprints").withIndex("by_project", q => q.eq("projectId", projectId)).collect();
    
    // Get user's role in the workspace if project has a workspace
    let userRole = "owner"; // default for personal projects or project owners
    
    // Check if user is the project owner
    const isProjectOwner = project.ownerId === userId;
    
    if (project.workspaceId && !isProjectOwner) {
      // Only check workspace membership if project has a workspace and user is not the owner
      if (userId) {
        const membership = await ctx.db
          .query("workspaceMembers")
          .withIndex("by_workspace_and_user", (q) => 
            q.eq("workspaceId", project.workspaceId as Id<"workspaces">).eq("userId", userId)
          )
          .unique();
        
        if (membership) {
          userRole = membership.role;
        } else {
          // Not a workspace member and not the owner - return minimal info
          userRole = "none";
        }
      }
    }
    
    return {
      project,
      userRole,
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
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      const { id, ...rest } = args;
      const updates = Object.fromEntries(Object.entries(rest).filter(([_, v]) => v !== undefined));
      await ctx.db.patch(id, updates);
      return id;
    }
    if (!args.name) throw new Error("Name is required for new projects");
    if (!args.workspaceId) throw new Error("Workspace is required for new projects");
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
    assignees: v.optional(v.array(v.string())),
    labels: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    milestoneId: v.optional(v.id("milestones")),
    sprintId: v.optional(v.id("sprints")),
    estimatedHours: v.optional(v.number()),
    storyPoints: v.optional(v.number()),
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
      await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
      return id;
    }
    // For new tasks, title is required
    if (!args.title) throw new Error("Title is required for new tasks");
    
    // Either ownerId (for personal tasks) OR projectId (for project tasks) must be provided
    if (!args.ownerId && !args.projectId) {
      throw new Error("Either ownerId or projectId is required for new tasks");
    }
    
    return await ctx.db.insert("tasks", { ...args, createdAt: Date.now(), updatedAt: Date.now() } as any);
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

// Daily Task Templates
export const listDailyTaskTemplates = query({
  args: { ownerId: v.string() },
  handler: async (ctx, { ownerId }) => {
    return await ctx.db
      .query("dailyTaskTemplates")
      .withIndex("by_owner", q => q.eq("ownerId", ownerId))
      .order("asc")
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
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      const { id, ...rest } = args;
      await ctx.db.patch(id, rest);
      return id;
    }
    return await ctx.db.insert("dailyTaskTemplates", {
      ...args,
      isActive: args.isActive ?? true,
      createdAt: Date.now(),
    } as any);
  }
});

export const deleteDailyTaskTemplate = mutation({
  args: { id: v.id("dailyTaskTemplates") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  }
});

// Generate daily tasks from templates for a given date
export const generateDailyTasks = mutation({
  args: { ownerId: v.string(), date: v.string() },
  handler: async (ctx, { ownerId, date }) => {
    // Check if tasks already exist for this date
    const existingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_date", q => q.eq("date", date))
      .collect();
    
    const userExistingTasks = existingTasks.filter(t => 
      t.ownerId === ownerId && t.isDaily && t.templateId
    );
    
    // Get all active templates
    const templates = await ctx.db
      .query("dailyTaskTemplates")
      .withIndex("by_owner", q => q.eq("ownerId", ownerId))
      .collect();
    
    const activeTemplates = templates.filter(t => t.isActive);
    
    // Create tasks for templates that don't have tasks yet
    const createdTasks = [];
    for (const template of activeTemplates) {
      const hasTask = userExistingTasks.some(t => t.templateId === template._id);
      if (!hasTask) {
        const taskId = await ctx.db.insert("tasks", {
          ownerId,
          title: template.title,
          description: template.description,
          priority: template.priority,
          status: "pending",
          isDaily: true,
          date,
          templateId: template._id,
          order: template.order,
          createdAt: Date.now(),
        });
        createdTasks.push(taskId);
      }
    }
    
    return { created: createdTasks.length };
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
    
    // Include all user tasks (both project tasks and personal tasks)
    const tasks = allTasks.filter(t => 
      t.ownerId === ownerId || (t.projectId && projectIds.includes(t.projectId))
    );
    
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
    // For daily tasks, use their date field
    // For other tasks, count them on the day they were marked as done (using updatedAt if available)
    const doneTasks = tasks.filter(t => t.status === "done");
    for (const task of doneTasks) {
      let dateToCount: string | null = null;
      
      if (task.date && task.isDaily) {
        // Daily task - use the date field
        dateToCount = task.date;
      } else if (task.updatedAt) {
        // Use updatedAt if available (when task was last modified/completed)
        const updatedDate = new Date(task.updatedAt).toISOString().split('T')[0];
        if (updatedDate >= startDateStr) {
          dateToCount = updatedDate;
        }
      } else if (task.endDate) {
        // Fallback to endDate if no updatedAt
        dateToCount = task.endDate.split('T')[0];
      }
      
      if (dateToCount && dailyCompletions.hasOwnProperty(dateToCount)) {
        dailyCompletions[dateToCount]++;
      }
    }
    
    // Time per project
    const timeByProject: Record<string, number> = {};
    projects.forEach(p => timeByProject[p.name] = 0);
    
    const timelogs = await ctx.db.query("timelogs").collect();
    const userTimelogs = timelogs.filter(log => log.userId === ownerId);
    
    for (const log of userTimelogs) {
      if (log.duration) {
        const task = allTasks.find(t => t._id === log.taskId);
        if (task?.projectId) {
          const project = projects.find(p => p._id === task.projectId);
          if (project) {
            timeByProject[project.name] = (timeByProject[project.name] || 0) + log.duration;
          }
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

// Subtasks
export const listSubtasks = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const subtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_task", q => q.eq("taskId", taskId))
      .collect();
    return subtasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
});

export const addSubtask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subtasks", {
      ...args,
      completed: false,
      createdAt: Date.now(),
    });
  }
});

export const toggleSubtask = mutation({
  args: { id: v.id("subtasks") },
  handler: async (ctx, { id }) => {
    const subtask = await ctx.db.get(id);
    if (!subtask) return;
    await ctx.db.patch(id, { completed: !subtask.completed });
  }
});

export const updateSubtask = mutation({
  args: {
    id: v.id("subtasks"),
    title: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  }
});

export const deleteSubtask = mutation({
  args: { id: v.id("subtasks") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  }
});

// Comments
export const listComments = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_task", q => q.eq("taskId", taskId))
      .collect();
    
    // Get user info for each comment
    const users = await ctx.db.query("users").collect();
    
    return comments.map(comment => {
      const user = users.find(u => u.externalId === comment.userId);
      return {
        ...comment,
        user: user ? {
          name: user.fullName || user.firstName || user.email,
          avatar: user.profilePictureUrl || user.avatar,
        } : null
      };
    }).sort((a, b) => b.createdAt - a.createdAt);
  }
});

export const addComment = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("comments", {
      ...args,
      createdAt: Date.now(),
    });
  }
});

export const updateComment = mutation({
  args: {
    id: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, { id, content }) => {
    await ctx.db.patch(id, { content, updatedAt: Date.now() });
  }
});

export const deleteComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  }
});

// Get workspace members for assignment
export const getWorkspaceMembers = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_id", q => q.eq("workspaceId", workspaceId))
      .collect();
    
    // Get user details for each member
    const users = await ctx.db.query("users").collect();
    
    return members.map(member => {
      const user = users.find(u => u.externalId === member.userId);
      return {
        ...member,
        user: user ? {
          id: user.externalId,
          name: user.fullName || user.firstName || user.email,
          email: user.email,
          avatar: user.profilePictureUrl || user.avatar,
        } : null
      };
    }).filter(m => m.user !== null);
  }
});


