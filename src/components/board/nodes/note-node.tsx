"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { X, StickyNote } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation } from "convex/react"
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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

export function NoteNode({ data, selected }: NodeProps) {
  const workItem = data.workItem as any
  const deleteNode = useMutation(api.graphs.deleteNode)
  const updateWorkItem = useMutation(api.workItems.updateWorkItem)
  
  const [title, setTitle] = React.useState((workItem as any)?.title || "New Note")
  const [content, setContent] = React.useState((workItem as any)?.content || "")
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleTitleSave = async () => {
    if ((workItem as any)?._id) {
      await updateWorkItem({
        workItemId: (workItem as any)._id as any,
        title,
      })
      setIsEditingTitle(false)
    }
  }

  const handleContentBlur = async () => {
    if ((workItem as any)?._id && content !== (workItem as any).content) {
      await updateWorkItem({
        workItemId: (workItem as any)._id as any,
        content,
      })
    }
  }

  // Prevent canvas zoom/pan when interacting
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "BUTTON" ||
      target.closest("button")
    ) {
      e.stopPropagation()
    }
  }

  return (
    <div
      className="w-full h-full group"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    >
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={280}
        minHeight={200}
        maxWidth={800}
        maxHeight={600}
      />
      
      <Card
        className={cn(
          "p-4 w-full h-full transition-all overflow-hidden flex flex-col",
          "border-2",
          selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border hover:border-primary/50",
          "bg-card"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <StickyNote className="h-4 w-4 text-primary flex-shrink-0" />
          
          {isEditingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === "Enter") handleTitleSave()
                if (e.key === "Escape") {
                  setTitle((workItem as any)?.title || "New Note")
                  setIsEditingTitle(false)
                }
              }}
              className="font-semibold text-sm h-7 flex-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3
              className="font-semibold text-sm flex-1 cursor-text"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
            </h3>
          )}

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
                <AlertDialogTitle>Delete note?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this note. This action cannot be undone.
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

        {/* Content */}
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleContentBlur}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Start writing..."
          className="text-sm flex-1 resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
        />
      </Card>
    </div>
  )
}
