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
import { Calendar, User as UserIcon, Tag, Clock, Loader2, Send, Plus, Check, X, Target, ListChecks, Link2, ChevronRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useDebounce } from "@/hooks/use-debounce"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"

interface TaskEditEnhancedProps {
  task: any
  workspaceId: string
  projectId?: string
  onClose?: () => void
  title?: string
  onTitleChange?: (newTitle: string) => void
  viewModeSwitcher?: React.ReactNode
  showNavigation?: boolean
}

export function TaskEditEnhanced({
  task,
  workspaceId,
  projectId,
  onClose,
  title,
  onTitleChange,
  viewModeSwitcher,
  showNavigation = false,
}: TaskEditEnhancedProps) {
  const updateTask = useMutation(api.workItems.updateWorkItem)
  const createActivity = useMutation(api.activities.createActivity)
  const createComment = useMutation(api.comments.createComment)
  const createChecklist = useMutation(api.checklists.createChecklist)
  const addChecklistItem = useMutation(api.checklists.addChecklistItem)
  const toggleChecklistItem = useMutation(api.checklists.toggleChecklistItem)
  const deleteChecklistItem = useMutation(api.checklists.deleteChecklistItem)
  const deleteChecklist = useMutation(api.checklists.deleteChecklist)
  const createTag = useMutation(api.tags.createTag)
  const createSubtask = useMutation(api.workItemLinks.createSubtask)
  const createLink = useMutation(api.workItemLinks.createLink)
  const deleteLink = useMutation(api.workItemLinks.deleteLink)
  
  // Queries
  const workspaceMembers = useQuery(
    api.workspaces.listMembers,
    workspaceId ? { workspaceId: workspaceId as any } : "skip"
  ) || []

  const comments = useQuery(
    api.comments.listComments,
    task ? { workItemId: task._id } : "skip"
  ) || []

  const activities = useQuery(
    api.activities.listWorkItemActivities,
    task ? { workItemId: task._id } : "skip"
  ) || []

  const checklists = useQuery(
    api.checklists.listChecklists,
    task ? { workItemId: task._id } : "skip"
  ) || []

  const projectTags = useQuery(
    api.tags.listProjectTags,
    projectId ? { projectId: projectId as any } : "skip"
  ) || []

  const subtasks = useQuery(
    api.workItemLinks.getSubtasks,
    task ? { workItemId: task._id } : "skip"
  ) || []

  const relationships = useQuery(
    api.workItemLinks.getRelationships,
    task ? { workItemId: task._id } : "skip"
  )

  const allWorkItems = useQuery(
    api.workItems.listWorkItems,
    workspaceId ? { workspaceId: workspaceId as any, type: "task" } : "skip"
  ) || []

  const currentUser = useQuery(api.users.current)

  // State
  const [description, setDescription] = React.useState("")
  const [priority, setPriority] = React.useState("medium")
  const [status, setStatus] = React.useState("backlog")
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
  const [assignees, setAssignees] = React.useState<string[]>([])
  const [tags, setTags] = React.useState<string[]>([])
  const [estimatedHours, setEstimatedHours] = React.useState<number | undefined>(undefined)
  const [trackedHours, setTrackedHours] = React.useState<number | undefined>(undefined)
  const [isSaving, setIsSaving] = React.useState(false)
  const [newComment, setNewComment] = React.useState("")
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false)
  const [taskTitle, setTaskTitle] = React.useState("")
  const [newChecklistTitle, setNewChecklistTitle] = React.useState("")
  const [newChecklistItem, setNewChecklistItem] = React.useState<Record<string, string>>({})
  const [isCreatingChecklist, setIsCreatingChecklist] = React.useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("")
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false)
  const [isAddingRelationship, setIsAddingRelationship] = React.useState(false)
  const [relationshipType, setRelationshipType] = React.useState<"blocks" | "blocked_by" | "relates_to">("relates_to")

  // Debounced values
  const debouncedDescription = useDebounce(description, 1000)
  const debouncedTitle = useDebounce(taskTitle, 800)

  // Initialize form
  React.useEffect(() => {
    if (task) {
      setTaskTitle(task.title || "")
      setDescription(task.description || "")
      setPriority(task.priority || "medium")
      setStatus(task.status || "backlog")
      setStartDate(task.startDate ? new Date(task.startDate) : undefined)
      setEndDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setAssignees(task.assignees || [])
      setTags(task.tags || [])
      setEstimatedHours(task.estimatedHours)
      setTrackedHours(task.trackedHours)
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
        await createActivity({
          workItemId: task._id,
          action: "updated",
          field: "description",
          newValue: "Updated description",
        })
      } finally {
        setIsSaving(false)
      }
    }

    save()
  }, [debouncedDescription, task, updateTask, createActivity])

  // Auto-save title
  React.useEffect(() => {
    if (!task || !debouncedTitle || debouncedTitle === task.title) return

    const save = async () => {
      await updateTask({
        workItemId: task._id as any,
        title: debouncedTitle,
      })
      await createActivity({
        workItemId: task._id,
        action: "updated",
        field: "title",
        oldValue: task.title,
        newValue: debouncedTitle,
      })
      if (onTitleChange) {
        onTitleChange(debouncedTitle)
      }
    }

    save()
  }, [debouncedTitle, task, updateTask, createActivity, onTitleChange])

  const handleFieldUpdate = async (field: string, value: any, oldValue: any) => {
    if (task) {
      await updateTask({
        workItemId: task._id as any,
        [field]: value,
      })
      await createActivity({
        workItemId: task._id,
        action: "updated",
        field,
        oldValue: String(oldValue),
        newValue: String(value),
      })
    }
  }

  const handlePriorityChange = async (value: string) => {
    const oldValue = priority
    setPriority(value)
    await handleFieldUpdate("priority", value, oldValue)
  }

  const handleStatusChange = async (value: string) => {
    const oldValue = status
    setStatus(value)
    await handleFieldUpdate("status", value, oldValue)
  }

  const handleStartDateChange = async (date: Date | undefined) => {
    const oldValue = startDate
    setStartDate(date)
    await handleFieldUpdate("startDate", date?.toISOString(), oldValue?.toISOString())
  }

  const handleEndDateChange = async (date: Date | undefined) => {
    const oldValue = endDate
    setEndDate(date)
    await handleFieldUpdate("dueDate", date?.toISOString(), oldValue?.toISOString())
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
      await createActivity({
        workItemId: task._id,
        action: assignees.includes(userId) ? "unassigned" : "assigned",
        newValue: userId,
      })
    }
  }

  const handleAddTag = async (tagName: string) => {
    if (!tagName.trim() || tags.includes(tagName.trim()) || !projectId) return

    if (!projectTags.find((t: any) => t.name === tagName.trim())) {
      await createTag({
        projectId: projectId as any,
        name: tagName.trim(),
      })
    }

    const newTags = [...tags, tagName.trim()]
    setTags(newTags)

    if (task) {
      await updateTask({
        workItemId: task._id as any,
        tags: newTags,
      })
      await createActivity({
        workItemId: task._id,
        action: "added_tag",
        newValue: tagName.trim(),
      })
    }
  }

  const handleToggleTag = async (tagName: string) => {
    const isSelected = tags.includes(tagName)
    const newTags = isSelected
      ? tags.filter(t => t !== tagName)
      : [...tags, tagName]

    setTags(newTags)

    if (task) {
      await updateTask({
        workItemId: task._id as any,
        tags: newTags,
      })
      await createActivity({
        workItemId: task._id,
        action: isSelected ? "removed_tag" : "added_tag",
        [isSelected ? "oldValue" : "newValue"]: tagName,
      })
    }
  }

  const handleEstimateChange = async (hours: number) => {
    setEstimatedHours(hours)
    await handleFieldUpdate("estimatedHours", hours, estimatedHours)
  }

  const handleTrackedChange = async (hours: number) => {
    setTrackedHours(hours)
    await handleFieldUpdate("trackedHours", hours, trackedHours)
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
      await createActivity({
        workItemId: task._id,
        action: "commented",
      })
      setNewComment("")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleCreateChecklist = async () => {
    if (!newChecklistTitle.trim() || !task) return

    await createChecklist({
      workItemId: task._id,
      title: newChecklistTitle.trim(),
    })

    setNewChecklistTitle("")
    setIsCreatingChecklist(false)
  }

  const handleAddChecklistItem = async (checklistId: string) => {
    const itemText = newChecklistItem[checklistId]
    if (!itemText?.trim()) return

    await addChecklistItem({
      checklistId: checklistId as any,
      text: itemText.trim(),
    })

    setNewChecklistItem({ ...newChecklistItem, [checklistId]: "" })
  }

  const handleToggleChecklistItem = async (checklistId: string, itemId: string) => {
    await toggleChecklistItem({
      checklistId: checklistId as any,
      itemId,
    })
  }

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !task || !workspaceId) return

    setIsAddingSubtask(true)
    try {
      await createSubtask({
        parentId: task._id,
        title: newSubtaskTitle.trim(),
        workspaceId: workspaceId as any,
      })
      setNewSubtaskTitle("")
    } finally {
      setIsAddingSubtask(false)
    }
  }

  const handleToggleSubtask = async (subtaskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "backlog" : "done"
    await updateTask({
      workItemId: subtaskId as any,
      status: newStatus,
    })
  }

  const handleAddRelationship = async (targetItemId: string) => {
    if (!task) return

    await createLink({
      fromItemId: task._id,
      toItemId: targetItemId as any,
      linkType: relationshipType,
    })
  }

  const handleRemoveRelationship = async (linkId: string) => {
    await deleteLink({
      linkId: linkId as any,
    })
  }

  const getActivityIcon = (entry: any) => {
    if (entry.content) return <Send className="h-3.5 w-3.5" />
    
    const action = entry.action
    switch (action) {
      case "created": return <Plus className="h-3.5 w-3.5" />
      case "commented": return <Send className="h-3.5 w-3.5" />
      case "assigned": return <UserIcon className="h-3.5 w-3.5" />
      case "status_changed": return <Target className="h-3.5 w-3.5" />
      default: return <ChevronRight className="h-3.5 w-3.5" />
    }
  }

  const getActivityText = (entry: any) => {
    if (entry.content) {
      const userName = entry.author?.name || "Someone"
      return `${userName} commented`
    }

    const userName = entry.user?.name || "Someone"
    const action = entry.action
    
    switch (action) {
      case "created": return `${userName} created this task`
      case "updated": return `${userName} updated ${entry.field || "the task"}`
      case "commented": return `${userName} commented`
      case "assigned": return `${userName} assigned this task`
      case "unassigned": return `${userName} unassigned this task`
      case "status_changed": return `${userName} changed status`
      case "added_tag": return `${userName} added tag "${entry.newValue}"`
      case "removed_tag": return `${userName} removed tag "${entry.oldValue}"`
      default: return `${userName} ${action}`
    }
  }

  // Merge and sort comments and activities
  const timeline = React.useMemo(() => {
    const combined = [
      ...comments.map((c: any) => ({ ...c, type: 'comment', timestamp: c._creationTime })),
      ...activities.map((a: any) => ({ ...a, type: 'activity', timestamp: a._creationTime })),
    ]
    return combined.sort((a, b) => b.timestamp - a.timestamp)
  }, [comments, activities])

  const timeProgress = estimatedHours && trackedHours 
    ? Math.min((trackedHours / estimatedHours) * 100, 100)
    : 0

  if (!task) return null

  return (
    <>
      {/* Minimal Header */}
      <div className="flex items-center justify-end px-4 py-2.5 border-b flex-shrink-0 bg-background">
        <div className="flex items-center gap-2">
          {viewModeSwitcher}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1">
            <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
              {/* Title - Large and Prominent */}
              <div>
                <Input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="text-4xl font-bold border-none shadow-none focus-visible:ring-0 px-0 py-3 h-auto"
                  placeholder="Task title..."
                />
              </div>

              {/* Properties Grid - 2 Columns */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Status</Label>
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
                  <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
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

                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Start Date</Label>
                  <DatePicker
                    date={startDate}
                    onSelect={handleStartDateChange}
                    placeholder="Set start date"
                    maxDate={endDate}
                    className="h-9 w-full"
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Due Date</Label>
                  <DatePicker
                    date={endDate}
                    onSelect={handleEndDateChange}
                    placeholder="Set due date"
                    minDate={startDate}
                    className="h-9 w-full"
                  />
                </div>

                {/* Assignees */}
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">Assignees</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-9"
                      >
                        <UserIcon className="h-4 w-4 mr-2" />
                        {assignees.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {assignees.slice(0, 3).map((userId) => (
                                <Avatar key={userId} className="h-6 w-6 border-2 border-background">
                                  <AvatarFallback className="text-xs">
                                    {getMemberInitials(userId)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <span className="text-sm">
                              {assignees.length > 3 && `+${assignees.length - 3} more`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Select assignees</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search members..." className="h-9" />
                        <CommandEmpty>No member found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-y-auto">
                          {workspaceMembers.map((member: any) => (
                            <CommandItem
                              key={member.userId}
                              value={member.userId}
                              onSelect={() => handleAssigneeToggle(member.userId)}
                            >
                              <Checkbox
                                checked={assignees.includes(member.userId)}
                                className="mr-2"
                              />
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback className="text-xs">
                                  {getMemberInitials(member.userId)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{getMemberName(member.userId)}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Tags */}
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="pl-2.5 pr-1.5 py-1"
                      >
                        {tag}
                        <button
                          onClick={() => handleToggleTag(tag)}
                          className="ml-1.5 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7">
                          <Plus className="h-3 w-3 mr-1" />
                          Add tag
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[240px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search or create tag..." />
                          <CommandEmpty>
                            <div className="p-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-full justify-start text-xs"
                                onClick={() => {
                                  const input = document.querySelector('[placeholder="Search or create tag..."]') as HTMLInputElement
                                  if (input?.value) {
                                    handleAddTag(input.value)
                                    input.value = ""
                                  }
                                }}
                              >
                                <Plus className="h-3 w-3 mr-2" />
                                Create tag
                              </Button>
                            </div>
                          </CommandEmpty>
                          <CommandGroup className="max-h-48 overflow-y-auto">
                            {projectTags.map((tag: any) => (
                              <CommandItem
                                key={tag._id}
                                value={tag.name}
                                onSelect={() => handleToggleTag(tag.name)}
                              >
                                <Checkbox
                                  checked={tags.includes(tag.name)}
                                  className="mr-2"
                                />
                                <span className="text-sm">{tag.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Time Tracking */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">Time Tracking</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Estimated (hours)</Label>
                    <Input
                      type="number"
                      value={estimatedHours || ""}
                      onChange={(e) => handleEstimateChange(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Tracked (hours)</Label>
                    <Input
                      type="number"
                      value={trackedHours || ""}
                      onChange={(e) => handleTrackedChange(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="h-9"
                    />
                  </div>
                </div>
                {estimatedHours && estimatedHours > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {trackedHours || 0}h / {estimatedHours}h ({Math.round(timeProgress)}%)
                      </span>
                    </div>
                    <Progress value={timeProgress} className="h-2" />
                  </div>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Description</Label>
                <div className="border rounded-lg overflow-hidden bg-background">
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Add a description..."
                    padding="pl-10 pr-4 py-4"
                    showDragHandle={true}
                    showPlusButton={false}
                    minHeight="min-h-[400px]"
                  />
                </div>
              </div>

              <Separator />

              {/* Checklists */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    Checklists
                  </Label>
                  {!isCreatingChecklist && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreatingChecklist(true)}
                      className="h-8"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Checklist
                    </Button>
                  )}
                </div>

                {isCreatingChecklist && (
                  <div className="flex gap-2">
                    <Input
                      value={newChecklistTitle}
                      onChange={(e) => setNewChecklistTitle(e.target.value)}
                      placeholder="Checklist title..."
                      className="h-9"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateChecklist()
                        if (e.key === "Escape") {
                          setIsCreatingChecklist(false)
                          setNewChecklistTitle("")
                        }
                      }}
                      autoFocus
                    />
                    <Button size="sm" onClick={handleCreateChecklist} className="h-9">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsCreatingChecklist(false)
                        setNewChecklistTitle("")
                      }}
                      className="h-9"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {checklists.map((checklist: any) => (
                  <div key={checklist._id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{checklist.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {checklist.items.filter((i: any) => i.completed).length} / {checklist.items.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {checklist.items
                        .sort((a: any, b: any) => a.order - b.order)
                        .map((item: any) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={() => handleToggleChecklistItem(checklist._id, item.id)}
                            />
                            <span className={cn("text-sm flex-1", item.completed && "line-through text-muted-foreground")}>
                              {item.text}
                            </span>
                          </div>
                        ))}

                      <div className="flex gap-2 mt-3">
                        <Input
                          value={newChecklistItem[checklist._id] || ""}
                          onChange={(e) => setNewChecklistItem({ ...newChecklistItem, [checklist._id]: e.target.value })}
                          placeholder="Add item..."
                          className="h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddChecklistItem(checklist._id)
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddChecklistItem(checklist._id)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Subtasks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      Subtasks
                    </Label>
                    {subtasks.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {subtasks.filter((s: any) => s.workItem?.status === "done").length} / {subtasks.length}
                      </Badge>
                    )}
                  </div>
                </div>

                {subtasks.length > 0 && (
                  <div className="space-y-2">
                    {subtasks.map((subtask: any) => (
                      <div
                        key={subtask.link._id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                      >
                        <Checkbox
                          checked={subtask.workItem?.status === "done"}
                          onCheckedChange={() => handleToggleSubtask(subtask.workItem._id, subtask.workItem.status)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium",
                            subtask.workItem?.status === "done" && "line-through text-muted-foreground"
                          )}>
                            {subtask.workItem?.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {subtask.workItem?.assignees?.length > 0 && (
                              <div className="flex -space-x-1">
                                {subtask.workItem.assignees.slice(0, 3).map((userId: string) => (
                                  <Avatar key={userId} className="h-5 w-5 border-2 border-background">
                                    <AvatarFallback className="text-[10px]">
                                      {getMemberInitials(userId)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                            )}
                            {subtask.workItem?.endDate && (
                              <Badge variant="outline" className="text-xs h-5">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(subtask.workItem.endDate).toLocaleDateString()}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs h-5 capitalize">
                              {subtask.workItem?.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {subtasks.length > 0 && (
                  <Progress 
                    value={(subtasks.filter((s: any) => s.workItem?.status === "done").length / subtasks.length) * 100} 
                    className="h-2"
                  />
                )}

                <div className="flex gap-2">
                  <Input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a subtask..."
                    className="h-9 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddSubtask()
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddSubtask}
                    disabled={!newSubtaskTitle.trim() || isAddingSubtask}
                    className="h-9"
                  >
                    {isAddingSubtask ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Relationships */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Relationships
                  </Label>
                  <Popover open={isAddingRelationship} onOpenChange={setIsAddingRelationship}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add Link
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="p-3 border-b space-y-2">
                        <Label className="text-xs">Link Type</Label>
                        <Select value={relationshipType} onValueChange={(v: any) => setRelationshipType(v)}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blocks">Blocks</SelectItem>
                            <SelectItem value="blocked_by">Blocked By</SelectItem>
                            <SelectItem value="relates_to">Relates To</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Command>
                        <CommandInput placeholder="Search tasks..." className="h-9" />
                        <CommandEmpty>No task found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-y-auto">
                          {allWorkItems
                            .filter((item: any) => item._id !== task?._id && item.type === "task")
                            .map((item: any) => (
                              <CommandItem
                                key={item._id}
                                value={item.title}
                                onSelect={() => {
                                  handleAddRelationship(item._id)
                                  setIsAddingRelationship(false)
                                }}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">{item.title}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{item.status}</p>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Blocks */}
                {relationships?.blocks && relationships.blocks.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">Blocks</Label>
                    {relationships.blocks.map((rel: any) => (
                      <div
                        key={rel.link._id}
                        className="flex items-center gap-2 p-2 rounded border bg-card group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{rel.workItem?.title}</p>
                          <Badge variant="secondary" className="text-xs mt-1 capitalize">
                            {rel.workItem?.status}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveRelationship(rel.link._id)}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Blocked By */}
                {relationships?.blockedBy && relationships.blockedBy.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">Blocked By</Label>
                    {relationships.blockedBy.map((rel: any) => (
                      <div
                        key={rel.link._id}
                        className="flex items-center gap-2 p-2 rounded border bg-card group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{rel.workItem?.title}</p>
                          <Badge variant="secondary" className="text-xs mt-1 capitalize">
                            {rel.workItem?.status}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveRelationship(rel.link._id)}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Relates To */}
                {relationships?.relatesTo && relationships.relatesTo.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">Relates To</Label>
                    {relationships.relatesTo.map((rel: any) => (
                      <div
                        key={rel.link._id}
                        className="flex items-center gap-2 p-2 rounded border bg-card group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{rel.workItem?.title}</p>
                          <Badge variant="secondary" className="text-xs mt-1 capitalize">
                            {rel.workItem?.status}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveRelationship(rel.link._id)}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {(!relationships?.blocks || relationships.blocks.length === 0) &&
                 (!relationships?.blockedBy || relationships.blockedBy.length === 0) &&
                 (!relationships?.relatesTo || relationships.relatesTo.length === 0) && (
                  <p className="text-sm text-muted-foreground">No relationships yet</p>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar - Unified Timeline */}
        <div className="w-96 flex-shrink-0 flex flex-col border-l bg-muted/10">
          <div className="px-4 py-3 border-b">
            <h3 className="text-sm font-semibold">Activity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {timeline.length} {timeline.length === 1 ? 'update' : 'updates'}
            </p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {timeline.map((entry: any) => (
                <div key={entry._id} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center",
                      entry.type === 'comment' ? "bg-primary/10 text-primary" : "bg-muted"
                    )}>
                      {getActivityIcon(entry)}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm">
                      {getActivityText(entry)}
                    </p>
                    {entry.content && (
                      <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2 mt-1 whitespace-pre-wrap break-words">
                        {entry.content}
                      </p>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Comment Input at Bottom */}
          <div className="p-4 border-t bg-background space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="resize-none min-h-[80px] text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmitComment()
                }
              }}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmittingComment}
                className="h-8"
              >
                {isSubmittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1.5" />
                    Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
