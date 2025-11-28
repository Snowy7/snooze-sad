"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { FolderKanban, ArrowRight, Clock, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"

export function ProjectShortcutNode({ data, selected }: NodeProps) {
  const router = useRouter()
  const projectId = data.projectId as string
  
  // Fetch project data
  const project = useQuery(
    api.projects.getProject, 
    projectId ? { projectId: projectId as any } : "skip"
  )

  // Fetch project tasks
  const tasks = useQuery(
    api.workItems.listWorkItems,
    project?.workspaceId ? { workspaceId: project.workspaceId, type: "task" } : "skip"
  )

  if (!project) {
    return (
      <div className="w-full h-full">
        <Card className="p-4 w-full h-full flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading project...</div>
        </Card>
      </div>
    )
  }

  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter((t: any) => t.status === "done").length || 0
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const handleClick = () => {
    if (project?.workspaceId) {
      router.push(`/workspaces/${project.workspaceId}/projects/${projectId}`)
    }
  }

  return (
    <div className="w-full h-full">
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={280}
        minHeight={140}
      />
      <Card
        className={cn(
          "p-4 w-full h-full transition-all cursor-pointer overflow-hidden group",
          "border-2 hover:shadow-lg",
          selected ? "border-primary shadow-lg" : "border-border hover:border-primary/50"
        )}
        onClick={handleClick}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${project.color}20` }}
              >
                <FolderKanban 
                  className="h-5 w-5" 
                  style={{ color: project.color || 'var(--primary)' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                {project.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Progress */}
          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium" style={{ color: project.color || 'var(--primary)' }}>
                {completedTasks}/{totalTasks} tasks
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: project.color || 'var(--primary)'
                }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

