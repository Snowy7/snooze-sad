"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, ChevronLeft, ChevronRight, X, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/lib/convex"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns"
import { useOwnerId } from "@/hooks/use-owner"
import { ScrollArea } from "@/components/ui/scroll-area"

export function CalendarWidgetNode({ data, selected }: NodeProps) {
  const ownerId = useOwnerId()
  const deleteNode = useMutation(api.graphs.deleteNode)
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = ["S", "M", "T", "W", "T", "F", "S"]
  const dates = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const startDay = monthStart.getDay()
  const prevMonthDays = Array.from({ length: startDay }, (_, i) => null)
  const allDays = [...prevMonthDays, ...dates]

  // Fetch tasks for the current month (extended range to show past completed tasks)
  const extendedStart = new Date(monthStart)
  extendedStart.setMonth(extendedStart.getMonth() - 1) // Go back 1 month to show past completed tasks
  
  const tasksData = useQuery(
    api.functions.tasksByDateRange,
    ownerId ? {
      startDate: format(extendedStart, "yyyy-MM-dd"),
      endDate: format(monthEnd, "yyyy-MM-dd"),
      ownerId
    } : "skip"
  )
  const tasks = tasksData || []

  // Fetch activities for completed tasks
  const workspaces = useQuery(api.workspaces.listMyWorkspaces, {})
  const workspace = workspaces?.find((w: any) => w.ownerId === ownerId)
  
  const activitiesData = useQuery(
    api.activities.listWorkspaceActivities,
    workspace ? { workspaceId: workspace._id, limit: 1000 } : "skip"
  )
  const activities = activitiesData || []

  // Fetch daily checklist items for selected day
  const selectedDateStr = selectedDay ? format(selectedDay, "yyyy-MM-dd") : ""
  const dailyChecklistItems = useQuery(
    api.dailyChecklist.getDailyChecklistItems,
    selectedDateStr && ownerId ? { ownerId, date: selectedDateStr } : "skip"
  )
  
  // Fetch routine templates
  const routineTemplates = useQuery(
    api.functions.listDailyTaskTemplates,
    ownerId ? { ownerId } : "skip"
  )
  
  // Get routine completion status from localStorage for selected day
  const getRoutineCompletionForDate = React.useCallback((date: Date) => {
    if (!ownerId) return new Map<string, boolean>()
    const dateStr = date.toDateString()
    const saved = localStorage.getItem(`routines-${ownerId}-${dateStr}`)
    if (saved) {
      const completed = JSON.parse(saved) as string[]
      return new Map(completed.map(id => [id, true]))
    }
    return new Map<string, boolean>()
  }, [ownerId])

  // Group tasks by date (scheduled date + completion date + daily routines)
  const tasksByDate = React.useMemo(() => {
    const grouped: Record<string, any[]> = {}
    
    // Add tasks by scheduled date (endDate)
    tasks.forEach((task: any) => {
      if (task.endDate) {
        if (!grouped[task.endDate]) {
          grouped[task.endDate] = []
        }
        // Check if task is not already in the list
        if (!grouped[task.endDate].some(t => t._id === task._id)) {
          grouped[task.endDate].push(task)
        }
      }
    })

    // Add tasks by completion date from activities
    activities
      .filter((a: any) => a.action === "completed" && a.entityType === "task")
      .forEach((activity: any) => {
        const completionDate = format(new Date(activity.createdAt), "yyyy-MM-dd")
        const task = tasks.find((t: any) => t._id.toString() === activity.entityId)
        
        if (task) {
          if (!grouped[completionDate]) {
            grouped[completionDate] = []
          }
          // Only add if not already in the list
          if (!grouped[completionDate].some(t => t._id === task._id)) {
            grouped[completionDate].push({
              ...task,
              _completedOn: completionDate, // Mark that it was completed on this date
            })
          }
        }
      })
    
    // Add routine templates as tasks for each day in the visible month
    if (routineTemplates && routineTemplates.length > 0) {
      const activeTemplates = routineTemplates.filter((t: any) => t.isActive)
      
      // For each day in the current month, add all active routines
      dates.forEach(date => {
        const dateStr = format(date, "yyyy-MM-dd")
        const routineStates = getRoutineCompletionForDate(date)
        
        activeTemplates.forEach((template: any) => {
          if (!grouped[dateStr]) {
            grouped[dateStr] = []
          }
          
          // Add routine as a virtual task
          const routineTask = {
            _id: `routine-${template._id}-${dateStr}`,
            title: template.title,
            status: routineStates.get(template._id) ? "done" : "backlog",
            endDate: dateStr,
            _isRoutine: true,
          }
          
          grouped[dateStr].push(routineTask)
        })
      })
    }
    
    return grouped
  }, [tasks, activities, routineTemplates, dates, getRoutineCompletionForDate])

  // Get tasks for selected day (combine regular tasks + daily checklist items + routines)
  const selectedDayTasks = React.useMemo(() => {
    if (!selectedDay) return []
    
    const dateStr = format(selectedDay, "yyyy-MM-dd")
    const regularTasks = tasksByDate[dateStr] || []
    const dailyTasks = dailyChecklistItems || []
    const templates = (routineTemplates || []).filter((t: any) => t.isActive)
    
    // Get routine completion status for this specific day
    const routineStates = getRoutineCompletionForDate(selectedDay)
    
    // Convert routine templates to task-like objects
    const routineTasks = templates.map((template: any) => ({
      _id: `routine-${template._id}`,
      title: template.title,
      description: template.description,
      priority: template.priority,
      status: routineStates.get(template._id) ? "done" : "backlog",
      type: "routine",
      endDate: dateStr,
      _isRoutine: true,
      _templateId: template._id,
    }))
    
    // Combine all: regular tasks + daily checklist items + routines
    const allTasks = [...regularTasks]
    dailyTasks.forEach((dt: any) => {
      if (!allTasks.some(t => t._id === dt._id)) {
        allTasks.push(dt)
      }
    })
    routineTasks.forEach((rt: any) => {
      if (!allTasks.some(t => t._id === rt._id)) {
        allTasks.push(rt)
      }
    })
    
    return allTasks
  }, [selectedDay, tasksByDate, dailyChecklistItems, routineTemplates, getRoutineCompletionForDate])

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleWheel = (e: React.WheelEvent) => e.stopPropagation()
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === "BUTTON" || target.closest("button")) {
      e.stopPropagation()
    }
  }

  return (
    <div className="w-full h-full group" onWheel={handleWheel} onMouseDown={handleMouseDown}>
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={320}
        minHeight={350}
        maxWidth={500}
        maxHeight={550}
      />
      
      <Card
        className={cn(
          "p-4 w-full h-full transition-all overflow-hidden flex flex-col",
          "border-2",
          selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border hover:border-primary/50"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm flex-1">{format(currentDate, "MMMM yyyy")}</h3>

          {/* Month navigation */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setCurrentDate(new Date())}
              title="Today"
            >
              <div className="h-2 w-2 rounded-full bg-primary" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          {/* Delete button */}
          <AlertDialog>
            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete calendar?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this calendar widget.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map((d, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {allDays.map((date, i) => {
              const isToday = date ? isSameDay(date, new Date()) : false
              const isCurrentMonth = date ? isSameMonth(date, currentDate) : false
              const dateStr = date ? format(date, "yyyy-MM-dd") : ""
              const dayTasks = dateStr ? tasksByDate[dateStr] || [] : []
              const hasTasks = dayTasks.length > 0
              const completedTasks = dayTasks.filter(t => t.status === "done").length
              const totalTasks = dayTasks.length
              
              return (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (date && isCurrentMonth) {
                      setSelectedDay(date)
                      setIsSheetOpen(true)
                    }
                  }}
                  className={cn(
                    "aspect-square rounded-md text-xs font-medium transition-all relative",
                    "flex flex-col items-center justify-center gap-0.5",
                    isToday && "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20",
                    !isToday && isCurrentMonth && "hover:bg-muted cursor-pointer",
                    !isCurrentMonth && "text-muted-foreground/30 cursor-default"
                  )}
                >
                  <span>{date && format(date, "d")}</span>
                  {hasTasks && isCurrentMonth && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayTasks.slice(0, 3).map((task, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            task.status === "done" ? "bg-green-500" : "bg-orange-500"
                          )}
                        />
                      ))}
                      {totalTasks > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{totalTasks - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Day Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-[440px] sm:w-[540px] p-0 flex flex-col gap-0">
          {/* Header */}
          <SheetHeader className="border-b px-6 py-5 space-y-1">
            <SheetTitle className="text-xl font-semibold text-left">
              {selectedDay && format(selectedDay, "EEEE, MMMM d")}
            </SheetTitle>
            <p className="text-sm text-muted-foreground text-left">
              {selectedDayTasks.length === 0 && "No tasks scheduled"}
              {selectedDayTasks.length > 0 && (
                <>
                  {selectedDayTasks.filter(t => t.status === "done").length} of {selectedDayTasks.length} completed
                </>
              )}
            </p>
          </SheetHeader>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="px-6 py-5">
              {selectedDayTasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayTasks.map((task: any) => (
                    <Card key={task._id} className="p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start gap-3">
                        {task.status === "done" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-medium text-sm leading-snug mb-1",
                            task.status === "done" && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                              {task.description}
                            </p>
                          )}
                          {task._completedOn && task.endDate !== task._completedOn && (
                            <p className="text-xs text-muted-foreground/70 mb-2 italic">
                              ✓ Completed on this day (scheduled for {task.endDate})
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            {task._isRoutine && (
                              <span className="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                Routine
                              </span>
                            )}
                            {task.priority && (
                              <span className={cn(
                                "text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap",
                                task.priority === "high" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                task.priority === "medium" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                                task.priority === "low" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              )}>
                                {task.priority}
                              </span>
                            )}
                            <span className={cn(
                              "text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap",
                              task.status === "done" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                              task.status === "in_progress" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                              task.status === "backlog" && "bg-muted text-muted-foreground"
                            )}>
                              {task.status || "backlog"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-base font-medium text-muted-foreground mb-1">No tasks scheduled</p>
                  <p className="text-sm text-muted-foreground/70">
                    Create a task to get started
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
