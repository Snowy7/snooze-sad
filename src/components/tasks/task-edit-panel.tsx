"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import { Calendar, User as UserIcon, Tag, Clock, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useDebounce } from "@/hooks/use-debounce"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskEditPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: any
  workspaceId: string
  projectId?: string
  hideHeader?: boolean
  hideTitleField?: boolean
}

export function TaskEditPanel({
  open,
  onOpenChange,
  task,
  workspaceId,
  projectId,
  hideHeader = false,
  hideTitleField = false,
}: TaskEditPanelProps) {
  const updateTask = useMutation(api.workItems.updateWorkItem)

  const workspaceMembers = useQuery(
    api.workspaces.listMembers,
    workspaceId ? { workspaceId: workspaceId as any } : "skip"
  ) || []

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [priority, setPriority] = React.useState("medium")
  const [status, setStatus] = React.useState("backlog")
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
  const [assignees, setAssignees] = React.useState<string[]>([])
  const [isSaving, setIsSaving] = React.useState(false)

  // Debounced values for auto-save
  const debouncedTitle = useDebounce(title, 500)
  const debouncedDescription = useDebounce(description, 1000)

  // Initialize form when task changes
  React.useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setPriority(task.priority || "medium")
      setStatus(task.status || "backlog")
      setStartDate(task.startDate ? new Date(task.startDate) : undefined)
      setEndDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setAssignees(task.assignees || [])
    }
  }, [task])

  // Auto-save title
  React.useEffect(() => {
    if (!task || !debouncedTitle || debouncedTitle === task.title) return

    const save = async () => {
      setIsSaving(true)
      try {
        await updateTask({
          workItemId: task._id as any,
          title: debouncedTitle,
        })
      } finally {
        setIsSaving(false)
      }
    }
    save()
  }, [debouncedTitle, task, updateTask])

  // Auto-save description
  React.useEffect(() => {
    if (!task || debouncedDescription === task.description) return

    const save = async () => {
      setIsSaving(true)
      try {
        await updateTask({
          workItemId: task._id as any,
          description: debouncedDescription || undefined,
        })
      } finally {
        setIsSaving(false)
      }
    }
    save()
  }, [debouncedDescription, task, updateTask])

  const handleUpdate = async (field: string, value: any) => {
    if (!task) return

    setIsSaving(true)
    try {
      await updateTask({
        workItemId: task._id as any,
        [field]: value,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePriorityChange = (value: string) => {
    setPriority(value)
    handleUpdate("priority", value)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    handleUpdate("status", value)
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    handleUpdate("startDate", date?.toISOString())
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    handleUpdate("dueDate", date?.toISOString())
  }

  const handleAssigneeToggle = (userId: string) => {
    const newAssignees = assignees.includes(userId)
      ? assignees.filter((id) => id !== userId)
      : [...assignees, userId]
    setAssignees(newAssignees)
    handleUpdate("assignees", newAssignees.length > 0 ? newAssignees : undefined)
  }

  const getMemberName = (userId: string) => {
    const member = workspaceMembers.find((m: any) => m.userId === userId)
    return member?.user?.fullName || member?.user?.email || userId
  }

  const getMemberInitials = (userId: string) => {
    const name = getMemberName(userId)
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "default"
      case "in_progress":
        return "default"
      case "todo":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (!task) return null

  const content = (
    <>
      {!hideHeader && (
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-medium">Task Details</SheetTitle>
            {isSaving && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </div>
            )}
          </div>
        </SheetHeader>
      )}

      <ScrollArea className="flex-1">
        <div className="px-6 py-4 space-y-6">
            {/* Title - conditionally rendered */}
            {!hideTitleField && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  className="text-lg font-medium border-none px-2 py-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            )}

            {!hideTitleField && <Separator />}

            {/* Quick Actions Row */}
            <div className="grid grid-cols-2 gap-3">
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
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
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
                  className="h-9"
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
                  className="h-9"
                />
              </div>
            </div>

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
                            <span className="text-xs max-w-[80px] truncate">{getMemberName(userId)}</span>
                            <X className="h-3 w-3 hover:text-destructive" />
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Select assignees...</span>
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
                          <div className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            assignees.includes(member.userId)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}>
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

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Description</Label>
              <div className="border rounded-lg overflow-hidden bg-background max-h-[200px]">
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Add a description..."
                  padding="pl-10 pr-3 py-2"
                  showDragHandle={true}
                  showPlusButton={false}
                  minHeight="min-h-[80px]"
                  className="max-h-[180px] overflow-y-auto"
                />
              </div>
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
      </>
    )

  if (hideHeader) {
    return content
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">
        {content}
      </SheetContent>
    </Sheet>
  )
}
