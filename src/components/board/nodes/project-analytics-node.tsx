"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, X, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react"
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

export function ProjectAnalyticsNode({ data, selected }: NodeProps) {
  const deleteNode = useMutation(api.graphs.deleteNode)
  const projectId = data.projectId

  // Get project data
  const project = useQuery(api.projects.getProject, { projectId: projectId as any })
  const tasks = useQuery(
    api.workItems.listWorkItems,
    project?.workspaceId ? { workspaceId: project.workspaceId, type: "task" } : "skip"
  )

  const completedTasks = (tasks || []).filter((t: any) => t.status === "done").length
  const inProgressTasks = (tasks || []).filter((t: any) => t.status === "in_progress").length
  const backlogTasks = (tasks || []).filter((t: any) => t.status === "backlog" || !t.status).length
  const totalTasks = tasks?.length || 0
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleWheel = (e: React.WheelEvent) => e.stopPropagation()
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === "BUTTON" || target.closest("button")) {
      e.stopPropagation()
    }
  }

  return (
    <div className="w-full h-full group" onWheel={handleWheel} onMouseDown={handleMouseDown}>
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={380}
        minHeight={280}
        maxWidth={600}
        maxHeight={500}
      />

      <Card className={cn(
        "p-5 w-full h-full transition-all flex flex-col overflow-hidden",
        "border-2",
        selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Analytics</h3>
              <p className="text-xs text-muted-foreground">Project insights</p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove card?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will only remove the card from the board.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Progress Overview */}
        <Card className="p-4 mb-4 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{progress}%</div>
          <p className="text-xs text-muted-foreground">{completedTasks} of {totalTasks} tasks completed</p>
        </Card>

        {/* Task Breakdown */}
        <div className="grid grid-cols-3 gap-3 flex-1">
          <Card className="p-3 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-500">{completedTasks}</div>
            <div className="text-xs text-muted-foreground mt-1">Done</div>
          </Card>

          <Card className="p-3 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-500">{inProgressTasks}</div>
            <div className="text-xs text-muted-foreground mt-1">Active</div>
          </Card>

          <Card className="p-3 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-full bg-gray-500/10 flex items-center justify-center mb-2">
              <AlertCircle className="h-5 w-5 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-gray-500">{backlogTasks}</div>
            <div className="text-xs text-muted-foreground mt-1">Backlog</div>
          </Card>
        </div>

        {/* Double-click hint */}
        <p className="text-[10px] text-muted-foreground text-center mt-3 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
          Double-click for detailed analytics
        </p>
      </Card>
    </div>
  )
}

