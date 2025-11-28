"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Zap, FileText, CheckSquare, BarChart3, Folder, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function QuickActionsNode({ data, selected }: NodeProps) {
  const deleteNode = useMutation(api.graphs.deleteNode)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const createNode = useMutation(api.graphs.createNode)
  const createWorkItem = useMutation(api.workItems.createWorkItem)

  // Prevent zoom when scrolling inside node
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteNode({ nodeId: data.nodeId as any })
      toast.success("Quick actions removed")
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error("Failed to remove quick actions")
    }
  }

  const handleQuickCreate = async (type: "task" | "note" | "widget") => {
    try {
      let workItemId = undefined
      const graphId = data.graphId

      if (type === "task") {
        workItemId = await createWorkItem({
          workspaceId: data.workspaceId as any,
          type: "task",
          title: "New Task",
          status: "backlog",
        })
      } else if (type === "note") {
        workItemId = await createWorkItem({
          workspaceId: data.workspaceId as any,
          type: "note",
          title: "New Note",
          content: "Start writing...",
        })
      }

      await createNode({
        graphId: graphId as any,
        workItemId: workItemId as any,
        type: type === "widget" ? "widget" : type === "task" ? "task-card" : "note",
        position: { x: 100, y: 100 },
        size: { width: 320, height: 200 },
        props: type === "widget" ? { widgetType: "stats" } : undefined,
      })

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} created!`)
    } catch (error) {
      toast.error("Failed to create item")
    }
  }

  return (
    <div className="w-full h-full" onWheel={handleWheel}>
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={320}
        minHeight={280}
        maxWidth={600}
        maxHeight={500}
      />
      <Card
        className={cn(
          "p-5 w-full h-full transition-all cursor-move overflow-hidden relative group",
          "bg-card flex flex-col",
          "border-2",
          selected ? "border-primary shadow-lg" : "border-border hover:border-primary/50"
        )}
      >
        {/* Delete button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation()
            setShowDeleteDialog(true)
          }}
        >
          <X className="h-3 w-3" />
        </Button>

        {/* Delete confirmation dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove quick actions?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the quick actions panel from your board.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Quick Actions</h3>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4"
            onClick={(e) => {
              e.stopPropagation()
              handleQuickCreate("task")
            }}
          >
            <CheckSquare className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">New Task</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4"
            onClick={(e) => {
              e.stopPropagation()
              handleQuickCreate("note")
            }}
          >
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">New Note</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4"
            onClick={(e) => {
              e.stopPropagation()
              handleQuickCreate("widget")
            }}
          >
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Add Widget</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4"
            disabled
          >
            <Folder className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Project</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}

