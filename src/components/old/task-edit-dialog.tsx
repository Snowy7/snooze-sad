"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { X, Plus, Check, MessageSquare, CheckSquare, Calendar, Clock, Zap, Trash2, Send } from "lucide-react"
import { format } from "date-fns"

export function TaskEditDialog({ task, projectId, open, onClose }: any) {
  const { user } = useAuth()
  const userId = user?.id || user?.externalId || ""

  const upsertTask = useMutation(api.functions.upsertTask)
  const details = useQuery(api.projects.getProjectDetails, projectId ? { projectId } : "skip")
  const subtasks = useQuery(api.functions.listSubtasks, task?._id ? { taskId: task._id } : "skip")
  const comments = useQuery(api.functions.listComments, task?._id ? { taskId: task._id } : "skip")
  const workspaceMembers = useQuery(
    api.workspaces.getWorkspaceMembers, 
    details?.project?.workspaceId ? { workspaceId: details.project.workspaceId } : "skip"
  )
  
  const addSubtask = useMutation(api.functions.addSubtask)
  const toggleSubtask = useMutation(api.functions.toggleSubtask)
  const deleteSubtask = useMutation(api.functions.deleteSubtask)
  const addComment = useMutation(api.functions.addComment)
  const deleteComment = useMutation(api.functions.deleteComment)
  
  // Task fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [estimatedHours, setEstimatedHours] = useState("")
  const [storyPoints, setStoryPoints] = useState("")
  const [labels, setLabels] = useState<string[]>([])
  const [assignees, setAssignees] = useState<string[]>([])
  const [newLabel, setNewLabel] = useState("")
  const [milestoneId, setMilestoneId] = useState("")
  const [sprintId, setSprintId] = useState("")
  
  // Subtasks & Comments
  const [newSubtask, setNewSubtask] = useState("")
  const [newComment, setNewComment] = useState("")
  const [activeTab, setActiveTab] = useState<"details" | "subtasks" | "comments">("details")

  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setStatus(task.status || "backlog")
      setPriority(task.priority || "")
      setStartDate(task.startDate || "")
      setEndDate(task.endDate || "")
      setEstimatedHours(task.estimatedHours?.toString() || "")
      setStoryPoints(task.storyPoints?.toString() || "")
      setLabels(task.labels || [])
      setAssignees(task.assignees || [])
      setMilestoneId(task.milestoneId || "")
      setSprintId(task.sprintId || "")
    }
  }, [task])

  function addLabel() {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()])
      setNewLabel("")
    }
  }

  function removeLabel(label: string) {
    setLabels(labels.filter(l => l !== label))
  }

  function toggleAssignee(userId: string) {
    if (assignees.includes(userId)) {
      setAssignees(assignees.filter(a => a !== userId))
    } else {
      setAssignees([...assignees, userId])
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    const data: any = {
      id: task?._id,
      projectId,
      title,
      description,
      status: status || undefined,
      priority: priority || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      storyPoints: storyPoints ? parseFloat(storyPoints) : undefined,
      labels: labels.length > 0 ? labels : undefined,
      assignees: assignees.length > 0 ? assignees : undefined,
      milestoneId: milestoneId || undefined,
      sprintId: sprintId || undefined,
    }

    toast.promise(
      upsertTask(data),
      {
        loading: 'Saving task...',
        success: 'Task saved',
        error: 'Failed to save task'
      }
    )
    onClose()
  }

  async function handleAddSubtask() {
    if (!newSubtask.trim() || !task?._id) return
    
    await addSubtask({
      taskId: task._id,
      title: newSubtask.trim(),
    })
    setNewSubtask("")
  }

  async function handleAddComment() {
    if (!newComment.trim() || !task?._id) return
    
    await addComment({
      taskId: task._id,
      userId,
      content: newComment.trim(),
    })
    setNewComment("")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">{task?._id ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* LEFT SECTION - Main Details */}
            <div className="lg:col-span-2 space-y-5">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-base font-semibold">Title *</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Task title"
                  className="mt-2 text-lg"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={4}
                  placeholder="Describe the task..."
                  className="mt-2"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">To do</SelectItem>
                      <SelectItem value="in_progress">Working on it</SelectItem>
                      <SelectItem value="in_review">In review</SelectItem>
                      <SelectItem value="stuck">Stuck</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabs for Subtasks & Comments */}
              {task?._id && (
                <div className="mt-6">
                  <div className="flex gap-4 border-b">
                    <button
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "subtasks"
                          ? "border-blue-500 text-blue-500"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setActiveTab("subtasks")}
                    >
                      <CheckSquare className="h-4 w-4 inline mr-2" />
                      Subtasks ({subtasks?.length || 0})
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "comments"
                          ? "border-blue-500 text-blue-500"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setActiveTab("comments")}
                    >
                      <MessageSquare className="h-4 w-4 inline mr-2" />
                      Comments ({comments?.length || 0})
                    </button>
                  </div>

                  <div className="mt-4">
                    {activeTab === "subtasks" && (
                      <div className="space-y-3">
                        {/* Add Subtask */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a subtask..."
                            value={newSubtask}
                            onChange={e => setNewSubtask(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleAddSubtask()}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={handleAddSubtask}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Subtasks List */}
                        {subtasks && subtasks.length > 0 ? (
                          <div className="space-y-2">
                            {subtasks.map((subtask: any) => (
                              <div key={subtask._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                                <Checkbox
                                  checked={subtask.completed}
                                  onCheckedChange={() => toggleSubtask({ id: subtask._id })}
                                />
                                <span className={`flex-1 text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                                  {subtask.title}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => deleteSubtask({ id: subtask._id })}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No subtasks yet</p>
                        )}
                      </div>
                    )}

                    {activeTab === "comments" && (
                      <div className="space-y-4">
                        {/* Add Comment */}
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            rows={2}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={handleAddComment}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Comments List */}
                        {comments && comments.length > 0 ? (
                          <div className="space-y-3">
                            {comments.map((comment: any) => (
                              <div key={comment._id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarImage src={comment.user?.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {comment.user?.name?.[0]?.toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{comment.user?.name || "User"}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                                      </span>
                                      {comment.userId === userId && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0"
                                          onClick={() => deleteComment({ id: comment._id })}
                                        >
                                          <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SECTION - Metadata */}
            <div className="space-y-5">
              {/* Dates */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                    <Input 
                      id="startDate" 
                      type="date" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-xs">Due Date</Label>
                    <Input 
                      id="endDate" 
                      type="date" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)}
                      className="mt-1" 
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Estimation */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Estimation
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="storyPoints" className="text-xs">Story Points</Label>
                    <Input 
                      id="storyPoints" 
                      type="number" 
                      step="0.5"
                      value={storyPoints} 
                      onChange={e => setStoryPoints(e.target.value)} 
                      placeholder="e.g., 3"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedHours" className="text-xs">Hours</Label>
                    <Input 
                      id="estimatedHours" 
                      type="number" 
                      step="0.5"
                      value={estimatedHours} 
                      onChange={e => setEstimatedHours(e.target.value)} 
                      placeholder="e.g., 8"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Assignees */}
              {workspaceMembers && workspaceMembers.length > 0 && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Assignees</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {workspaceMembers.map((member: any) => (
                        <div key={member.userId} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleAssignee(member.userId)}
                        >
                          <Checkbox
                            checked={assignees.includes(member.userId)}
                            onCheckedChange={() => toggleAssignee(member.userId)}
                          />
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.user?.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.user?.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.user?.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Labels */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Labels</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newLabel} 
                    onChange={e => setNewLabel(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                    placeholder="Add label..."
                    className="flex-1 h-8 text-sm"
                  />
                  <Button type="button" size="sm" onClick={addLabel} className="h-8">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {labels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {labels.map(label => (
                      <Badge key={label} variant="secondary" className="gap-1 text-xs">
                        {label}
                        <button type="button" onClick={() => removeLabel(label)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Project Context */}
              {details?.milestones && details.milestones.length > 0 && (
                <div>
                  <Label htmlFor="milestone" className="text-sm font-semibold">Milestone</Label>
                  <Select value={milestoneId} onValueChange={setMilestoneId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select milestone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {details.milestones.map((m: any) => (
                        <SelectItem key={m._id} value={m._id}>{m.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {details?.sprints && details.sprints.length > 0 && (
                <div>
                  <Label htmlFor="sprint" className="text-sm font-semibold">Sprint</Label>
                  <Select value={sprintId} onValueChange={setSprintId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {details.sprints.map((s: any) => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Task</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
