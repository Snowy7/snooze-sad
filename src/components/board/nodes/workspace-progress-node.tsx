"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, X } from "lucide-react"
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
import { useWorkspace } from "@/contexts/workspace-context"
import { Progress } from "@/components/ui/progress"

export function WorkspaceProgressNode({ data, selected }: NodeProps) {
  const { currentWorkspaceId } = useWorkspace()
  const deleteNode = useMutation(api.graphs.deleteNode)

  // Fetch projects
  const projects = useQuery(
    api.functions.listProjects,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : "skip"
  )

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

  // Calculate stats
  const totalProjects = projects?.length || 0
  const activeProjects = projects?.filter(p => p.status === "active" || !p.status).length || 0
  const completedProjects = projects?.filter(p => p.status === "completed").length || 0
  const archivedProjects = projects?.filter(p => p.status === "archived").length || 0

  const completionPercentage = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
  const activePercentage = totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0

  return (
    <div className="w-full h-full group" onWheel={handleWheel} onMouseDown={handleMouseDown}>
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={400}
        minHeight={240}
        maxWidth={700}
        maxHeight={400}
      />

      <Card
        className={cn(
          "p-5 w-full h-full transition-all overflow-hidden flex flex-col",
          "border-2",
          selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border hover:border-primary/50"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Workspace Progress</h3>
              <p className="text-xs text-muted-foreground">Project completion trends</p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete workspace progress?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove this widget from your board.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Progress Content */}
        <div className="flex-1 space-y-6">
          {/* Completion Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Project Completion</span>
              <span className="text-muted-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{completedProjects} completed</span>
              <span>{totalProjects} total</span>
            </div>
          </div>

          {/* Active Projects Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Active Projects</span>
              <span className="text-muted-foreground">{activePercentage}%</span>
            </div>
            <Progress value={activePercentage} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{activeProjects} active</span>
              <span>{totalProjects} total</span>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">{activeProjects}</div>
              <div className="text-xs text-muted-foreground mt-1">Active</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-500">{completedProjects}</div>
              <div className="text-xs text-muted-foreground mt-1">Completed</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-muted-foreground">{archivedProjects}</div>
              <div className="text-xs text-muted-foreground mt-1">Archived</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

