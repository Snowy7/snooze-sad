"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Plus, Trash2, ListTodo } from "lucide-react"
import { useOwnerId } from "@/hooks/use-owner"

export default function DailyPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const ownerId = useOwnerId()
  const tasks = useQuery(api.functions.tasksByDate, { date: today, ownerId }) || []
  const upsertTask = useMutation(api.functions.upsertTask)
  const deleteTask = useMutation(api.functions.deleteTask)
  const [title, setTitle] = useState("")

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

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Add a task for today..." 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && addTask()}
            className="flex-1"
          />
          <Button onClick={addTask}><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-1 mb-4">
          <h2 className="text-lg font-semibold">Today's Tasks</h2>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
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
