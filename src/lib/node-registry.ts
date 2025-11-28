/**
 * Node Registry System
 * Defines which node types are available for each page/context
 */

export type NodeCategory = "universal" | "personal" | "team" | "daily" | "calendar" | "projects" | "notes" | "analytics"

export interface NodeDefinition {
  id: string
  type: string
  label: string
  description: string
  icon: string
  categories: NodeCategory[]
  createProps?: (context: any) => any
  defaultSize?: { width: number; height: number }
}

export const NODE_DEFINITIONS: NodeDefinition[] = [
  // Universal Nodes (available everywhere)
  {
    id: "note",
    type: "note",
    label: "Note",
    description: "Capture ideas and information",
    icon: "FileText",
    categories: ["universal"],
    defaultSize: { width: 320, height: 200 },
  },
  
  // Personal Dashboard Nodes
  {
    id: "personal-stats",
    type: "widget",
    label: "Personal Stats",
    description: "Your productivity statistics",
    icon: "TrendingUp",
    categories: ["personal"],
    createProps: (context) => ({ widgetType: "stats", ownerId: context.ownerId }),
    defaultSize: { width: 280, height: 240 },
  },
  {
    id: "personal-goal",
    type: "widget",
    label: "Goal Tracker",
    description: "Track your personal goals",
    icon: "Target",
    categories: ["personal"],
    createProps: (context) => ({ widgetType: "goal", ownerId: context.ownerId }),
    defaultSize: { width: 280, height: 220 },
  },
  {
    id: "personal-activity",
    type: "widget",
    label: "Activity Feed",
    description: "Recent activity",
    icon: "Activity",
    categories: ["personal"],
    createProps: (context) => ({ widgetType: "activity", ownerId: context.ownerId }),
    defaultSize: { width: 340, height: 220 },
  },
  {
    id: "shortcuts",
    type: "shortcuts",
    label: "Keyboard Shortcuts",
    description: "Quick reference guide",
    icon: "Keyboard",
    categories: ["personal"],
    defaultSize: { width: 440, height: 320 },
  },
  {
    id: "quick-actions",
    type: "quick-actions",
    label: "Quick Actions",
    description: "Fast access to common tasks",
    icon: "Zap",
    categories: ["personal"],
    createProps: (context) => ({ actionType: "personal" }),
    defaultSize: { width: 360, height: 300 },
  },
  
  // Team Dashboard Nodes
  {
    id: "team-stats",
    type: "team-stats",
    label: "Team Stats",
    description: "Workspace statistics overview",
    icon: "BarChart3",
    categories: ["team"],
    defaultSize: { width: 520, height: 280 },
  },
  {
    id: "project-list",
    type: "project-list",
    label: "Project List",
    description: "Quick access to all projects",
    icon: "FolderKanban",
    categories: ["team"],
    defaultSize: { width: 500, height: 280 },
  },
  {
    id: "team-activity",
    type: "widget",
    label: "Team Activity",
    description: "Recent team updates",
    icon: "Activity",
    categories: ["team"],
    createProps: (context) => ({ widgetType: "activity", ownerId: context.ownerId }),
    defaultSize: { width: 520, height: 300 },
  },
  {
    id: "team-members",
    type: "team-members",
    label: "Team Members",
    description: "Workspace team overview",
    icon: "Users",
    categories: ["team"],
    defaultSize: { width: 500, height: 300 },
  },
  {
    id: "workspace-progress",
    type: "workspace-progress",
    label: "Workspace Progress",
    description: "Project completion trends",
    icon: "TrendingUp",
    categories: ["team"],
    defaultSize: { width: 520, height: 280 },
  },
  {
    id: "quick-actions-team",
    type: "quick-actions",
    label: "Quick Actions",
    description: "Fast access to team actions",
    icon: "Zap",
    categories: ["team"],
    createProps: (context) => ({ actionType: "team" }),
    defaultSize: { width: 500, height: 280 },
  },
  {
    id: "team-task",
    type: "task-card",
    label: "Task Card",
    description: "Track team tasks and assignments",
    icon: "CheckCircle2",
    categories: ["team"],
    defaultSize: { width: 320, height: 200 },
  },
  {
    id: "project-shortcut",
    type: "project-shortcut",
    label: "Project Shortcut",
    description: "Quick access to projects",
    icon: "FolderKanban",
    categories: ["team", "projects"],
    defaultSize: { width: 320, height: 180 },
  },
  {
    id: "project-card",
    type: "project-card",
    label: "Project Card",
    description: "Detailed project overview card",
    icon: "FolderKanban",
    categories: ["projects"],
    defaultSize: { width: 320, height: 240 },
  },
  
  // Project Board Nodes
  {
    id: "project-milestones",
    type: "project-milestones",
    label: "Milestones",
    description: "Project milestones overview",
    icon: "Flag",
    categories: ["project"],
    defaultSize: { width: 420, height: 280 },
  },
  {
    id: "project-sprints",
    type: "project-sprints",
    label: "Sprints",
    description: "Sprint management",
    icon: "Zap",
    categories: ["project"],
    defaultSize: { width: 420, height: 280 },
  },
  {
    id: "project-backlog",
    type: "project-backlog",
    label: "Backlog",
    description: "Task backlog",
    icon: "Inbox",
    categories: ["project"],
    defaultSize: { width: 420, height: 320 },
  },
  {
    id: "project-analytics",
    type: "project-analytics",
    label: "Analytics",
    description: "Project insights and metrics",
    icon: "BarChart3",
    categories: ["project"],
    defaultSize: { width: 420, height: 320 },
  },
  {
    id: "project-team",
    type: "project-team",
    label: "Team",
    description: "Team members overview",
    icon: "Users",
    categories: ["project"],
    defaultSize: { width: 360, height: 280 },
  },
  {
    id: "project-activity",
    type: "project-activity",
    label: "Activity",
    description: "Recent project activity",
    icon: "Activity",
    categories: ["project"],
    defaultSize: { width: 360, height: 320 },
  },
  
  // Daily Tasks Page Nodes
  {
    id: "daily-checklist",
    type: "daily-checklist",
    label: "Daily Checklist",
    description: "Today's task list",
    icon: "ListChecks",
    categories: ["daily"],
    defaultSize: { width: 340, height: 400 },
  },
  {
    id: "daily-routine",
    type: "daily-routine",
    label: "Morning Routine",
    description: "Start your day right",
    icon: "Coffee",
    categories: ["daily"],
    defaultSize: { width: 300, height: 320 },
  },
  {
    id: "daily-focus",
    type: "daily-focus",
    label: "Focus Time",
    description: "Deep work session tracker",
    icon: "Timer",
    categories: ["daily"],
    defaultSize: { width: 280, height: 240 },
  },
  {
    id: "daily-routines",
    type: "daily-routines",
    label: "Daily Routines",
    description: "Manage and track daily routines",
    icon: "CheckSquare",
    categories: ["daily"],
    defaultSize: { width: 360, height: 320 },
  },
  {
    id: "calendar-widget",
    type: "calendar-widget",
    label: "Calendar",
    description: "Month view calendar",
    icon: "CalendarDays",
    categories: ["calendar"],
    defaultSize: { width: 360, height: 400 },
  },
  {
    id: "upcoming-tasks",
    type: "upcoming-tasks",
    label: "Upcoming Tasks",
    description: "View upcoming tasks and deadlines",
    icon: "Clock",
    categories: ["calendar"],
    defaultSize: { width: 340, height: 380 },
  },
  {
    id: "productivity-chart",
    type: "productivity-chart",
    label: "Productivity Chart",
    description: "Weekly productivity trends",
    icon: "TrendingUp",
    categories: ["analytics"],
    defaultSize: { width: 450, height: 300 },
  },
  {
    id: "time-distribution",
    type: "time-distribution",
    label: "Time Distribution",
    description: "How you spend your time",
    icon: "PieChart",
    categories: ["analytics"],
    defaultSize: { width: 340, height: 340 },
  },
]

/**
 * Get available nodes for a specific category/page
 */
export function getNodesForCategory(category: NodeCategory): NodeDefinition[] {
  return NODE_DEFINITIONS.filter(node => 
    node.categories.includes(category) || node.categories.includes("universal")
  )
}

/**
 * Get node definition by ID
 */
export function getNodeDefinition(id: string): NodeDefinition | undefined {
  return NODE_DEFINITIONS.find(node => node.id === id)
}

/**
 * Get node definition by type
 */
export function getNodeDefinitionByType(type: string): NodeDefinition | undefined {
  return NODE_DEFINITIONS.find(node => node.type === type)
}

