"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Button } from "@/components/ui/button"
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
import { format } from "date-fns"
import { useOwnerId } from "@/hooks/use-owner"

export function UpcomingTasksNode({ data, selected }: NodeProps) {
  const ownerId = useOwnerId()
  const deleteNode = useMutation(api.graphs.deleteNode)
  const today = new Date().toISOString().split("T")[0]
  
  const dashboardData = useQuery(
    api.functions.listDashboard,
    ownerId ? { ownerId, today } : "skip"
  )

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleWheel = (e: React.WheelEvent) => e.stopPropagation()

  // Get upcoming tasks (not done, with end dates)
  const upcomingTasks = dashboardData?.tasksToday?.filter((t: any) => 
    t.status !== "done" && t.endDate
  ).slice(0, 10) || []

  return (
    <div className="w-full h-full group" onWheel={handleWheel}>
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={300}
        minHeight={250}
        maxWidth={500}
        maxHeight={600}
      />
      
      <Card
        className={cn(
          "p-4 w-full h-full transition-all overflow-hidden flex flex-col",
          "border-2",
          selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border hover:border-primary/50"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm flex-1">Upcoming Tasks</h3>

          {/* Delete button */}
          <AlertDialog>
            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete upcoming tasks widget?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this widget.
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

        {/* Tasks list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {upcomingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
              <Clock className="h-8 w-8 mb-2 opacity-50" />
              <p>No upcoming tasks</p>
            </div>
          ) : (
            upcomingTasks.map((task: any) => (
              <div
                key={task._id}
                className="p-2 rounded-lg border-2 border-border hover:border-primary/50 transition-colors"
              >
                <div className="font-medium text-sm">{task.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Due {format(new Date(task.endDate), "MMM d, yyyy")}
                </div>
                {task.priority && (
                  <div className={cn(
                    "inline-block px-2 py-0.5 rounded text-xs mt-1",
                    task.priority === "high" && "bg-red-500/10 text-red-500",
                    task.priority === "medium" && "bg-yellow-500/10 text-yellow-500",
                    task.priority === "low" && "bg-green-500/10 text-green-500"
                  )}>
                    {task.priority}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

