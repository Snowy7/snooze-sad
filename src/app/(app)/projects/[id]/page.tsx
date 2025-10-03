"use client"

import { use } from "react"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"
import { ProjectKanban } from "@/components/project/project-kanban"
import { ProjectNotes } from "@/components/project/project-notes"
import { ProjectMilestones } from "@/components/project/project-milestones"
import { ProjectSettings } from "@/components/project/project-settings"

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const details = useQuery(api.functions.getProjectDetails, { projectId: id as any })

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

  const { project, stats, milestones, sprints } = details

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

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4">
          <ProjectKanban projectId={id as any} />
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <ProjectMilestones projectId={id as any} milestones={milestones} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <ProjectNotes projectId={id as any} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ProjectSettings project={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

