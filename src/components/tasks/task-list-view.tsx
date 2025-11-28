"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, ChevronDown, ChevronRight, MoreVertical, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
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

interface TaskListViewProps {
  tasks: Task[]
  workspaceMembers?: any[]
  onTaskClick?: (task: Task) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onCreateTask?: () => void
}

const STATUS_GROUPS = [
  { id: "backlog", title: "BACKLOG", statuses: ["backlog"] },
  { id: "todo", title: "TO DO", statuses: ["todo"] },
  { id: "in_progress", title: "IN PROGRESS", statuses: ["in_progress"] },
  { id: "done", title: "DONE", statuses: ["done"] },
]

function SortableTaskRow({
  task,
  workspaceMembers,
  onTaskClick,
  onTaskDelete,
  getMemberName,
  getMemberInitials,
  getPriorityColor,
  subtasksCount,
  completedSubtasks,
}: {
  task: Task
  workspaceMembers: any[]
  onTaskClick?: (task: Task) => void
  onTaskDelete?: (taskId: string) => void
  getMemberName: (userId: string) => string
  getMemberInitials: (userId: string) => string
  getPriorityColor: (priority?: string) => string
  subtasksCount?: number
  completedSubtasks?: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex items-center gap-3 px-4 py-2.5 border-b border-border/40 hover:bg-muted/30 transition-colors cursor-grab active:cursor-grabbing",
        isDragging && "z-50"
      )}
      onClick={() => onTaskClick?.(task)}
    >

      {/* Task Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{task.title}</p>
      </div>

      {/* Subtasks */}
      <div className="w-20 text-sm text-muted-foreground">
        {subtasksCount !== undefined && subtasksCount > 0 ? (
          <span className="text-xs">
            {completedSubtasks || 0}/{subtasksCount}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>

      {/* Tags */}
      <div className="w-32 flex items-center gap-1 overflow-hidden">
        {task.tags && task.tags.length > 0 ? (
          <>
            {task.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 truncate">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                +{task.tags.length - 2}
              </Badge>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>

      {/* Assignees */}
      <div className="w-28 flex items-center gap-1">
        {task.assignees && task.assignees.length > 0 ? (
          <>
            {task.assignees.slice(0, 3).map((userId: string) => (
              <Avatar key={userId} className="h-5 w-5">
                <AvatarFallback className="text-[8px]">
                  {getMemberInitials(userId)}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.assignees.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{task.assignees.length - 3}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>

      {/* Time Tracking */}
      <div className="w-20 text-sm text-muted-foreground">
        {(task.trackedHours || task.estimatedHours) ? (
          <span className="text-xs">
            {task.trackedHours || 0}
            {task.estimatedHours && `/${task.estimatedHours}`}h
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>

      {/* Due Date */}
      <div className="w-24 text-sm text-muted-foreground">
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
      </div>

      {/* Priority */}
      <div className="w-20">
        {task.priority ? (
          <Badge 
            variant="outline" 
            className={cn("text-xs", getPriorityColor(task.priority))}
          >
            {task.priority}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>

      {/* Actions */}
      <div className="w-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onTaskDelete?.(task._id)
              }}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function DroppableStatusSection({
  status,
  tasks,
  workspaceMembers,
  onTaskClick,
  onTaskDelete,
  getMemberName,
  getMemberInitials,
  getPriorityColor,
  isOver,
}: {
  status: typeof STATUS_GROUPS[0]
  tasks: Task[]
  workspaceMembers: any[]
  onTaskClick?: (task: Task) => void
  onTaskDelete?: (taskId: string) => void
  getMemberName: (userId: string) => string
  getMemberInitials: (userId: string) => string
  getPriorityColor: (priority?: string) => string
  isOver: boolean
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const { setNodeRef } = useDroppable({
    id: status.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border border-border/40 rounded-lg overflow-hidden bg-card/50 transition-colors",
        isOver && "ring-2 ring-primary/50"
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground">
          {status.title}
        </h3>
        <Badge variant="secondary" className="text-xs h-5 px-1.5">
          {tasks.length}
        </Badge>
      </div>

      {/* Column Headers */}
      {!isCollapsed && tasks.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border/40 bg-muted/10 text-xs font-medium text-muted-foreground">
          <div className="w-5"></div> {/* Space for drag handle */}
          <div className="flex-1">Name</div>
          <div className="w-20">Subtasks</div>
          <div className="w-32">Tags</div>
          <div className="w-28">Assignee</div>
          <div className="w-20">Time</div>
          <div className="w-24">Due date</div>
          <div className="w-20">Priority</div>
          <div className="w-8"></div> {/* Space for menu */}
        </div>
      )}

      {/* Tasks */}
      {!isCollapsed && (
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          <div>
            {tasks.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No tasks in this status
              </div>
            ) : (
              tasks.map((task) => (
                <SortableTaskRow
                  key={task._id}
                  task={task}
                  workspaceMembers={workspaceMembers}
                  onTaskClick={onTaskClick}
                  onTaskDelete={onTaskDelete}
                  getMemberName={getMemberName}
                  getMemberInitials={getMemberInitials}
                  getPriorityColor={getPriorityColor}
                />
              ))
            )}
          </div>
        </SortableContext>
      )}
    </div>
  )
}

export function TaskListView({ 
  tasks, 
  workspaceMembers = [],
  onTaskClick, 
  onTaskUpdate,
  onTaskDelete,
  onCreateTask 
}: TaskListViewProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [overId, setOverId] = React.useState<string | null>(null)
  const [optimisticUpdates, setOptimisticUpdates] = React.useState<Map<string, Partial<Task>>>(
    new Map()
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  // Apply optimistic updates and sort by order field
  const optimisticTasks = React.useMemo(() => {
    return tasks
      .map((task) => {
        const updates = optimisticUpdates.get(task._id)
        return updates ? { ...task, ...updates } : task
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [tasks, optimisticUpdates])

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

  // Group tasks by status (using optimistic tasks)
  const tasksByStatus = React.useMemo(() => {
    const groups = new Map<string, Task[]>()
    STATUS_GROUPS.forEach((status) => {
      groups.set(
        status.id,
        optimisticTasks.filter((task) => status.statuses.includes(task.status?.toLowerCase() || "backlog"))
      )
    })
    return groups
  }, [optimisticTasks])

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

    if (!over || !onTaskUpdate) return

    const taskId = active.id as string
    const overId = over.id as string

    // Check if dropped on a status group
    const targetStatus = STATUS_GROUPS.find((s) => s.id === overId)
    const draggedTask = optimisticTasks.find((t) => t._id === taskId)
    
    if (!draggedTask) return

    if (targetStatus) {
      // Dropped on a status section - change status
      const newStatus = targetStatus.statuses[0]
      
      if (draggedTask.status !== newStatus) {
        // Apply optimistic update
        setOptimisticUpdates((prev) => {
          const next = new Map(prev)
          next.set(taskId, { status: newStatus })
          return next
        })

        // Perform actual update
        onTaskUpdate(taskId, { status: newStatus })

        // Clear optimistic update after a delay
        setTimeout(() => {
          setOptimisticUpdates((prev) => {
            const next = new Map(prev)
            next.delete(taskId)
            return next
          })
        }, 1000)
      }
    } else {
      // Dropped on another task - reorder within the same status
      const overTask = optimisticTasks.find((t) => t._id === overId)
      
      if (overTask && draggedTask.status === overTask.status && taskId !== overId) {
        // Get all tasks in the same status
        const statusTasks = optimisticTasks.filter(
          (t) => t.status === draggedTask.status
        )
        
        const oldIndex = statusTasks.findIndex((t) => t._id === taskId)
        const newIndex = statusTasks.findIndex((t) => t._id === overId)
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          // Reorder the tasks
          const reorderedTasks = [...statusTasks]
          const [removed] = reorderedTasks.splice(oldIndex, 1)
          reorderedTasks.splice(newIndex, 0, removed)
          
          // Update order values for all tasks in this status
          const updates: any[] = []
          reorderedTasks.forEach((task, index) => {
            const newOrder = index * 1000 // Use increments of 1000 to allow for insertions
            if (task.order !== newOrder) {
              updates.push({ _id: task._id, order: newOrder })
            }
          })
          
          // Apply optimistic updates
          setOptimisticUpdates((prev) => {
            const next = new Map(prev)
            updates.forEach(({ _id, order }) => {
              next.set(_id, { ...(next.get(_id) || {}), order })
            })
            return next
          })
          
          // Perform actual updates
          updates.forEach(({ _id, order }) => {
            onTaskUpdate(_id, { order })
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

  const activeTask = activeId ? optimisticTasks.find((t) => t._id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3 h-full overflow-y-auto px-1 py-1">
        {STATUS_GROUPS.map((status) => {
          const statusTasks = tasksByStatus.get(status.id) || []
          const isOver = overId === status.id

          return (
            <DroppableStatusSection
              key={status.id}
              status={status}
              tasks={statusTasks}
              workspaceMembers={workspaceMembers}
              onTaskClick={onTaskClick}
              onTaskDelete={onTaskDelete}
              getMemberName={getMemberName}
              getMemberInitials={getMemberInitials}
              getPriorityColor={getPriorityColor}
              isOver={isOver}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
            <p className="text-sm font-medium">{activeTask.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
