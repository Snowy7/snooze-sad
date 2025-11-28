/**
 * Default node configurations for personal and team boards
 */

export interface DefaultNode {
  type: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  workItem?: {
    type: string
    title: string
    content?: string
  }
  props?: any
}

export const personalDefaultNodes: DefaultNode[] = [
  // Row 1: Welcome & Shortcuts
  {
    type: "note",
    position: { x: 40, y: 40 },
    size: { width: 480, height: 320 },
    workItem: {
      type: "note",
      title: "Welcome to Your Personal Space",
      content: "Your personal productivity hub!\n\nThis is completely separate from team workspaces. Track your personal tasks, notes, goals, and daily routines here.\n\n🎯 Getting Started:\nDouble-click anywhere to create new items. Drag to move, resize from corners.",
    },
  },
  {
    type: "shortcuts",
    position: { x: 560, y: 40 },
    size: { width: 440, height: 320 },
  },
  // Row 2: Daily Tasks & Quick Actions
  {
    type: "note",
    position: { x: 40, y: 400 },
    size: { width: 380, height: 300 },
    workItem: {
      type: "note",
      title: "Today's Tasks",
      content: "☀️ Daily Focus:\n\n• Morning routine\n• Check emails\n• Work on main project\n• Review progress\n\nUse the Daily tab for recurring tasks and routines.",
    },
  },
  {
    type: "quick-actions",
    position: { x: 460, y: 400 },
    size: { width: 360, height: 300 },
    props: { actionType: "personal" },
  },
  {
    type: "note",
    position: { x: 860, y: 400 },
    size: { width: 340, height: 300 },
    workItem: {
      type: "note",
      title: "Personal Goals 2024",
      content: "🎯 My Goals:\n\n• Learn new skills\n• Improve productivity\n• Maintain work-life balance\n• Exercise regularly\n• Read 12 books\n\nTrack progress weekly!",
    },
  },
  // Row 3: Widgets & Notes
  {
    type: "widget",
    position: { x: 40, y: 740 },
    size: { width: 360, height: 240 },
    props: { widgetType: "stats" },
  },
  {
    type: "widget",
    position: { x: 440, y: 740 },
    size: { width: 340, height: 240 },
    props: { widgetType: "goal" },
  },
  {
    type: "note",
    position: { x: 820, y: 740 },
    size: { width: 380, height: 240 },
    workItem: {
      type: "note",
      title: "Ideas & Inspiration",
      content: "💡 Quick Thoughts:\n\n• Project ideas\n• Learning resources\n• Creative inspiration\n• Random thoughts\n\nCapture everything here!",
    },
  },
  // Row 4: Activity & Planning
  {
    type: "widget",
    position: { x: 40, y: 1020 },
    size: { width: 740, height: 220 },
    props: { widgetType: "activity" },
  },
  {
    type: "note",
    position: { x: 820, y: 1020 },
    size: { width: 380, height: 220 },
    workItem: {
      type: "note",
      title: "Week Planning",
      content: "📅 This Week:\n\nMon:\nTue:\nWed:\nThu:\nFri:\n\nPlan your week ahead!",
    },
  },
]

export const teamDefaultNodes: DefaultNode[] = [
  // Row 1: Team Overview
  {
    type: "note",
    position: { x: 40, y: 40 },
    size: { width: 480, height: 300 },
    workItem: {
      type: "note",
      title: "Team Workspace",
      content: "Welcome to your team's collaborative space!\n\nThis board is shared with all team members. Use it to coordinate, track projects, and share updates.\n\n💡 Tip: Click the Projects tab to create and manage team projects.",
    },
  },
  {
    type: "widget",
    position: { x: 560, y: 40 },
    size: { width: 400, height: 300 },
    props: { widgetType: "activity" },
  },
  // Row 2: Team Projects & Meetings
  {
    type: "note",
    position: { x: 40, y: 380 },
    size: { width: 400, height: 280 },
    workItem: {
      type: "note",
      title: "Active Projects",
      content: "📁 Team Projects:\n\n• Use the Projects sidebar to create new projects\n• Drag project shortcuts to this board\n• Track milestones and deadlines\n• Assign tasks to team members\n\nDouble-click to add project cards here.",
    },
  },
  {
    type: "note",
    position: { x: 480, y: 380 },
    size: { width: 380, height: 280 },
    workItem: {
      type: "note",
      title: "Team Meetings",
      content: "📅 Upcoming Meetings:\n\n• Weekly standup - Every Monday 10AM\n• Sprint planning - Every other Friday\n• Retrospective - End of each sprint\n\nAdd meeting notes and action items here.",
    },
  },
  // Row 3: Resources & Goals
  {
    type: "note",
    position: { x: 40, y: 700 },
    size: { width: 380, height: 260 },
    workItem: {
      type: "note",
      title: "Team Resources",
      content: "🔗 Quick Links:\n\n• Team documentation\n• Design files\n• Development guidelines\n• Brand assets\n\nAdd your team's important links and resources here.",
    },
  },
  {
    type: "note",
    position: { x: 460, y: 700 },
    size: { width: 400, height: 260 },
    workItem: {
      type: "note",
      title: "Team Goals - Q1 2024",
      content: "🎯 Quarterly Objectives:\n\n• Launch new feature set\n• Improve response time by 30%\n• Expand user base by 50%\n• Complete security audit\n\nTrack progress and update weekly.",
    },
  },
]

