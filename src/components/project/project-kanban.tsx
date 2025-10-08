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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Plus, MoreVertical, Trash2, MessageSquare, CheckSquare, AlertCircle, Clock, Zap } from "lucide-react"
import { format } from "date-fns"
import { TaskEditDialog } from "./task-edit-dialog"

const COLUMNS = [
  { id: "backlog", title: "To do", color: "bg-gray-500" },
  { id: "in_progress", title: "Working on it", color: "bg-blue-500" },
  { id: "in_review", title: "In review", color: "bg-purple-500" },
  { id: "stuck", title: "Stuck", color: "bg-red-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
]

export function ProjectKanban({ projectId, isReadOnly = false }: { projectId: any; isReadOnly?: boolean }) {
  const board = useQuery(api.functions.listProjectBoard, { projectId }) as any
  const moveTask = useMutation(api.functions.moveTask)
  const upsertTask = useMutation(api.functions.upsertTask)
  const deleteTask = useMutation(api.functions.deleteTask)
  
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<any | null>(null)
  const [optimisticBoard, setOptimisticBoard] = useState<any>(null)
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  // Use optimistic board if available, otherwise use real board
  const displayBoard = optimisticBoard || board

  function onDragStart(evt: any) {
    setActiveId(evt.active.id as string)
  }

  function onDragEnd(evt: DragEndEvent) {
    setActiveId(null)
    
    if (isReadOnly) {
      toast.error("You don't have permission to move tasks")
      setOptimisticBoard(null)
      return
    }
    
    const activeId = evt.active.id as string
    const overId = evt.over?.id as string | undefined
    if (!activeId || !overId) {
      setOptimisticBoard(null)
      return
    }
    
    const toStatus = (evt.over?.data?.current as any)?.status || overId
    const targetList = (board?.[toStatus] as any[]) || []
    let newIndex = targetList.findIndex(t => t._id === overId)
    if (newIndex === -1) newIndex = targetList.length
    
    // Apply optimistic update immediately
    const newBoard = { ...board }
    let movedTask: any = null
    
    // Find and remove task from its current status
    for (const status in newBoard) {
      const taskIndex = newBoard[status].findIndex((t: any) => t._id === activeId)
      if (taskIndex !== -1) {
        movedTask = { ...newBoard[status][taskIndex], status: toStatus, order: newIndex }
        newBoard[status] = newBoard[status].filter((t: any) => t._id !== activeId)
        break
      }
    }
    
    // Add task to new status
    if (movedTask) {
      if (!newBoard[toStatus]) newBoard[toStatus] = []
      newBoard[toStatus] = [...newBoard[toStatus]]
      newBoard[toStatus].splice(newIndex, 0, movedTask)
      
      // Reorder tasks in the target status
      newBoard[toStatus] = newBoard[toStatus].map((t: any, idx: number) => ({ ...t, order: idx }))
    }
    
    setOptimisticBoard(newBoard)
    
    // Perform actual update
    moveTask({ id: activeId as any, status: toStatus, order: newIndex })
      .then(() => {
        setOptimisticBoard(null)
      })
      .catch((err) => {
        toast.error('Failed to move task')
        setOptimisticBoard(null)
      })
  }

  const allTasks = displayBoard ? Object.values(displayBoard).flat() as any[] : []
  const activeTask = allTasks.find((t: any) => t._id === activeId)

  async function handleDeleteTask(id: string) {
    if (isReadOnly) {
      toast.error("You don't have permission to delete tasks")
      return
    }
    
    toast.promise(
      deleteTask({ id: id as any }),
      { loading: 'Deleting task...', success: 'Task deleted', error: 'Failed to delete task' }
    )
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(column => (
            <Column 
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={((displayBoard?.[column.id] ?? []) as any[]).map((t: any) => ({ ...t, id: t._id }))} 
              projectId={projectId}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              isReadOnly={isReadOnly}
            />
          ))}
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

function Column({ id, title, color, tasks, projectId, onEdit, onDelete, isReadOnly }: any) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { status: id } })
  const [titleInput, setTitleInput] = useState("")
  const upsertTask = useMutation(api.functions.upsertTask)

  async function handleAdd() {
    if (isReadOnly) {
      toast.error("You don't have permission to create tasks")
      return
    }
    if (!titleInput.trim()) return
    toast.promise(
      upsertTask({ title: titleInput.trim(), projectId, status: id }),
      { loading: 'Creating...', success: 'Task created', error: 'Failed to create task' }
    )
    setTitleInput("")
  }

  return (
    <Card 
      ref={setNodeRef as any} 
      className={`p-3 transition-all flex-shrink-0 w-80 flex flex-col ${
        isOver ? "ring-2 ring-blue-500 bg-blue-500/5" : ""
      }`}
      style={{ maxHeight: "calc(100vh - 16rem)" }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="text-sm font-semibold">{title}</h3>
          <Badge variant="secondary" className="text-xs px-1.5 py-0">{tasks.length}</Badge>
        </div>
      </div>

      {/* Add Task Input */}
      {!isReadOnly && (
        <div className="flex gap-1.5 mb-3">
          <Input 
            placeholder="+ Add task" 
            value={titleInput} 
            onChange={e => setTitleInput(e.target.value)} 
            className="h-8 text-sm border-dashed" 
            onKeyDown={e => e.key === 'Enter' && handleAdd()} 
          />
        </div>
      )}

      {/* Tasks List */}
      <SortableContext items={tasks.map((t: any) => t.id)}>
        <ul className="space-y-2 flex-1 overflow-y-auto pr-1">
          {tasks.map((t: any) => (
            <TaskCard 
              key={t.id} 
              task={t}
              columnColor={color}
              onEdit={() => onEdit(t)} 
              onDelete={() => onDelete(t.id)}
              isReadOnly={isReadOnly}
            />
          ))}
        </ul>
      </SortableContext>
    </Card>
  )
}

function TaskCard({ task, columnColor, onEdit, onDelete, isReadOnly }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id, 
    data: { status: task.status },
    disabled: isReadOnly
  })
  const style = { transform: CSS.Transform.toString(transform), transition }
  
  const priorityConfig: Record<string, { color: string; icon: any }> = {
    critical: { color: "text-red-600 dark:text-red-400", icon: Zap },
    high: { color: "text-orange-600 dark:text-orange-400", icon: AlertCircle },
    medium: { color: "text-yellow-600 dark:text-yellow-400", icon: Clock },
    low: { color: "text-blue-600 dark:text-blue-400", icon: Clock },
  }

  // Check if task is overdue
  const isOverdue = task.endDate && new Date(task.endDate) < new Date() && task.status !== "done"
  const dueDate = task.endDate ? new Date(task.endDate) : null
  const today = new Date()
  const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
  
  const PriorityIcon = task.priority ? priorityConfig[task.priority]?.icon : null
  
  return (
    <li 
      ref={setNodeRef as any} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={() => !isReadOnly && onEdit()}
      className={`group rounded-lg border bg-card/50 backdrop-blur-sm p-3 text-sm transition-all max-h-72 overflow-hidden flex flex-col
        ${!isReadOnly ? 'hover:border-blue-500/50 hover:shadow-md cursor-pointer hover:scale-[1.02]' : 'cursor-default'} 
        ${isDragging ? "opacity-50 rotate-2 scale-105 shadow-xl" : ""} 
        ${isOverdue ? 'border-l-4 border-l-red-500 bg-red-500/5' : ''}`}
    >
      <div className="space-y-2.5 flex-1 overflow-y-auto">
        {/* Header with title */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium flex items-center gap-1.5 flex-wrap">
              <span className="line-clamp-2 flex-1">{task.title}</span>
              {task.priority && PriorityIcon && (
                <PriorityIcon className={`h-3.5 w-3.5 flex-shrink-0 ${priorityConfig[task.priority].color}`} />
              )}
            </div>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          {!isReadOnly && (
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0" 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          )}
        </div>

        {/* Story Points & Labels */}
        {(task.storyPoints || task.labels?.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {task.storyPoints && (
              <Badge variant="outline" className="text-xs py-0 px-1.5 border-purple-500/30 text-purple-700 dark:text-purple-400">
                {task.storyPoints} SP
              </Badge>
            )}
            {task.labels?.slice(0, 2).map((label: string) => (
              <Badge key={label} variant="secondary" className="text-xs py-0 px-1.5">{label}</Badge>
            ))}
            {task.labels?.length > 2 && (
              <Badge variant="secondary" className="text-xs py-0 px-1.5">+{task.labels.length - 2}</Badge>
            )}
          </div>
        )}

        {/* Due date */}
        {task.endDate && (
          <div className={`text-xs flex items-center gap-1.5 ${
            isOverdue 
              ? 'text-red-600 dark:text-red-400 font-medium' 
              : daysUntilDue !== null && daysUntilDue <= 2
                ? 'text-orange-600 dark:text-orange-400 font-medium'
                : 'text-muted-foreground'
          }`}>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {isOverdue ? 'Overdue' : 'Due'} {format(new Date(task.endDate), "MMM d")}
              {daysUntilDue !== null && daysUntilDue >= 0 && !isOverdue && (
                <span className="ml-1 opacity-70">({daysUntilDue}d)</span>
              )}
            </span>
          </div>
        )}

        {/* Footer with meta info */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {/* Left: Subtasks, Comments */}
          <div className="flex items-center gap-2.5">
            {task.subtasksTotal > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckSquare className="h-3 w-3" />
                <span>{task.subtasksCompleted}/{task.subtasksTotal}</span>
              </div>
            )}
            {task.commentsCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{task.commentsCount}</span>
              </div>
            )}
            {task.estimatedHours && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{task.estimatedHours}h</span>
              </div>
            )}
          </div>

          {/* Right: Assignees */}
          {task.assigneeDetails && task.assigneeDetails.length > 0 && (
            <div className="flex -space-x-2">
              {task.assigneeDetails.slice(0, 3).map((assignee: any, idx: number) => (
                <Avatar key={idx} className="h-5 w-5 border-2 border-background" title={assignee.name}>
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="text-[8px] bg-blue-500/10 text-blue-500">
                    {assignee.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assigneeDetails.length > 3 && (
                <div className="h-5 w-5 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                  <span className="text-[8px] text-muted-foreground">+{task.assigneeDetails.length - 3}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
