"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, User as UserIcon, Tag, Clock, Loader2, Send, Trash2, Edit2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useDebounce } from "@/hooks/use-debounce"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface TaskEditTwoColumnProps {
  task: any
  workspaceId: string
  projectId?: string
  onClose?: () => void
  title?: string
  onTitleChange?: (newTitle: string) => void
  viewModeSwitcher?: React.ReactNode
}

export function TaskEditTwoColumn({
  task,
  workspaceId,
  projectId,
  onClose,
  title,
  onTitleChange,
  viewModeSwitcher,
}: TaskEditTwoColumnProps) {
  const updateTask = useMutation(api.workItems.updateWorkItem)
  const createComment = useMutation(api.comments.createComment)
  const deleteComment = useMutation(api.comments.deleteComment)
  const updateComment = useMutation(api.comments.updateComment)

  const workspaceMembers = useQuery(
    api.workspaces.listMembers,
    workspaceId ? { workspaceId: workspaceId as any } : "skip"
  ) || []

  const comments = useQuery(
    api.comments.listComments,
    task ? { workItemId: task._id } : "skip"
  ) || []

  const currentUser = useQuery(api.users.current)

  const [description, setDescription] = React.useState("")
  const [priority, setPriority] = React.useState("medium")
  const [status, setStatus] = React.useState("backlog")
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
  const [assignees, setAssignees] = React.useState<string[]>([])
  const [isSaving, setIsSaving] = React.useState(false)
  const [newComment, setNewComment] = React.useState("")
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false)
  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = React.useState("")

  // Debounced values for auto-save
  const debouncedDescription = useDebounce(description, 1000)

  // Initialize form when task changes
  React.useEffect(() => {
    if (task) {
      setDescription(task.description || "")
      setPriority(task.priority || "medium")
      setStatus(task.status || "backlog")
      setStartDate(task.startDate ? new Date(task.startDate) : undefined)
      setEndDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setAssignees(task.assignees || [])
    }
  }, [task])

  // Auto-save description
  React.useEffect(() => {
    if (!task || !debouncedDescription || debouncedDescription === task.description) return

    const save = async () => {
      setIsSaving(true)
      try {
        await updateTask({
          workItemId: task._id as any,
          description: debouncedDescription,
        })
      } finally {
        setIsSaving(false)
      }
    }

    save()
  }, [debouncedDescription, task, updateTask])

  const handlePriorityChange = async (value: string) => {
    setPriority(value)
    if (task) {
      await updateTask({
        workItemId: task._id as any,
        priority: value,
      })
    }
  }

  const handleStatusChange = async (value: string) => {
    setStatus(value)
    if (task) {
      await updateTask({
        workItemId: task._id as any,
        status: value,
      })
    }
  }

  const handleStartDateChange = async (date: Date | undefined) => {
    setStartDate(date)
    if (task) {
      await updateTask({
        workItemId: task._id as any,
        startDate: date?.toISOString(),
      })
    }
  }

  const handleEndDateChange = async (date: Date | undefined) => {
    setEndDate(date)
    if (task) {
      await updateTask({
        workItemId: task._id as any,
        endDate: date?.toISOString(),
      })
    }
  }

  const handleAssigneeToggle = async (userId: string) => {
    const newAssignees = assignees.includes(userId)
      ? assignees.filter((id) => id !== userId)
      : [...assignees, userId]

    setAssignees(newAssignees)

    if (task) {
      await updateTask({
        workItemId: task._id as any,
        assignees: newAssignees,
      })
    }
  }

  const getMemberName = (userId: string) => {
    const member = workspaceMembers.find((m: any) => m.userId === userId)
    return member?.user?.fullName || member?.user?.email || "Unknown"
  }

  const getMemberInitials = (userId: string) => {
    const name = getMemberName(userId)
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !task) return

    setIsSubmittingComment(true)
    try {
      await createComment({
        workItemId: task._id,
        content: newComment.trim(),
      })
      setNewComment("")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment({ commentId: commentId as any })
  }

  const handleStartEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId)
    setEditCommentContent(content)
  }

  const handleUpdateComment = async (commentId: string) => {
    if (!editCommentContent.trim()) return

    await updateComment({
      commentId: commentId as any,
      content: editCommentContent.trim(),
    })
    setEditingCommentId(null)
    setEditCommentContent("")
  }

  if (!task) return null

  return (
    <>
      {/* Header */}
      {(title !== undefined || viewModeSwitcher || onClose) && (
        <div className="flex items-center justify-between px-6 py-3 border-b h-fit flex-shrink-0 bg-background">
          {title !== undefined && onTitleChange ? (
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="flex-1 mr-4 text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0"
              placeholder="Task title..."
            />
          ) : (
            <div className="flex-1" />
          )}
          <div className="flex items-center gap-2">
            {viewModeSwitcher}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-accent rounded-sm"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Description and Comments */}
        <div className="flex-1 flex flex-col border-r min-w-0">
          <ScrollArea className="flex-1">
            <div className="px-8 py-6 space-y-6 max-w-5xl mx-auto w-full">
              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                <div className="border rounded-lg overflow-hidden bg-background">
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Add a description..."
                    padding="pl-10 pr-3 py-3"
                    showDragHandle={true}
                    showPlusButton={false}
                    minHeight="min-h-[200px]"
                  />
                </div>
              </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <Separator />
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">
                  Comments ({comments.length})
                </Label>

                {/* Comment Input */}
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {currentUser?.fullName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="resize-none min-h-[80px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          handleSubmitComment()
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="self-end"
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <div key={comment._id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {comment.author?.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {comment.author?.name || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                          {comment.isEdited && (
                            <span className="text-xs text-muted-foreground italic">
                              (edited)
                            </span>
                          )}
                        </div>
                        {editingCommentId === comment._id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              className="resize-none min-h-[60px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateComment(comment._id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingCommentId(null)
                                  setEditCommentContent("")
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {comment.content}
                            </p>
                            {comment.authorId === currentUser?.externalId && (
                              <div className="flex gap-2 mt-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs"
                                  onClick={() =>
                                    handleStartEditComment(comment._id, comment.content)
                                  }
                                >
                                  <Edit2 className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteComment(comment._id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Column - Properties */}
      <div className="w-96 flex-shrink-0 flex flex-col bg-muted/30">
        <ScrollArea className="flex-1">
          <div className="px-6 py-6 space-y-6">
            {isSaving && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="h-3 w-3" />
                Status
              </Label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="h-3 w-3" />
                Priority
              </Label>
              <Select value={priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Dates */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Start Date
                </Label>
                <DatePicker
                  date={startDate}
                  onSelect={handleStartDateChange}
                  placeholder="Set start date"
                  maxDate={endDate}
                  className="h-9 w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Due Date
                </Label>
                <DatePicker
                  date={endDate}
                  onSelect={handleEndDateChange}
                  placeholder="Set due date"
                  minDate={startDate}
                  className="h-9 w-full"
                />
              </div>
            </div>

            <Separator />

            {/* Assignees */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <UserIcon className="h-3 w-3" />
                Assignees
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-auto min-h-[36px] py-2"
                  >
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {assignees.length > 0 ? (
                        assignees.map((userId) => (
                          <Badge
                            key={userId}
                            variant="secondary"
                            className="gap-1 px-1.5 py-0.5"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAssigneeToggle(userId)
                            }}
                          >
                            <Avatar className="h-3 w-3">
                              <AvatarFallback className="text-[8px]">
                                {getMemberInitials(userId)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs max-w-[80px] truncate">
                              {getMemberName(userId)}
                            </span>
                            <X className="h-3 w-3 hover:text-destructive" />
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Select assignees...
                        </span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search members..." className="h-9" />
                    <CommandEmpty>No member found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {workspaceMembers.map((member: any) => (
                        <CommandItem
                          key={member.userId}
                          value={member.userId}
                          onSelect={() => handleAssigneeToggle(member.userId)}
                          className="flex items-center gap-2"
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              assignees.includes(member.userId)
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <Check className="h-3 w-3" />
                          </div>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">
                              {getMemberInitials(member.userId)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1">{getMemberName(member.userId)}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Task ID</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {task._id.substring(0, 12)}...
                </Badge>
              </div>
              {task._creationTime && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(task._creationTime).toLocaleDateString()}</span>
                </div>
              )}
              {task.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last updated</span>
                  <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
    </>
  )
}
