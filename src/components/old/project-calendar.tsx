"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, parseISO } from "date-fns"
import { TaskEditDialog } from "./task-edit-dialog"
import { toast } from "sonner"

const statusColors: Record<string, string> = {
  backlog: "bg-gray-500",
  in_progress: "bg-blue-500",
  in_review: "bg-purple-500",
  stuck: "bg-red-500",
  done: "bg-green-500",
}

export function ProjectCalendar({ projectId, isReadOnly = false }: { projectId: any; isReadOnly?: boolean }) {
  const board = useQuery(api.projects.listProjectBoard, { projectId }) as any
  const upsertTask = useMutation(api.functions.upsertTask)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [editingTask, setEditingTask] = useState<any | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDayDialog, setShowDayDialog] = useState(false)

  // Flatten all tasks
  const allTasks = board ? Object.values(board).flat() as any[] : []

  // Get tasks with due dates
  const tasksWithDates = allTasks.filter(t => t.endDate)

  // Get dates for the calendar (including padding days from prev/next month)
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Group tasks by date
  const tasksByDate: Record<string, any[]> = {}
  tasksWithDates.forEach(task => {
    const dateKey = task.endDate.split('T')[0] // YYYY-MM-DD
    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = []
    tasksByDate[dateKey].push(task)
  })

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    setShowDayDialog(true)
  }

  const tasksForSelectedDate = selectedDate ? (tasksByDate[format(selectedDate, 'yyyy-MM-dd')] || []) : []

  return (
    <>
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="p-6">
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-3 border-b">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const tasksForDay = tasksByDate[dateKey] || []
              const isCurrentDay = isToday(day)
              const isCurrentMonth = isSameMonth(day, currentMonth)

              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-32 border-2 rounded-lg p-2 transition-all hover:border-primary hover:shadow-md ${
                    isCurrentDay ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border'
                  } ${!isCurrentMonth ? 'opacity-40 bg-muted/20' : ''}`}
                >
                  <div className={`text-sm font-semibold mb-2 ${
                    isCurrentDay ? 'text-primary' : isCurrentMonth ? '' : 'text-muted-foreground'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {tasksForDay.slice(0, 3).map((task: any) => (
                      <div
                        key={task._id}
                        onClick={(e) => {
                          e.stopPropagation()
                          !isReadOnly && setEditingTask(task)
                        }}
                        className={`w-full text-left text-xs p-1.5 rounded truncate transition-all hover:scale-105 ${
                          statusColors[task.status] || 'bg-gray-500'
                        } text-white shadow-sm`}
                      >
                        <div className="flex items-center gap-1">
                          {task.priority === 'high' && <span className="text-xs">🔥</span>}
                          {task.priority === 'critical' && <span className="text-xs">⚡</span>}
                          <span className="truncate">{task.title}</span>
                        </div>
                      </div>
                    ))}
                    {tasksForDay.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center font-medium bg-muted rounded py-1">
                        +{tasksForDay.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Status Legend */}
        <Card className="p-4">
          <div className="flex items-center gap-6 flex-wrap text-sm">
            <div className="font-semibold">Status:</div>
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color}`} />
                <span className="capitalize">{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Tasks without dates */}
        {allTasks.filter(t => !t.endDate).length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Unscheduled Tasks</h3>
              <Badge variant="secondary">{allTasks.filter(t => !t.endDate).length}</Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {allTasks.filter(t => !t.endDate).map((task: any) => (
                <button
                  key={task._id}
                  onClick={() => !isReadOnly && setEditingTask(task)}
                  className="text-left p-3 rounded-lg border-2 hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[task.status] || 'bg-gray-500'}`} />
                    <span className="font-medium text-sm truncate flex-1">{task.title}</span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {task.priority && (
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                    )}
                    {task.storyPoints && (
                      <Badge variant="outline" className="text-xs">
                        {task.storyPoints} SP
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={showDayDialog} onOpenChange={setShowDayDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {tasksForSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks due on this date
              </div>
            ) : (
              tasksForSelectedDate.map((task: any) => (
                <button
                  key={task._id}
                  onClick={() => {
                    setShowDayDialog(false)
                    !isReadOnly && setEditingTask(task)
                  }}
                  className="w-full text-left p-4 rounded-lg border-2 hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[task.status] || 'bg-gray-500'}`} />
                    <span className="font-semibold flex-1">{task.title}</span>
                    {task.priority && (
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {task.status.replace('_', ' ')}
                    </Badge>
                    {task.storyPoints && (
                      <Badge variant="outline" className="text-xs">
                        {task.storyPoints} SP
                      </Badge>
                    )}
                    {task.estimatedHours && (
                      <Badge variant="outline" className="text-xs">
                        {task.estimatedHours}h
                      </Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TaskEditDialog 
        task={editingTask} 
        projectId={projectId}
        open={!!editingTask} 
        onClose={() => setEditingTask(null)}
      />
    </>
  )
}
