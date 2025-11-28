"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  projectId?: string
  onTaskCreated?: (taskId: string) => void
  defaultMilestoneId?: string
  defaultSprintId?: string
  defaultTaskListId?: string
}

export function EnhancedTaskDialog({
  open,
  onOpenChange,
  workspaceId,
  projectId,
  onTaskCreated,
  defaultMilestoneId,
  defaultSprintId,
  defaultTaskListId,
}: EnhancedTaskDialogProps) {
  const createTask = useMutation(api.workItems.createWorkItem)
  const assignToMilestone = useMutation(api.milestones.assignTaskToMilestone)
  const assignToSprint = useMutation(api.sprints.assignTaskToSprint)
  const assignToTaskList = useMutation(api.taskLists.assignTaskToList)
  
  const milestones = useQuery(
    api.milestones.listMilestones,
    projectId ? { projectId: projectId as any } : "skip"
  ) || []
  
  const sprints = useQuery(
    api.sprints.listSprints,
    projectId ? { projectId: projectId as any } : "skip"
  ) || []
  
  const taskLists = useQuery(
    api.taskLists.listTaskLists,
    projectId ? { projectId: projectId as any } : "skip"
  ) || []
  
  const workspaceMembers = useQuery(
    api.workspaces.listMembers,
    workspaceId ? { workspaceId: workspaceId as any } : "skip"
  ) || []
  
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    priority: "medium",
    status: "backlog",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    milestoneId: defaultMilestoneId || "",
    sprintId: defaultSprintId || "",
    taskListId: defaultTaskListId || "",
    assignees: [] as string[],
  })
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const handleSubmit = async () => {
    if (!formData.title.trim()) return
    
    // Validate dates
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      alert("End date must be after start date")
      return
    }
    
    setIsSubmitting(true)
    try {
      const taskId = await createTask({
        workspaceId: workspaceId as any,
        type: "task",
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority as any,
        status: formData.status,
        startDate: formData.startDate?.toISOString(),
        dueDate: formData.endDate?.toISOString(),
        assignedTo: formData.assignees.length > 0 ? formData.assignees[0] : undefined,
      })
      
      // Assign to milestone if selected
      if (formData.milestoneId) {
        await assignToMilestone({
          taskId: taskId as any,
          milestoneId: formData.milestoneId as any,
        })
      }
      
      // Assign to sprint if selected
      if (formData.sprintId) {
        await assignToSprint({
          taskId: taskId as any,
          sprintId: formData.sprintId as any,
        })
      }
      
      // Assign to task list if selected
      if (formData.taskListId) {
        await assignToTaskList({
          taskId: taskId as any,
          taskListId: formData.taskListId as any,
        })
      }
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "backlog",
        startDate: undefined,
        endDate: undefined,
        milestoneId: defaultMilestoneId || "",
        sprintId: defaultSprintId || "",
        taskListId: defaultTaskListId || "",
        assignees: [],
      })
      
      onTaskCreated?.(taskId as any)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create task:", error)
      alert("Failed to create task")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const toggleAssignee = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter((id) => id !== userId)
        : [...prev.assignees, userId],
    }))
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task with all the details.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title..."
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task description..."
              rows={3}
            />
          </div>
          
          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
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
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <DatePicker
                date={formData.startDate}
                onSelect={(date) => setFormData({ ...formData, startDate: date })}
                placeholder="Select start date"
                maxDate={formData.endDate}
              />
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <DatePicker
                date={formData.endDate}
                onSelect={(date) => setFormData({ ...formData, endDate: date })}
                placeholder="Select end date"
                minDate={formData.startDate}
              />
            </div>
          </div>
          
          {/* Milestone, Sprint, Task List */}
          {projectId && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Milestone</Label>
                <Select
                  value={formData.milestoneId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, milestoneId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {milestones.map((milestone: any) => (
                      <SelectItem key={milestone._id} value={milestone._id}>
                        {milestone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Sprint</Label>
                <Select
                  value={formData.sprintId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, sprintId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {sprints.map((sprint: any) => (
                      <SelectItem key={sprint._id} value={sprint._id}>
                        {sprint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Task List</Label>
                <Select
                  value={formData.taskListId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, taskListId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {taskLists.map((list: any) => (
                      <SelectItem key={list._id} value={list._id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Assignees */}
          <div className="space-y-2">
            <Label>Assignees</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px]">
              {formData.assignees.length === 0 ? (
                <span className="text-sm text-muted-foreground">No assignees selected</span>
              ) : (
                formData.assignees.map((userId) => {
                  const member = workspaceMembers.find((m: any) => m.userId === userId)
                  return (
                    <Badge key={userId} variant="secondary" className="gap-1">
                      {member?.userId || "Unknown"}
                      <button
                        type="button"
                        onClick={() => toggleAssignee(userId)}
                        className="ml-1 hover:bg-destructive/20 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })
              )}
            </div>
            <Select onValueChange={toggleAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Add assignee..." />
              </SelectTrigger>
              <SelectContent>
                {workspaceMembers.map((member: any) => (
                  <SelectItem
                    key={member.userId}
                    value={member.userId}
                    disabled={formData.assignees.includes(member.userId)}
                  >
                    {member.userId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title.trim() || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

