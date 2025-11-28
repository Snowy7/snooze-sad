"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, X, ListChecks, Tag as TagIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function TaskNode({ data, selected }: NodeProps) {
  const workItem = data.workItem as any
  const deleteNode = useMutation(api.graphs.deleteNode)
  const updateWorkItem = useMutation(api.workItems.updateWorkItem)
  
  const subtasks = useQuery(
    api.workItemLinks.getSubtasks,
    workItem?._id ? { workItemId: workItem._id } : "skip"
  ) || []

  const workspaceMembers = useQuery(
    api.workspaces.listMembers,
    workItem?.workspaceId ? { workspaceId: workItem.workspaceId } : "skip"
  ) || []
  
  const [title, setTitle] = React.useState(workItem?.title || "New Task")
  const [description, setDescription] = React.useState(workItem?.description || "")
  const [isEditing, setIsEditing] = React.useState(false)

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleSave = async () => {
    if (workItem?._id) {
      await updateWorkItem({
        workItemId: workItem._id as any,
        title,
        description,
      })
      setIsEditing(false)
    }
  }

  const handleToggleStatus = async () => {
    if (workItem?._id) {
      await updateWorkItem({
        workItemId: workItem._id as any,
        status: workItem.status === "done" ? "in_progress" : "done",
      })
    }
  }

  const isDone = workItem?.status === "done"
  const priority = workItem?.priority || "medium"
  const tags = workItem?.tags || []
  const assignees = workItem?.assignees || []
  const estimatedHours = workItem?.estimatedHours
  const trackedHours = workItem?.trackedHours
  
  const completedSubtasks = subtasks.filter((s: any) => s.workItem?.status === "done").length
  const totalSubtasks = subtasks.length

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    high: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    critical: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  }

  const getMemberInitials = (userId: string) => {
    const member = workspaceMembers.find((m: any) => m.userId === userId)
    const name = member?.user?.fullName || member?.user?.email || "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Prevent canvas zoom/pan when interacting with node
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only stop propagation if clicking on interactive elements
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
      className="w-full h-full"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    >
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={280}
        minHeight={180}
        maxWidth={600}
        maxHeight={500}
      />
      
      <Card
        className={cn(
          "p-4 w-full h-full transition-all overflow-hidden flex flex-col",
          "border-2",
          selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border hover:border-primary/50",
          isDone && "opacity-70"
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isDone}
              onCheckedChange={handleToggleStatus}
              className="h-5 w-5"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  if (e.key === "Enter") handleSave()
                  if (e.key === "Escape") {
                    setTitle(workItem?.title || "New Task")
                    setIsEditing(false)
                  }
                }}
                className="font-semibold text-sm h-8"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3
                className={cn(
                  "font-semibold text-sm leading-tight cursor-text",
                  isDone && "line-through text-muted-foreground"
                )}
                onClick={() => setIsEditing(true)}
              >
                {title}
              </h3>
            )}
          </div>

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
                <AlertDialogTitle>Delete task?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this task. This action cannot be undone.
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

        {/* Description */}
        {isEditing ? (
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSave}
            onClick={(e) => e.stopPropagation()}
            placeholder="Add description..."
            className="text-xs flex-1 min-h-[60px] resize-none"
          />
        ) : description ? (
          <p
            className="text-xs text-muted-foreground mb-3 overflow-y-auto flex-1 cursor-text"
            onClick={() => setIsEditing(true)}
          >
            {description}
          </p>
        ) : (
          <p
            className="text-xs text-muted-foreground/50 mb-3 cursor-text italic"
            onClick={() => setIsEditing(true)}
          >
            Click to add description...
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                <TagIcon className="h-2.5 w-2.5 mr-0.5" />
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t flex-wrap">
          <Badge variant="outline" className={cn("text-xs font-medium", priorityColors[priority as keyof typeof priorityColors])}>
            {priority}
          </Badge>
          
          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ListChecks className="h-3 w-3" />
              <span>{completedSubtasks}/{totalSubtasks}</span>
            </div>
          )}

          {/* Assignees */}
          {assignees.length > 0 && (
            <div className="flex -space-x-1.5">
              {assignees.slice(0, 3).map((userId: string) => (
                <Avatar key={userId} className="h-5 w-5 border-2 border-background">
                  <AvatarFallback className="text-[9px]">
                    {getMemberInitials(userId)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {assignees.length > 3 && (
                <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-medium">
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Time Tracking */}
          {(trackedHours || estimatedHours) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {trackedHours || 0}
                {estimatedHours && `/${estimatedHours}`}h
              </span>
            </div>
          )}
          
          {/* Due Date */}
          {workItem?.endDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Calendar className="h-3 w-3" />
              <span>{new Date(workItem.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
