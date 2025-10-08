"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FolderKanban, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function WorkspaceProjectsPage() {
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.id as string
  
  // Fetch all projects in this workspace that user has access to
  const projects = useQuery(
    api.functions.listProjects,
    { workspaceId }
  ) || []

  const activeProjects = projects.filter((p: any) => p.status !== "archived" && p.status !== "completed")
  const completedProjects = projects.filter((p: any) => p.status === "completed")
  const archivedProjects = projects.filter((p: any) => p.status === "archived")

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Workspace Projects</h1>
          <p className="text-sm text-muted-foreground">
            All projects in this workspace you have access to
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">No projects yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Create your first project to get started</p>
            </div>
            <Link href="/projects/new">
              <Button>Create Project</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {activeProjects.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Active Projects</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeProjects.map((project: any) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            </div>
          )}

          {completedProjects.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Completed</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedProjects.map((project: any) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            </div>
          )}

          {archivedProjects.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Archived</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {archivedProjects.map((project: any) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: any }) {
  const details = useQuery(api.functions.getProjectDetails, { projectId: project._id })
  const stats = details?.stats

  const colorClasses: Record<string, string> = {
    blue: "border-l-blue-500",
    green: "border-l-green-500",
    purple: "border-l-purple-500",
    orange: "border-l-orange-500",
    pink: "border-l-pink-500",
    red: "border-l-red-500",
  }

  return (
    <Link href={`/projects/${project._id}`}>
      <Card className={`p-5 hover:shadow-lg transition-all cursor-pointer border-l-4 ${colorClasses[project.color || "blue"]}`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
          </div>

          {stats && (
            <div className="grid grid-cols-3 gap-2 pt-3 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.completedTasks}</div>
                <div className="text-xs text-muted-foreground">Done</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.backlogTasks}</div>
                <div className="text-xs text-muted-foreground">Backlog</div>
              </div>
            </div>
          )}

          {project.endDate && (
            <div className="text-xs text-muted-foreground">
              Due {format(new Date(project.endDate), "MMM d, yyyy")}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}

