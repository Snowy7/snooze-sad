import { Metadata } from "next"
import DocsClient from "./docs-client"

export const metadata: Metadata = {
  title: "Documentation – Snooze",
  description: "Guides, concepts, and interactive examples.",
}

const sections = {
  "Getting Started": [
    { 
      title: "Quick Start", 
      body: "Create an account at snooze.app/auth. You'll be prompted to create your first workspace. Workspaces are containers for projects and team members. Think of them as separate organizations or teams.",
      example: "workspace"
    },
    { 
      title: "Your First Project", 
      body: "Projects organize related tasks. Click 'New Project' in the sidebar, give it a name and color, then start adding tasks. Each task can have a title, description, due date, assignees, and labels.",
      example: "project"
    },
    { 
      title: "Command Palette", 
      body: "Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open the command palette. Search for any action, page, or project. It's the fastest way to navigate Snooze.",
      example: "command"
    },
  ],
  "Daily Tasks": [
    { 
      title: "Daily Task Templates", 
      body: "Create recurring task templates that automatically generate fresh tasks every day. Perfect for daily routines like 'Exercise', 'Check emails', or 'Review PRs'. Click the Templates button on the Daily Tasks page to manage your templates.",
      example: "task"
    },
    { 
      title: "Managing Templates", 
      body: "Templates can be toggled on/off without deleting them. When a template is active, it will create a new task for that day automatically. Inactive templates are preserved but won't generate tasks. Use the refresh button to manually regenerate tasks from templates.",
      example: "task"
    },
    { 
      title: "One-Time Tasks", 
      body: "In addition to recurring tasks from templates, you can add one-time tasks for specific days. These tasks won't repeat and are perfect for unique daily activities or reminders.",
      example: "task"
    },
  ],
  "Tasks & Projects": [
    { 
      title: "Creating Tasks", 
      body: "Tasks are the building blocks of your work. Create them from the Daily view, Project boards, or command palette. Each task supports rich descriptions, due dates, priorities (low, medium, high, critical), and assignees.",
      example: "task"
    },
    { 
      title: "Task Status", 
      body: "Tasks move through statuses: Backlog → In Progress → In Review → Stuck → Done. Drag tasks between columns on the Kanban board to update status. You can customize these statuses per project.",
      example: "status"
    },
    { 
      title: "Priorities & Labels", 
      body: "Set task priorities to indicate urgency. Use labels for categories like 'bug', 'feature', 'design'. Filter views by priority or label to focus on specific work.",
      example: "priority"
    },
  ],
  "Kanban Boards": [
    { 
      title: "Board Layout", 
      body: "Kanban boards show tasks as cards in columns by status. Drag cards within columns to reorder them. Each column shows the number of tasks. Try dragging the tasks below to see it in action!",
      example: "kanban"
    },
  ],
  "Editor & Notes": [
    { 
      title: "Notion-Style Notes", 
      body: "Create beautiful, structured notes with our Notion-inspired editor. Access notes from the sidebar. Each note has a title and rich content area. Notes auto-save as you type, with a 1-second delay after you stop typing.",
      example: "notes-intro"
    },
    { 
      title: "Block-Based Editing", 
      body: "The editor uses a block system where each paragraph, heading, list, or other element is a separate block. Hover over any block to see the drag handle (⋮⋮) and plus button (+). Drag blocks to reorder them, or click the plus to insert new blocks.",
      example: "blocks"
    },
    { 
      title: "Slash Commands", 
      body: "Type '/' anywhere to open the slash menu. This gives you quick access to all block types: headings, lists, quotes, code blocks, tables, and more. Start typing to filter commands, use arrow keys to navigate, and press Enter to insert.",
      example: "slash-menu"
    },
    { 
      title: "Rich Formatting", 
      body: "Select text to see the floating toolbar with formatting options: bold, italic, underline, strikethrough, code, highlight colors, and more. Use keyboard shortcuts for faster formatting: Cmd/Ctrl+B for bold, Cmd/Ctrl+I for italic, etc.",
      example: "formatting"
    },
    { 
      title: "Advanced Blocks", 
      body: "Insert code blocks with syntax highlighting, tables with resizable columns, task lists with checkboxes, quotes with styled borders, and horizontal dividers. Each block type has its own unique styling and interactions.",
      example: "advanced-blocks"
    },
    { 
      title: "Auto-Save & Status", 
      body: "Notes auto-save 1 second after you stop typing. Watch the status indicator in the top bar: 🟠 'Unsaved changes' appears immediately when you type, 🟡 'Saving...' shows during save, and 🟢 'Saved' confirms success. No manual save needed!",
      example: "autosave"
    },
    { 
      title: "Keyboard Navigation", 
      body: "Navigate efficiently with keyboard shortcuts: Arrow keys in slash menu, Tab to indent lists, Shift+Tab to outdent, Enter to create new blocks, Backspace at start of line to delete blocks. The editor is fully keyboard-accessible.",
      example: "keyboard"
    },
  ],
  "Calendar & Timeline": [
    { 
      title: "Calendar View", 
      body: "The calendar shows tasks on their due dates. Tasks with start and end dates span multiple days. Click any date to select it and see tasks due that day.",
      example: "calendar"
    },
    { 
      title: "Gantt Chart", 
      body: "Gantt visualizes project timelines with task bars showing duration. The red line indicates today's date. Hover over task bars to see details. Great for planning project phases.",
      example: "gantt"
    },
  ],
  "Focus & Productivity": [
    { 
      title: "Focus Sessions", 
      body: "Start a 25-minute Pomodoro session to work distraction-free. The timer counts down and shows your progress. You can pause/resume or stop the session. Try it below!",
      example: "focus"
    },
  ],
  "Collaboration": [
    { 
      title: "Workspaces", 
      body: "Workspaces contain projects and members. Create separate workspaces for different teams or clients. Switch between workspaces using the dropdown in the sidebar.",
      example: "workspace-switcher"
    },
    { 
      title: "Inviting Members", 
      body: "Go to Workspace Settings → Members → Invite. Enter email addresses and assign roles (Owner, Admin, Member, Viewer). Invites expire after 7 days.",
      example: "invite"
    },
    { 
      title: "Task Assignments", 
      body: "Assign tasks to team members from the task edit dialog. Multiple assignees are supported. Assignees receive notifications for task updates and mentions.",
      example: "assign"
    },
  ],
  "Keyboard Shortcuts": [
    { 
      title: "Essential Shortcuts", 
      body: "Master these keyboard shortcuts to navigate Snooze faster. Shortcuts work across the entire app for quick access to common actions. Hover over each shortcut to see the visual feedback.",
      example: "shortcuts"
    },
  ],
}

export default function DocsPage() {
  return <DocsClient sections={sections} />
}
