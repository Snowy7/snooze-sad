"use client"

import { DndContext, DragEndEvent, DragOverlay, useDroppable, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, MoreVertical, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { TaskEditDialog } from "./task-edit-dialog"

export function ProjectKanban({ projectId }: { projectId: any }) {
  const board = useQuery(api.functions.listProjectBoard, { projectId }) as any
  const moveTask = useMutation(api.functions.moveTask)
  const upsertTask = useMutation(api.functions.upsertTask)
  const deleteTask = useMutation(api.functions.deleteTask)
  
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<any | null>(null)
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function onDragStart(evt: any) {
    setActiveId(evt.active.id as string)
  }

  function onDragEnd(evt: DragEndEvent) {
    setActiveId(null)
    const activeId = evt.active.id as string
    const overId = evt.over?.id as string | undefined
    if (!activeId || !overId) return
    const toStatus = (evt.over?.data?.current as any)?.status || overId
    const targetList = (board?.[toStatus] as any[]) || []
    let newIndex = targetList.findIndex(t => t._id === overId)
    if (newIndex === -1) newIndex = targetList.length
    
    toast.promise(
      moveTask({ id: activeId as any, status: toStatus, order: newIndex }),
      { loading: 'Moving task...', success: 'Task moved', error: 'Failed to move task' }
    )
  }

  const allTasks = [...(board?.backlog ?? []), ...(board?.in_progress ?? []), ...(board?.done ?? [])]
  const activeTask = allTasks.find((t: any) => t._id === activeId)

  async function handleDeleteTask(id: string) {
    toast.promise(
      deleteTask({ id: id as any }),
      { loading: 'Deleting task...', success: 'Task deleted', error: 'Failed to delete task' }
    )
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid gap-4 md:grid-cols-3">
          <Column 
            id="backlog" 
            title="Backlog" 
            tasks={(board?.backlog ?? []).map((t: any) => ({ ...t, id: t._id }))} 
            projectId={projectId}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
          />
          <Column 
            id="in_progress" 
            title="In Progress" 
            tasks={(board?.in_progress ?? []).map((t: any) => ({ ...t, id: t._id }))} 
            projectId={projectId}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
          />
          <Column 
            id="done" 
            title="Done" 
            tasks={(board?.done ?? []).map((t: any) => ({ ...t, id: t._id }))} 
            projectId={projectId}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
          />
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="rounded-lg border-2 border-blue-500 bg-card p-3 shadow-xl opacity-90">
              <span className="text-sm font-medium">{activeTask.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskEditDialog 
        task={editingTask} 
        projectId={projectId}
        open={!!editingTask} 
        onClose={() => setEditingTask(null)}
      />
    </>
  )
}

function Column({ id, title, tasks, projectId, onEdit, onDelete }: any) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { status: id } })
  const [titleInput, setTitleInput] = useState("")
  const upsertTask = useMutation(api.functions.upsertTask)

  async function handleAdd() {
    if (!titleInput.trim()) return
    toast.promise(
      upsertTask({ title: titleInput.trim(), projectId, status: id }),
      { loading: 'Creating...', success: 'Task created', error: 'Failed to create task' }
    )
    setTitleInput("")
  }

  return (
    <Card ref={setNodeRef as any} className={`p-4 transition-all ${isOver ? "ring-2 ring-blue-500 bg-blue-500/5" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="flex gap-2 mb-3">
        <Input 
          placeholder="Add task..." 
          value={titleInput} 
          onChange={e => setTitleInput(e.target.value)} 
          className="h-8 text-sm" 
          onKeyDown={e => e.key === 'Enter' && handleAdd()} 
        />
        <Button size="sm" variant="ghost" onClick={handleAdd}><Plus className="h-4 w-4" /></Button>
      </div>
      <SortableContext items={tasks.map((t: any) => t.id)}>
        <ul className="space-y-2">
          {tasks.map((t: any) => (
            <TaskCard 
              key={t.id} 
              task={t}
              onEdit={() => onEdit(t)} 
              onDelete={() => onDelete(t.id)}
            />
          ))}
        </ul>
      </SortableContext>
    </Card>
  )
}

function TaskCard({ task, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id, 
    data: { status: task.status } 
  })
  const style = { transform: CSS.Transform.toString(transform), transition }
  
  const priorityColors: Record<string, string> = {
    high: "bg-red-500/10 text-red-500 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    low: "bg-green-500/10 text-green-500 border-green-500/20",
  }

  return (
    <li ref={setNodeRef as any} style={style} {...attributes} {...listeners} className={`group rounded-lg border bg-card p-3 text-sm hover:border-blue-500/50 transition-all cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50 rotate-3 scale-105" : ""}`}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium">{task.title}</div>
            {task.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</div>}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); onEdit(); }}><MoreVertical className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {task.priority && (
            <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
              {task.priority}
            </Badge>
          )}
          {task.labels?.map((label: string) => (
            <Badge key={label} variant="secondary" className="text-xs">{label}</Badge>
          ))}
          {task.estimatedHours && (
            <Badge variant="outline" className="text-xs">{task.estimatedHours}h</Badge>
          )}
        </div>
        {task.endDate && (
          <div className="text-xs text-muted-foreground">Due: {format(new Date(task.endDate), "MMM d")}</div>
        )}
      </div>
    </li>
  )
}

