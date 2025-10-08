import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    fullName: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatar: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
    externalId: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    onboardingCompleted: v.optional(v.boolean()),
    accentColor: v.optional(v.string()), // User's preferred accent color
    role: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"]).index("by_external_id", ["externalId"]),

  workspaces: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    ownerId: v.string(), // User who created the workspace
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.string(), // External user ID from WorkOS
    role: v.string(), // owner, admin, member, viewer
    joinedAt: v.number(),
  }).index("by_workspace_id", ["workspaceId"]).index("by_user", ["userId"]).index("by_workspace_and_user", ["workspaceId", "userId"]),

  projects: defineTable({
    workspaceId: v.optional(v.id("workspaces")), // Optional for backward compatibility
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.optional(v.string()), // Keep for backward compatibility
    status: v.optional(v.string()), // active, archived, completed
    color: v.optional(v.string()),
    logo: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_workspace", ["workspaceId"]).index("by_owner", ["ownerId"]),

  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    role: v.string(), // admin, member, viewer
    addedAt: v.number(),
  }).index("by_project", ["projectId"]).index("by_user", ["userId"]).index("by_project_and_user", ["projectId", "userId"]),

  dailyTaskTemplates: defineTable({
    ownerId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.boolean(), // Can be toggled on/off
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  tasks: defineTable({
    projectId: v.optional(v.id("projects")),
    ownerId: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.string()), // backlog, in_progress, in_review, stuck, done
    priority: v.optional(v.string()), // low, medium, high, critical
    assigneeId: v.optional(v.string()),
    assignees: v.optional(v.array(v.string())), // Multiple assignees
    labels: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    milestoneId: v.optional(v.id("milestones")),
    sprintId: v.optional(v.id("sprints")),
    estimatedHours: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    isDaily: v.optional(v.boolean()),
    date: v.optional(v.string()), // for daily tasks
    templateId: v.optional(v.id("dailyTaskTemplates")), // Link to template if created from one
    order: v.optional(v.number()),
    storyPoints: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]).index("by_date", ["date"]).index("by_owner", ["ownerId"]).index("by_milestone", ["milestoneId"]).index("by_sprint", ["sprintId"]).index("by_template", ["templateId"]),
  
  subtasks: defineTable({
    taskId: v.id("tasks"),
    title: v.string(),
    completed: v.boolean(),
    order: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_task", ["taskId"]),
  
  comments: defineTable({
    taskId: v.id("tasks"),
    userId: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_task", ["taskId"]).index("by_user", ["userId"]),

  notes: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    ownerId: v.string(),
    projectId: v.optional(v.id("projects")),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]).index("by_project", ["projectId"]),

  timelogs: defineTable({
    taskId: v.string(),
    userId: v.string(),
    start: v.string(),
    end: v.optional(v.string()),
    duration: v.optional(v.number()),
  }).index("by_task", ["taskId"]).index("by_user", ["userId"]),

  habits: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    ownerId: v.string(),
    frequency: v.string(), // daily, weekly, custom
    targetDays: v.optional(v.array(v.number())), // 0-6 for days of week
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  habitLogs: defineTable({
    habitId: v.id("habits"),
    date: v.string(), // YYYY-MM-DD
    completed: v.boolean(),
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_habit", ["habitId"]).index("by_date", ["date"]).index("by_habit_and_date", ["habitId", "date"]),

  milestones: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    status: v.optional(v.string()), // planned, in_progress, completed
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  sprints: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    goal: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.string(),
    status: v.optional(v.string()), // planned, active, completed
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  invitations: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.string(), // admin, member, viewer
    invitedBy: v.string(), // User ID who sent the invite
    status: v.string(), // pending, accepted, declined, expired
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_workspace", ["workspaceId"]).index("by_email", ["email"]).index("by_token", ["token"]),

  notifications: defineTable({
    userId: v.string(),
    type: v.string(), // invitation, task_assigned, mention, comment, etc
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.any()), // Additional data based on type
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_user_and_read", ["userId", "read"]),

  activities: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    userId: v.string(),
    action: v.string(), // created, updated, deleted, commented, etc
    entityType: v.string(), // project, task, workspace, etc
    entityId: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_workspace", ["workspaceId"]).index("by_project", ["projectId"]).index("by_user", ["userId"]),

  files: defineTable({
    name: v.string(),
    url: v.string(),
    size: v.number(),
    type: v.string(),
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    uploadedBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_workspace", ["workspaceId"]).index("by_project", ["projectId"]).index("by_task", ["taskId"]),

  featureRequests: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    status: v.string(), // requested, planned, in_progress, completed, rejected
    userId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    userName: v.optional(v.string()),
    upvotes: v.number(),
    downvotes: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_status", ["status"]),

  featureVotes: defineTable({
    featureRequestId: v.id("featureRequests"),
    userId: v.string(),
    vote: v.union(v.literal("up"), v.literal("down"), v.number()), // Support legacy numeric votes
    createdAt: v.number(),
  }).index("by_feature", ["featureRequestId"]).index("by_user", ["userId"]).index("by_feature_and_user", ["featureRequestId", "userId"]),
});


