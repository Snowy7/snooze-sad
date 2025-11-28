"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Keyboard, X } from "lucide-react"
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
import { KeyboardShortcut } from "@/components/keyboard-shortcut"

export function ShortcutsNode({ data, selected }: NodeProps) {
  const deleteNode = useMutation(api.graphs.deleteNode)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  // Prevent zoom when scrolling inside node
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteNode({ nodeId: data.nodeId as any })
      toast.success("Shortcuts removed")
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error("Failed to remove shortcuts")
    }
  }

  return (
    <div className="w-full h-full" onWheel={handleWheel}>
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={420}
        minHeight={320}
        maxWidth={800}
        maxHeight={600}
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
              <AlertDialogTitle>Remove shortcuts?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the keyboard shortcuts reference from your board.
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
            <Keyboard className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Keyboard Shortcuts</h3>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-3 overflow-y-auto flex-1">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Navigation</h4>
            <KeyboardShortcut keys={["⌘", "K"]} description="Command palette" />
            <KeyboardShortcut keys={["Scroll"]} description="Pan the board" />
            <KeyboardShortcut keys={["Pinch"]} description="Zoom in/out" />
          </div>

          <div className="h-px bg-border my-3" />

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Board Actions</h4>
            <KeyboardShortcut keys={["Double Click"]} description="Create node" />
            <KeyboardShortcut keys={["Drag"]} description="Move nodes" />
            <KeyboardShortcut keys={["Corners"]} description="Resize nodes" />
            <KeyboardShortcut keys={["Esc"]} description="Deselect all" />
          </div>

          <div className="h-px bg-border my-3" />

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Tips</h4>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              Use the toggle at the top to switch between Personal and Team modes
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

