"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Plus, Trash2, ListTodo, Settings, RotateCcw } from "lucide-react"
import { useOwnerId } from "@/hooks/use-owner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DailyPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const ownerId = useOwnerId()
  const tasks = useQuery(api.functions.tasksByDate, { date: today, ownerId }) || []
  const templates = useQuery(api.functions.listDailyTaskTemplates, { ownerId }) || []
  const upsertTask = useMutation(api.functions.upsertTask)
  const deleteTask = useMutation(api.functions.deleteTask)
  const generateDailyTasks = useMutation(api.functions.generateDailyTasks)
  const upsertTemplate = useMutation(api.functions.upsertDailyTaskTemplate)
  const deleteTemplate = useMutation(api.functions.deleteDailyTaskTemplate)
  
  const [title, setTitle] = useState("")
  const [templateTitle, setTemplateTitle] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)

  // Auto-generate daily tasks on page load
  useEffect(() => {
    if (ownerId && templates.length > 0) {
      generateDailyTasks({ ownerId, date: today })
    }
  }, [ownerId, today, templates.length])

  async function addTask() {
    if (!title.trim()) return
    toast.promise(
      upsertTask({ title, date: today, isDaily: true, status: "pending", ownerId }),
      {
        loading: 'Adding task...',
        success: 'Task added',
        error: 'Failed to add task'
      }
    )
    setTitle("")
  }

  async function addTemplate() {
    if (!templateTitle.trim()) return
    toast.promise(
      upsertTemplate({ ownerId, title: templateTitle, isActive: true }),
      {
        loading: 'Adding template...',
        success: 'Template added',
        error: 'Failed to add template'
      }
    )
    setTemplateTitle("")
  }

  async function toggleTemplate(template: any) {
    toast.promise(
      upsertTemplate({ id: template._id, ownerId, title: template.title, isActive: !template.isActive }),
      {
        loading: 'Updating...',
        success: 'Template updated',
        error: 'Failed to update template'
      }
    )
  }

  async function handleDeleteTemplate(id: string) {
    toast.promise(
      deleteTemplate({ id: id as any }),
      {
        loading: 'Deleting...',
        success: 'Template deleted',
        error: 'Failed to delete template'
      }
    )
  }

  async function toggleTask(task: any) {
    toast.promise(
      upsertTask({ id: task._id, status: task.status === "done" ? "pending" : "done" } as any),
      {
        loading: 'Updating...',
        success: 'Task updated',
        error: 'Failed to update task'
      }
    )
  }

  async function handleDeleteTask(id: string) {
    toast.promise(
      deleteTask({ id: id as any }),
      {
        loading: 'Deleting...',
        success: 'Task deleted',
        error: 'Failed to delete task'
      }
    )
  }

  async function regenerateTasks() {
    toast.promise(
      generateDailyTasks({ ownerId, date: today }),
      {
        loading: 'Regenerating tasks...',
        success: (result: any) => `Generated ${result.created} new tasks`,
        error: 'Failed to regenerate tasks'
      }
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ListTodo className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Daily Tasks</h1>
              <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Daily Task Templates</DialogTitle>
                  <DialogDescription>
                    Templates automatically create tasks every day. Toggle them on/off as needed.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="New template..."
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTemplate()}
                    />
                    <Button onClick={addTemplate}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {templates.map((template: any) => (
                      <div key={template._id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <Checkbox
                          checked={template.isActive}
                          onCheckedChange={() => toggleTemplate(template)}
                        />
                        <span className={`flex-1 ${!template.isActive ? "text-muted-foreground line-through" : ""}`}>
                          {template.title}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTemplate(template._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {templates.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No templates yet. Add one to get started!
                      </p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={regenerateTasks} title="Regenerate tasks from templates">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              {tasks.filter(t => t.status === "done").length} / {tasks.length}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Input 
            placeholder="Add a one-time task for today..." 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && addTask()}
            className="flex-1"
          />
          <Button onClick={addTask}><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>
        <ul className="space-y-2">
          {tasks.length === 0 ? (
            <li className="text-center py-12 text-muted-foreground">
              <div className="space-y-2">
                <ListTodo className="h-12 w-12 mx-auto opacity-50" />
                <div>No tasks yet. Add one above!</div>
              </div>
            </li>
          ) : (
            tasks.map((t: any) => (
              <li key={t._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group">
                <Checkbox 
                  checked={t.status === "done"} 
                  onCheckedChange={() => toggleTask(t)}
                />
                <span className={`flex-1 ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  onClick={() => handleDeleteTask(t._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))
          )}
        </ul>
        {tasks.length > 0 && (
          <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {tasks.filter((t: any) => t.status === "done").length} of {tasks.length} completed
            </span>
            <span className="font-medium">
              {Math.round((tasks.filter((t: any) => t.status === "done").length / tasks.length) * 100)}%
            </span>
          </div>
        )}
      </Card>
    </div>
  )
}
