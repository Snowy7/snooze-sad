"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { X } from "lucide-react"

export function TaskEditDialog({ task, projectId, open, onClose }: any) {
  const upsertTask = useMutation(api.functions.upsertTask)
  const details = useQuery(api.functions.getProjectDetails, projectId ? { projectId } : "skip")
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [estimatedHours, setEstimatedHours] = useState("")
  const [labels, setLabels] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newLabel, setNewLabel] = useState("")
  const [newTag, setNewTag] = useState("")
  const [milestoneId, setMilestoneId] = useState("")
  const [sprintId, setSprintId] = useState("")

  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setPriority(task.priority || "")
      setStartDate(task.startDate || "")
      setEndDate(task.endDate || "")
      setEstimatedHours(task.estimatedHours?.toString() || "")
      setLabels(task.labels || [])
      setTags(task.tags || [])
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

  function addTag() {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag))
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
      priority: priority || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      labels: labels.length > 0 ? labels : undefined,
      tags: tags.length > 0 ? tags : undefined,
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task?._id ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Task title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={3}
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input 
                id="estimatedHours" 
                type="number" 
                step="0.5"
                value={estimatedHours} 
                onChange={e => setEstimatedHours(e.target.value)} 
                placeholder="e.g., 4"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input 
                id="startDate" 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
              />
            </div>

            <div>
              <Label htmlFor="endDate">Due Date</Label>
              <Input 
                id="endDate" 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          {details?.milestones && details.milestones.length > 0 && (
            <div>
              <Label htmlFor="milestone">Milestone</Label>
              <Select value={milestoneId} onValueChange={setMilestoneId}>
                <SelectTrigger>
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
              <Label htmlFor="sprint">Sprint</Label>
              <Select value={sprintId} onValueChange={setSprintId}>
                <SelectTrigger>
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

          <div>
            <Label>Labels</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={newLabel} 
                onChange={e => setNewLabel(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                placeholder="Add label..."
                className="flex-1"
              />
              <Button type="button" size="sm" onClick={addLabel}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {labels.map(label => (
                <Badge key={label} variant="secondary" className="gap-1">
                  {label}
                  <button type="button" onClick={() => removeLabel(label)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={newTag} 
                onChange={e => setNewTag(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1"
              />
              <Button type="button" size="sm" onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="outline" className="gap-1">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
