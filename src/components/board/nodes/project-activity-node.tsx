"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Activity, X, CheckCircle2, Plus, Edit2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
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

export function ProjectActivityNode({ data, selected }: NodeProps) {
  const deleteNode = useMutation(api.graphs.deleteNode)
  const projectId = data.projectId

  // Get project activities
  const project = useQuery(api.projects.getProject, { projectId: projectId as any })
  const activities = useQuery(
    api.activities.listActivities,
    project?.workspaceId ? { workspaceId: project.workspaceId } : "skip"
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

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
      case "created":
        return <Plus className="h-3.5 w-3.5 text-blue-500" />
      case "updated":
        return <Edit2 className="h-3.5 w-3.5 text-amber-500" />
      case "deleted":
        return <Trash2 className="h-3.5 w-3.5 text-red-500" />
      default:
        return <Activity className="h-3.5 w-3.5" />
    }
  }

  return (
    <div className="w-full h-full group" onWheel={handleWheel} onMouseDown={handleMouseDown}>
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={320}
        minHeight={280}
        maxWidth={500}
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
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Activity</h3>
              <p className="text-xs text-muted-foreground">Recent updates</p>
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

        {/* Activity Feed */}
        <ScrollArea className="flex-1 -mx-1 px-1">
          {activities && activities.length > 0 ? (
            <div className="space-y-3">
              {activities.slice(0, 8).map((activity: any) => (
                <div key={activity._id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{activity.action}</span>
                      {activity.entityType && (
                        <span className="text-muted-foreground"> {activity.entityType}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">No recent activity</p>
              <p className="text-xs text-muted-foreground">Start working to see updates</p>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  )
}

