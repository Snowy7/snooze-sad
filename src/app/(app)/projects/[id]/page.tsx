"use client"

import { use, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Settings, LayoutGrid, List, Calendar, BarChart3 } from "lucide-react"
import Link from "next/link"
import { ProjectKanban } from "@/components/project/project-kanban"
import { ProjectList } from "@/components/project/project-list"
import { ProjectCalendar } from "@/components/project/project-calendar"
import { ProjectGantt } from "@/components/project/project-gantt"
import { ProjectNotes } from "@/components/project/project-notes"
import { ProjectMilestones } from "@/components/project/project-milestones"
import { ProjectSettings } from "@/components/project/project-settings"

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const details = useQuery(api.functions.getProjectDetails, { projectId: id as any })
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "calendar" | "gantt">("kanban")

  if (!details) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  const { project, stats, milestones, sprints, userRole } = details
  const isViewer = userRole === "viewer"

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Projects
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Tasks</div>
          <div className="text-2xl font-bold mt-1">{stats.totalTasks}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold mt-1">{stats.completedTasks}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="text-2xl font-bold mt-1">{stats.inProgressTasks}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Milestones</div>
          <div className="text-2xl font-bold mt-1">
            {stats.completedMilestones}/{stats.totalMilestones}
          </div>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {isViewer && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                You have viewer permissions. You can view tasks but cannot edit or move them.
              </p>
            </div>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <Button
                size="sm"
                variant={viewMode === "kanban" ? "default" : "ghost"}
                onClick={() => setViewMode("kanban")}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                List
              </Button>
              <Button
                size="sm"
                variant={viewMode === "calendar" ? "default" : "ghost"}
                onClick={() => setViewMode("calendar")}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
              <Button
                size="sm"
                variant={viewMode === "gantt" ? "default" : "ghost"}
                onClick={() => setViewMode("gantt")}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Gantt
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.totalTasks} task{stats.totalTasks !== 1 ? 's' : ''}
            </div>
          </div>

          {/* View Content */}
          {viewMode === "kanban" && <ProjectKanban projectId={id as any} isReadOnly={isViewer} />}
          {viewMode === "list" && <ProjectList projectId={id as any} isReadOnly={isViewer} />}
          {viewMode === "calendar" && <ProjectCalendar projectId={id as any} isReadOnly={isViewer} />}
          {viewMode === "gantt" && <ProjectGantt projectId={id as any} isReadOnly={isViewer} />}
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <ProjectMilestones projectId={id as any} milestones={milestones} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <ProjectNotes projectId={id as any} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ProjectSettings projectId={id as any} project={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

