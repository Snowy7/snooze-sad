"use client"

import { TodayCard } from "@/components/app/today-card";
import { OverdueList } from "@/components/app/overdue-list";
import { CalendarNow } from "@/components/app/calendar-now";
import { ProgressMini } from "@/components/app/progress-mini";
import { RecentNotes } from "@/components/app/recent-notes";

export function InteractivePreview() {
  return (
    <section id="preview" className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Mini Workspace</h2>
          <p className="mt-3 text-muted-foreground">A focused snapshot of your day with tasks, calendar, progress, and notes</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Column 1: Today & Overdue */}
          <div className="space-y-6">
            <TodayCard tasks={[
              { id: "t1", title: "Write project brief", due: "Today" },
              { id: "t2", title: "Review PR #128", due: "Today" },
              { id: "t3", title: "Plan sprint backlog" },
            ]} />
            <OverdueList items={[
              { id: "o1", title: "Finalize Q3 roadmap", due: "2d" },
              { id: "o2", title: "Email contractor NDA", due: "5d" },
            ]} />
          </div>

          {/* Column 2: Calendar & Progress */}
          <div className="space-y-6">
            <CalendarNow nextEvent={{ title: "Standup with team", time: "10:00 AM" }} />
            <ProgressMini completed={7} total={10} />
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Focus Timer</span>
                <span className="text-muted-foreground">25:00</span>
              </div>
              <div className="mt-3 h-2 rounded bg-muted">
                <div className="h-2 rounded bg-red-500" style={{ width: `30%` }} />
              </div>
            </div>
          </div>

          {/* Column 3: Notes */}
          <div className="space-y-6">
            <RecentNotes notes={[
              { id: "n1", title: "Meeting notes – product strategy", snippet: "Define north-star metric and align KPIs across teams." },
              { id: "n2", title: "Ideas – onboarding", snippet: "Simplify sign-up, reduce fields, progressive profile completion." },
              { id: "n3", title: "Docs outline", snippet: "Intro, quick start, concepts, API, recipes, troubleshooting." },
            ]} />
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium">Quick Actions</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <button className="rounded-md border px-3 py-2 hover:bg-red-500/5 transition-colors">New Task</button>
                <button className="rounded-md border px-3 py-2 hover:bg-red-500/5 transition-colors">New Project</button>
                <button className="rounded-md border px-3 py-2 hover:bg-red-500/5 transition-colors">Start Focus</button>
                <button className="rounded-md border px-3 py-2 hover:bg-red-500/5 transition-colors">Open Notes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
