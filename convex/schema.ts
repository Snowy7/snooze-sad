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
    lastVisitedPage: v.optional(v.string()), // Store last visited path in workspace
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
    updatedAt: v.optional(v.number()),
  }).index("by_owner", ["ownerId"])
    .index("by_owner_and_active", ["ownerId", "isActive"]),

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
    workspaceId: v.optional(v.id("workspaces")),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    workItemId: v.optional(v.id("workItems")), // New unified work items
    userId: v.string(),
    action: v.string(), // created, updated, deleted, commented, status_changed, assigned, etc
    entityType: v.string(), // project, task, workspace, workItem, etc
    entityId: v.string(),
    field: v.optional(v.string()), // Field that was changed
    oldValue: v.optional(v.string()), // Previous value
    newValue: v.optional(v.string()), // New value
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_workspace", ["workspaceId"]).index("by_project", ["projectId"]).index("by_user", ["userId"]).index("by_work_item", ["workItemId"]),

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

  // ===== NEW UNIFIED BOARD SYSTEM =====
  // Unified work items - replacing separate projects, tasks, notes, etc.
  workItems: defineTable({
    workspaceId: v.optional(v.id("workspaces")),
    parentId: v.optional(v.id("workItems")), // For hierarchical relationships
    ownerId: v.string(), // User who created it
    type: v.string(), // project, task, milestone, subtask, note, document, daily, widget, chart
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.string()), // backlog, in_progress, in_review, stuck, done, etc.
    priority: v.optional(v.string()), // low, medium, high, critical
    assignees: v.optional(v.array(v.string())), // Multiple assignees
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    repeat: v.optional(v.string()), // For recurring tasks
    estimatedHours: v.optional(v.number()),
    trackedHours: v.optional(v.number()),
    order: v.optional(v.number()), // For sorting
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.any()), // JSON for flexible data
    isArchived: v.optional(v.boolean()),
    color: v.optional(v.string()), // For projects/categories
    content: v.optional(v.string()), // For notes content
    metadata: v.optional(v.any()), // Additional type-specific data
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_parent", ["parentId"])
    .index("by_owner", ["ownerId"])
    .index("by_type", ["type"])
    .index("by_workspace_and_type", ["workspaceId", "type"]),

  // Links between work items (dependencies, relationships)
  workItemLinks: defineTable({
    fromItemId: v.id("workItems"),
    toItemId: v.id("workItems"),
    linkType: v.string(), // depends_on, blocks, relates_to, parent_of, etc.
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_from", ["fromItemId"])
    .index("by_to", ["toItemId"]),

  // Comments on work items
  comments: defineTable({
    workItemId: v.id("workItems"),
    authorId: v.string(), // User who wrote the comment
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    isEdited: v.optional(v.boolean()),
  })
    .index("by_work_item", ["workItemId"])
    .index("by_author", ["authorId"]),

  // Checklists for work items
  checklists: defineTable({
    workItemId: v.id("workItems"),
    title: v.string(),
    items: v.array(v.object({
      id: v.string(),
      text: v.string(),
      completed: v.boolean(),
      order: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_work_item", ["workItemId"]),

  // Project-wide tags
  tags: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.string(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_name", ["projectId", "name"]),

  // Graph/Board definitions
  graphs: defineTable({
    workspaceId: v.optional(v.id("workspaces")), // Optional for personal/daily graphs
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.string(),
    type: v.string(), // dashboard, project_board, personal, daily, focus, etc.
    isDefault: v.optional(v.boolean()), // Is this the default home board?
    parentGraphId: v.optional(v.id("graphs")), // For nested sub-boards
    settings: v.optional(v.any()), // Board-specific settings (zoom, filters, etc.)
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_owner", ["ownerId"])
    .index("by_type", ["type"]),

  // Nodes on the graph/board (positioned items)
  graphNodes: defineTable({
    graphId: v.id("graphs"),
    workItemId: v.optional(v.id("workItems")), // Optional - some nodes might be pure UI elements
    type: v.string(), // task-card, note, chart, widget, sub-board, etc.
    props: v.optional(v.any()), // Node-specific properties
    position: v.object({
      x: v.number(),
      y: v.number(),
    }),
    size: v.optional(v.object({
      width: v.number(),
      height: v.number(),
    })),
    zIndex: v.optional(v.number()),
    style: v.optional(v.any()), // Custom styling
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_graph", ["graphId"])
    .index("by_work_item", ["workItemId"]),

  // Visual connections between nodes on the board
  graphEdges: defineTable({
    graphId: v.id("graphs"),
    sourceNodeId: v.id("graphNodes"),
    targetNodeId: v.id("graphNodes"),
    workItemLinkId: v.optional(v.id("workItemLinks")), // Optional link to logical relationship
    type: v.string(), // visual, dependency, flow, etc.
    style: v.optional(v.any()), // Edge styling
    createdAt: v.number(),
  })
    .index("by_graph", ["graphId"])
    .index("by_source", ["sourceNodeId"])
    .index("by_target", ["targetNodeId"]),

  // ===== LEGACY TABLES (for backward compatibility) =====
  // These tables are deprecated but kept for existing code compatibility
  // New code should use workItems instead
  
  tasks: defineTable({
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignees: v.optional(v.array(v.string())),
    dueDate: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  sprints: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    goal: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  milestones: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    status: v.optional(v.string()),
    progress: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  taskLists: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  taskAssignments: defineTable({
    taskId: v.union(v.id("tasks"), v.id("workItems")), // Support both legacy tasks and new workItems
    sprintId: v.optional(v.id("sprints")),
    milestoneId: v.optional(v.id("milestones")),
    taskListId: v.optional(v.id("taskLists")),
    assignedBy: v.optional(v.string()),
    assignedAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  })
    .index("by_task", ["taskId"])
    .index("by_sprint", ["sprintId"])
    .index("by_milestone", ["milestoneId"])
    .index("by_task_list", ["taskListId"]),
});


