"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, X, FolderKanban, CheckCircle2, Clock, Users } from "lucide-react"
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

export function TeamStatsNode({ data, selected }: NodeProps) {
  const { currentWorkspaceId } = useWorkspace()
  const deleteNode = useMutation(api.graphs.deleteNode)

  // Fetch workspace data
  const workspace = useQuery(
    api.workspaces.getWorkspace,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : "skip"
  )
  const projects = useQuery(
    api.functions.listProjects,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : "skip"
  )
  const members = useQuery(
    api.workspaces.listMembers,
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
  const teamSize = members?.length || 0

  const stats = [
    { label: "Total Projects", value: totalProjects, icon: FolderKanban, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { label: "Active", value: activeProjects, icon: Clock, color: "text-green-500", bgColor: "bg-green-500/10" },
    { label: "Completed", value: completedProjects, icon: CheckCircle2, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { label: "Team Members", value: teamSize, icon: Users, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  ]

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
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{workspace?.name || "Team Stats"}</h3>
              <p className="text-xs text-muted-foreground">Workspace Overview</p>
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
                <AlertDialogTitle>Delete team stats?</AlertDialogTitle>
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

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", stat.bgColor)}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

