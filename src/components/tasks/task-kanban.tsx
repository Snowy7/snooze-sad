"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, MoreVertical, Calendar, User, Inbox, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskDescriptionRenderer } from "./task-description-renderer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Task {
  _id: string
  title: string
  description?: string
  status?: string
  priority?: string
  assignees?: string[]
  dueDate?: string
  [key: string]: any
}

interface TaskKanbanProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onCreateTask?: (status: string) => void
  workspaceMembers?: any[]
  columns?: {
    id: string
    title: string
    statuses: string[]
  }[]
}

const DEFAULT_COLUMNS = [
  { id: "backlog", title: "Backlog", statuses: ["backlog"] },
  { id: "todo", title: "To Do", statuses: ["todo"] },
  { id: "in_progress", title: "In Progress", statuses: ["in_progress"] },
  { id: "done", title: "Done", statuses: ["done"] },
]

function DroppableColumn({
  column,
  tasks,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
  onCreateTask,
  allColumns,
  getMemberName,
  getMemberInitials,
}: {
  column: { id: string; title: string; statuses: string[] }
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onCreateTask?: (status: string) => void
  allColumns: any[]
  getMemberName?: (userId: string) => string
  getMemberInitials?: (userId: string) => string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div className="flex-shrink-0 w-80 flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
        {onCreateTask && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-primary/10"
            onClick={() => onCreateTask(column.statuses[0])}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-lg p-2 transition-colors duration-200",
          "bg-transparent border-2 border-dashed",
          isOver ? "border-primary bg-primary/5" : "border-muted/30"
        )}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          <ScrollArea className="h-full">
            <div className="space-y-2 min-h-[200px]">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <Inbox className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground/60">No tasks</p>
                  <p className="text-xs text-muted-foreground/40 mt-1">
                    Drop tasks here or click + to add
                  </p>
                </div>
              ) : (
                tasks.map((task) => (
                  <SortableTaskCard
                    key={task._id}
                    task={task}
                    onTaskClick={onTaskClick}
                    onTaskUpdate={onTaskUpdate}
                    onTaskDelete={onTaskDelete}
                    allColumns={allColumns}
                    getMemberName={getMemberName}
                    getMemberInitials={getMemberInitials}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </SortableContext>
      </div>
    </div>
  )
}

const TaskCard = React.memo(
  React.forwardRef<HTMLDivElement, {
    task: Task
    onTaskClick?: (task: Task) => void
    onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
    onTaskDelete?: (taskId: string) => void
    allColumns: any[]
    isDragging?: boolean
    style?: React.CSSProperties
    getMemberName?: (userId: string) => string
    getMemberInitials?: (userId: string) => string
  } & any>(({
    task,
    onTaskClick,
    onTaskUpdate,
    onTaskDelete,
    allColumns,
    isDragging,
    style,
    getMemberName,
    getMemberInitials,
    ...props
  }, ref) => {
    const getPriorityColor = (priority?: string) => {
      switch (priority?.toLowerCase()) {
        case "high":
          return "border-red-500 text-red-500"
        case "medium":
          return "border-yellow-500 text-yellow-500"
        case "low":
          return "border-blue-500 text-blue-500"
        default:
          return ""
      }
    }

    const formatDate = (dateString?: string) => {
      if (!dateString) return null
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    const isOverdue = (dateString?: string) => {
      if (!dateString) return false
      return new Date(dateString) < new Date()
    }

    const getNextColumn = () => {
      const currentColumnIndex = allColumns.findIndex((col: any) =>
        col.statuses.includes(task.status?.toLowerCase() || "backlog")
      )
      if (currentColumnIndex === -1 || currentColumnIndex === allColumns.length - 1) {
        return null
      }
      return allColumns[currentColumnIndex + 1]
    }

    const nextColumn = getNextColumn()

    return (
      <Card
        ref={ref}
        style={style}
        className={cn(
          "p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group bg-card",
          "border-l-4",
          task.priority === "high" && "border-l-red-500",
          task.priority === "medium" && "border-l-yellow-500",
          task.priority === "low" && "border-l-blue-500",
          !task.priority && "border-l-transparent",
          isDragging && "opacity-50"
        )}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest("button")) {
            onTaskClick?.(task)
          }
        }}
        {...props}
      >
        <div className="space-y-3">
          {/* Title and menu */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm flex-1 line-clamp-2 leading-snug">{task.title}</h4>
            {(onTaskUpdate || onTaskDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {nextColumn && onTaskUpdate && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onTaskUpdate(task._id, { status: nextColumn.statuses[0] })
                      }}
                    >
                      <ArrowRight className="h-3 w-3 mr-2" />
                      Move to {nextColumn.title}
                    </DropdownMenuItem>
                  )}
                  {onTaskDelete && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTaskDelete(task._id)
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

        {/* Description */}
        {task.description && (
          <div className="text-xs line-clamp-2 text-muted-foreground leading-relaxed">
            <TaskDescriptionRenderer content={task.description} />
          </div>
        )}

          {/* Footer with separator */}
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {task.priority && (
                <Badge
                  variant="outline"
                  className={cn("text-[10px] px-1.5 py-0 h-5", getPriorityColor(task.priority))}
                >
                  {task.priority}
                </Badge>
              )}
              {task.dueDate && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    isOverdue(task.dueDate) && "text-destructive"
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span className="text-[10px]">{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>
            {task.assignees && task.assignees.length > 0 && getMemberName && getMemberInitials && (
              <div className="flex items-center gap-1">
                {task.assignees.slice(0, 2).map((userId: string) => (
                  <div 
                    key={userId}
                    className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium"
                    title={getMemberName(userId)}
                  >
                    {getMemberInitials(userId)}
                  </div>
                ))}
                {task.assignees.length > 2 && (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                    +{task.assignees.length - 2}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  })
)

TaskCard.displayName = "TaskCard"

function SortableTaskCard({
  task,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
  allColumns,
  getMemberName,
  getMemberInitials,
}: {
  task: Task
  onTaskClick?: (task: Task) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  allColumns: any[]
  getMemberName?: (userId: string) => string
  getMemberInitials?: (userId: string) => string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TaskCard
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      task={task}
      onTaskClick={onTaskClick}
      onTaskUpdate={onTaskUpdate}
      onTaskDelete={onTaskDelete}
      allColumns={allColumns}
      isDragging={isDragging}
      getMemberName={getMemberName}
      getMemberInitials={getMemberInitials}
    />
  )
}

export function TaskKanban({
  tasks,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
  onCreateTask,
  workspaceMembers = [],
  columns = DEFAULT_COLUMNS,
}: TaskKanbanProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [overId, setOverId] = React.useState<string | null>(null)
  const [optimisticUpdates, setOptimisticUpdates] = React.useState<Map<string, Partial<Task>>>(
    new Map()
  )

  // Helper functions for member names
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Apply optimistic updates to tasks and sort by order
  const optimisticTasks = React.useMemo(() => {
    return tasks
      .map((task) => {
        const updates = optimisticUpdates.get(task._id)
        return updates ? { ...task, ...updates } : task
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [tasks, optimisticUpdates])

  const tasksByColumn = React.useMemo(() => {
    const map = new Map<string, Task[]>()
    columns.forEach((col) => {
      map.set(
        col.id,
        optimisticTasks.filter((task) => col.statuses.includes(task.status?.toLowerCase() || "backlog"))
      )
    })
    return map
  }, [optimisticTasks, columns])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setOverId(over ? (over.id as string) : null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setOverId(null)

    if (!over) {
      return
    }

    const taskId = active.id as string
    const dropTargetId = over.id as string

    // Find the task being dragged
    const draggedTask = optimisticTasks.find((t) => t._id === taskId)
    if (!draggedTask) {
      return
    }

    let newStatus: string | undefined
    let targetColumn: typeof columns[0] | undefined

    // Check if dropped on a column
    targetColumn = columns.find((col) => col.id === dropTargetId)

    if (targetColumn) {
      newStatus = targetColumn.statuses[0]
    } else {
      // Check if dropped on another task (inherit its column)
      const targetTask = optimisticTasks.find((t) => t._id === dropTargetId)
      if (targetTask) {
        newStatus = targetTask.status
        targetColumn = columns.find((col) => col.statuses.includes(targetTask.status?.toLowerCase() || "backlog"))
      }
    }

    if (newStatus) {
      const statusChanged = draggedTask.status !== newStatus
      
      // Get all tasks in the target status
      const targetStatusTasks = optimisticTasks.filter(
        (t) => (statusChanged ? newStatus : draggedTask.status) === t.status
      )
      
      // Determine new order
      const overTask = optimisticTasks.find((t) => t._id === dropTargetId)
      
      if (statusChanged || (overTask && taskId !== dropTargetId)) {
        // Reorder logic
        let reorderedTasks = statusChanged 
          ? [...targetStatusTasks.filter(t => t._id !== taskId), draggedTask]
          : [...targetStatusTasks]
        
        const oldIndex = reorderedTasks.findIndex((t) => t._id === taskId)
        const newIndex = overTask 
          ? reorderedTasks.findIndex((t) => t._id === dropTargetId)
          : reorderedTasks.length - 1
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const [removed] = reorderedTasks.splice(oldIndex, 1)
          reorderedTasks.splice(newIndex, 0, removed)
        }
        
        // Calculate new order values
        const updates: any[] = []
        reorderedTasks.forEach((task, index) => {
          const newOrder = index * 1000
          const needsUpdate = task.order !== newOrder || (task._id === taskId && statusChanged)
          
          if (needsUpdate) {
            const update: any = { _id: task._id, order: newOrder }
            if (task._id === taskId && statusChanged) {
              update.status = newStatus
            }
            updates.push(update)
          }
        })
        
        if (updates.length > 0) {
          // Apply optimistic updates
          setOptimisticUpdates((prev) => {
            const next = new Map(prev)
            updates.forEach(({ _id, order, status }) => {
              const existing = next.get(_id) || {}
              next.set(_id, { ...existing, order, ...(status ? { status } : {}) })
            })
            return next
          })

          // Perform actual updates
          updates.forEach(({ _id, order, status }) => {
            onTaskUpdate?.(_id, { order, ...(status ? { status } : {}) })
          })

          // Clear optimistic updates after delay
          setTimeout(() => {
            setOptimisticUpdates((prev) => {
              const next = new Map(prev)
              updates.forEach(({ _id }) => {
                next.delete(_id)
              })
              return next
            })
          }, 1000)
        }
      }
    }
  }

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = tasksByColumn.get(column.id) || []

          return (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              onTaskClick={onTaskClick}
              onTaskUpdate={onTaskUpdate}
              onTaskDelete={onTaskDelete}
              onCreateTask={onCreateTask}
              allColumns={columns}
              getMemberName={getMemberName}
              getMemberInitials={getMemberInitials}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            allColumns={columns}
            getMemberName={getMemberName}
            getMemberInitials={getMemberInitials}
            style={{
              transform: "rotate(3deg)",
              width: "320px",
            }}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
