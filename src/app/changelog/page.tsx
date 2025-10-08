import { MarketingNavbar } from "@/components/marketing/navbar"
import { Check } from "lucide-react"

export const metadata = {
  title: "Changelog – Snooze",
  description: "Product updates with dates and highlights.",
}

const entries = [
  {
    date: "2025-10-08",
    version: "v2.0.0",
    title: "Notion-Style Editor & Production Ready",
    items: [
      "Complete editor rewrite with block-based architecture",
      "Slash menu with 15+ block types (headings, lists, tables, code, quotes, etc.)",
      "Drag and drop blocks with visual drop cursor",
      "Floating toolbar with rich formatting (bold, italic, underline, highlight colors)",
      "Smart auto-save with 1-second debounce and status indicators (🟠 Unsaved → 🟡 Saving → 🟢 Saved)",
      "Tables with resizable columns and full selection support",
      "Task lists with interactive checkboxes",
      "Code blocks with proper syntax highlighting and styling",
      "Keyboard navigation throughout (arrow keys, Tab, Enter, Esc)",
      "Click outside to close slash menu",
      "Slash character handling (keeps '/' unless command selected)",
      "Production-ready error handling and loading states",
      "OKLCH color system with proper transparency support",
      "Horizontal Notion-style layout with dropdown note selector"
    ],
  },
  {
    date: "2025-10-07",
    version: "v1.4.0",
    title: "Marketing site & documentation",
    items: [
      "Complete marketing website with features, pricing, and roadmap pages",
      "Interactive documentation with 7 sections and live examples",
      "Comprehensive editor documentation with interactive demos",
      "Blog platform for updates and guides",
      "Support center with comprehensive FAQs",
      "Cookie policy and legal pages",
      "Enhanced changelog with timeline visualization"
    ],
  },
  {
    date: "2025-10-01",
    version: "v1.3.0",
    title: "Gantt improvements & calendar spans",
    items: [
      "Sticky task names and current day in Gantt chart",
      "Minimum chart height with improved z-indexing",
      "Tasks now span across start and end dates on calendar",
      "Auto-scroll to current day on Gantt load",
      "Improved task bar visibility and interactions"
    ],
  },
  {
    date: "2025-09-15",
    version: "v1.2.0",
    title: "Editor upgrades & slash menu",
    items: [
      "Notion-like slash commands for rapid content insertion",
      "Left gutter with add and drag controls for blocks",
      "Debounced autosave to prevent constant saving",
      "Dark-mode optimized highlight colors (12 variants)",
      "Keyboard navigation in slash menu",
      "Visual feedback for dragging blocks"
    ],
  },
  {
    date: "2025-08-20",
    version: "v1.1.0",
    title: "Collaboration & workspaces",
    items: [
      "Workspace creation and member management",
      "Invite team members via email",
      "Task assignments and owner tracking",
      "Workspace-level analytics and dashboards",
      "Activity notifications and mentions",
      "Project access controls and permissions"
    ],
  },
  {
    date: "2025-08-10",
    version: "v1.0.5",
    title: "Kanban & project enhancements",
    items: [
      "Drag-and-drop across Kanban columns",
      "Project color coding and visual hierarchy",
      "Label system for task categorization",
      "Overdue task highlighting",
      "Task cards with rich metadata display"
    ],
  },
  {
    date: "2025-07-25",
    version: "v1.0.3",
    title: "Focus mode & productivity",
    items: [
      "Pomodoro-style focus sessions (25 min)",
      "Automatic break reminders",
      "Focus streak tracking",
      "Session history and analytics",
      "Gentle notification sounds"
    ],
  },
  {
    date: "2025-07-15",
    version: "v1.0.1",
    title: "Notes & rich editing",
    items: [
      "Rich text editor with formatting toolbar",
      "Markdown shortcuts support",
      "Image uploads and embeds",
      "Link previews and formatting",
      "Auto-save draft protection"
    ],
  },
  {
    date: "2025-07-01",
    version: "v1.0.0",
    title: "Initial release",
    items: [
      "Core task management with priorities and due dates",
      "Project organization with Kanban boards",
      "Calendar view for task scheduling",
      "Dashboard with daily overview",
      "User authentication and profiles",
      "Dark mode with system sync",
      "Responsive mobile-friendly design"
    ],
  },
]

export default function ChangelogPage() {
  return (
    <>
      <MarketingNavbar />
      <main className="min-h-screen bg-background">
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
            <p className="mt-3 text-muted-foreground">Every update, improvement, and fix we've shipped.</p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-6 py-16">
            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[33px] top-0 bottom-0 w-px bg-border" />
              
              {/* Entries */}
              <div className="space-y-12">
                {entries.map((e, idx) => (
                  <div key={e.date} className="relative pl-16">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1 w-[68px] flex items-center justify-center">
                      <div className="h-4 w-4 rounded-full border-4 border-background bg-blue-500 ring-4 ring-blue-500/20" />
                    </div>
                    
                    {/* Content card */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold">{e.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              {e.version}
                            </span>
                            <span className="text-sm text-muted-foreground">{e.date}</span>
                          </div>
                        </div>
                      </div>
                      
                      <ul className="mt-4 space-y-2">
                        {e.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
