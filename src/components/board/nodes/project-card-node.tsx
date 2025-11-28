"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderKanban, X, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Progress } from "@/components/ui/progress"

export function ProjectCardNode({ data, selected }: NodeProps) {
  const router = useRouter()
  const deleteNode = useMutation(api.graphs.deleteNode)

  // Get project details
  const project = useQuery(
    api.projects.getProject,
    data.projectId ? { projectId: data.projectId as any } : "skip"
  )

  // Get project tasks to calculate progress
  const tasks = useQuery(
    api.workItems.listWorkItems,
    project?.workspaceId ? { workspaceId: project.workspaceId, type: "task" } : "skip"
  )

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleDoubleClick = () => {
    if (data.projectId && project?.workspaceId) {
      router.push(`/workspaces/${project.workspaceId}/projects/${data.projectId}`)
    }
  }

  const handleWheel = (e: React.WheelEvent) => e.stopPropagation()
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === "BUTTON" || target.closest("button")) {
      e.stopPropagation()
    }
  }

  if (!project) {
    return (
      <div className="w-full h-full group" onWheel={handleWheel} onMouseDown={handleMouseDown}>
        <NodeResizer
          color="var(--primary)"
          isVisible={selected}
          minWidth={280}
          minHeight={200}
          maxWidth={500}
          maxHeight={400}
        />
        <Card className={cn(
          "p-4 w-full h-full transition-all flex items-center justify-center",
          "border-2",
          selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border"
        )}>
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </Card>
      </div>
    )
  }

  // Calculate task stats
  const projectTasks = (tasks || []).filter((t: any) => {
    // Filter tasks that belong to this project (could be by parentId or custom logic)
    return true // For now, show all tasks - you can add project filtering logic
  })
  const totalTasks = projectTasks.length
  const completedTasks = projectTasks.filter((t: any) => t.status === "done").length
  const inProgressTasks = projectTasks.filter((t: any) => t.status === "in_progress").length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div 
      className="w-full h-full group" 
      onWheel={handleWheel} 
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={280}
        minHeight={200}
        maxWidth={500}
        maxHeight={400}
      />

      <Card
        className={cn(
          "p-5 w-full h-full transition-all overflow-hidden flex flex-col cursor-pointer",
          "border-2",
          selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border hover:border-primary/50 hover:shadow-lg"
        )}
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: project.color || "#3B82F6"
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${project.color || '#3B82F6'}20` }}
            >
              <FolderKanban
                className="h-5 w-5"
                style={{ color: project.color || '#3B82F6' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{project.name}</h3>
              {project.status && (
                <Badge
                  variant={project.status === "active" ? "default" : "secondary"}
                  className="capitalize text-xs mt-1"
                >
                  {project.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Project cards are non-removable in projects board */}
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Progress */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 rounded-md bg-muted/50">
            <div className="text-lg font-bold text-green-500">{completedTasks}</div>
            <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Done
            </div>
          </div>
          <div className="text-center p-2 rounded-md bg-muted/50">
            <div className="text-lg font-bold text-blue-500">{inProgressTasks}</div>
            <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              Active
            </div>
          </div>
          <div className="text-center p-2 rounded-md bg-muted/50">
            <div className="text-lg font-bold text-muted-foreground">{totalTasks - completedTasks - inProgressTasks}</div>
            <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Todo
            </div>
          </div>
        </div>

        {/* Due Date */}
        {project.endDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-2 border-t">
            <Calendar className="h-3 w-3" />
            <span>Due {format(new Date(project.endDate), "MMM d, yyyy")}</span>
          </div>
        )}

        {/* Double-click hint */}
        <p className="text-[10px] text-muted-foreground text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Double-click to open project
        </p>
      </Card>
    </div>
  )
}

