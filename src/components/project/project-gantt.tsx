"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react"
import "gantt-task-react/dist/index.css"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"
import { TaskEditDialog } from "./task-edit-dialog"
import { Calendar, ZoomIn, ZoomOut } from "lucide-react"

const statusColors: Record<string, { bg: string; progress: string }> = {
  backlog: { bg: "#6b7280", progress: "#4b5563" },
  in_progress: { bg: "#3b82f6", progress: "#2563eb" },
  in_review: { bg: "#a855f7", progress: "#9333ea" },
  stuck: { bg: "#ef4444", progress: "#dc2626" },
  done: { bg: "#10b981", progress: "#059669" },
}

export function ProjectGantt({ projectId, isReadOnly = false }: { projectId: any; isReadOnly?: boolean }) {
  const board = useQuery(api.functions.listProjectBoard, { projectId }) as any
  const upsertTask = useMutation(api.functions.upsertTask)
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day)
  const [editingTask, setEditingTask] = useState<any | null>(null)

  // Flatten all tasks
  const allTasks = board ? (Object.values(board).flat() as any[]).sort((a: any, b: any) => {
    const statusOrder: Record<string, number> = { in_progress: 0, in_review: 1, backlog: 2, stuck: 3, done: 4 }
    const statusDiff = (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5)
    if (statusDiff !== 0) return statusDiff
    return a.title.localeCompare(b.title)
  }) : []

  // Convert tasks to Gantt format - only scheduled tasks
  const ganttTasks: GanttTask[] = useMemo(() => {
    return allTasks
      .filter((task: any) => task.startDate && task.endDate)
      .map((task: any) => {
        const colors = statusColors[task.status] || statusColors.backlog
        
        return {
          id: task._id,
          name: task.title,
          start: parseISO(task.startDate),
          end: parseISO(task.endDate),
          progress: task.status === 'done' ? 100 : task.status === 'in_progress' ? 50 : 0,
          type: 'task' as const,
          styles: {
            backgroundColor: colors.bg,
            backgroundSelectedColor: colors.bg,
            progressColor: colors.progress,
            progressSelectedColor: colors.progress,
          },
          isDisabled: isReadOnly,
          project: task.status.replace('_', ' '),
        } as GanttTask
      })
  }, [allTasks, isReadOnly])
  
  const unscheduledTasks = allTasks.filter((t: any) => !t.startDate || !t.endDate)

  // Handle task changes
  const handleTaskChange = async (task: GanttTask) => {
    if (isReadOnly) return false

    try {
      await upsertTask({
        id: task.id as any,
        startDate: format(task.start, 'yyyy-MM-dd'),
        endDate: format(task.end, 'yyyy-MM-dd'),
      })
      toast.success("Task timeline updated")
      return true
    } catch (error) {
      toast.error("Failed to update task")
      return false
    }
  }

  const handleTaskClick = (task: GanttTask) => {
    const originalTask = allTasks.find((t: any) => t._id === task.id)
    if (originalTask && !isReadOnly) {
      setEditingTask(originalTask)
    }
  }

  const handleProgressChange = async (task: GanttTask) => {
    if (isReadOnly) return false
    // Progress changes are handled through the edit dialog
    return true
  }

  const handleTaskDelete = async (task: GanttTask) => {
    if (isReadOnly) return false
    // Deletion is handled through the edit dialog
    return false
  }

  // Custom tooltip
  const CustomTooltip = ({ task }: { task: GanttTask; fontSize: string; fontFamily: string }) => {
    const originalTask = allTasks.find((t: any) => t._id === task.id)
    
    return (
      <div className="bg-card border shadow-lg rounded-lg p-3 min-w-[200px]">
        <div className="font-semibold text-sm mb-2">{task.name}</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start:</span>
            <span className="font-medium">{format(task.start, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">End:</span>
            <span className="font-medium">{format(task.end, 'MMM d, yyyy')}</span>
          </div>
          {originalTask && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary" className="text-xs">
                  {originalTask.status.replace('_', ' ')}
                </Badge>
              </div>
              {originalTask.priority && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <span className="font-medium capitalize">{originalTask.priority}</span>
                </div>
              )}
              {originalTask.storyPoints && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Story Points:</span>
                  <span className="font-medium">{originalTask.storyPoints} SP</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Custom task list header (no date columns)
  const CustomTaskListHeader = ({
    headerHeight,
  }: {
    headerHeight: number
    rowWidth: string
    fontFamily: string
    fontSize: string
  }) => {
    return (
      <div 
        className="border-r-2 border-b-2 bg-muted flex items-center px-2"
        style={{ height: headerHeight }}
      >
        <div className="font-semibold text-xs text-foreground">Task Name</div>
      </div>
    )
  }

  // Custom task list table
  const CustomTaskList = ({
    rowHeight,
    tasks,
    selectedTaskId,
    setSelectedTask,
  }: {
    rowHeight: number
    rowWidth: string
    fontFamily: string
    fontSize: string
    locale: string
    tasks: GanttTask[]
    selectedTaskId: string
    setSelectedTask: (taskId: string) => void
  }) => {
    return (
      <div className="border-r-2 bg-card">
        {tasks.map((task) => {
          const originalTask = allTasks.find((t: any) => t._id === task.id)
          const isSelected = selectedTaskId === task.id
          
          return (
            <div
              key={task.id}
              style={{ height: rowHeight }}
              className={`flex items-center px-2 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
                isSelected ? 'bg-accent' : ''
              }`}
              onClick={() => {
                setSelectedTask(task.id)
                if (originalTask && !isReadOnly) {
                  setEditingTask(originalTask)
                }
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs truncate mb-0.5">{task.name}</div>
                {originalTask && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] px-1.5 py-0"
                      style={{
                        backgroundColor: statusColors[originalTask.status]?.bg || statusColors.backlog.bg,
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      {originalTask.status.replace('_', ' ')}
                    </Badge>
                    {originalTask.priority && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                        {originalTask.priority}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Project Timeline</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === ViewMode.Hour ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(ViewMode.Hour)}
            >
              Hour
            </Button>
            <Button
              variant={viewMode === ViewMode.Day ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(ViewMode.Day)}
            >
              Day
            </Button>
            <Button
              variant={viewMode === ViewMode.Week ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(ViewMode.Week)}
            >
              Week
            </Button>
            <Button
              variant={viewMode === ViewMode.Month ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(ViewMode.Month)}
            >
              Month
            </Button>
          </div>
        </div>

        {/* Gantt Chart */}
        <Card className="overflow-hidden flex-1">
          <div className="gantt-container h-full">
            {ganttTasks.length > 0 ? (
              <Gantt
                tasks={ganttTasks}
                viewMode={viewMode}
                onDateChange={handleTaskChange}
                onProgressChange={handleProgressChange}
                onDelete={handleTaskDelete}
                onClick={handleTaskClick}
                listCellWidth="280px"
                columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 250 : 60}
                rowHeight={50}
                barCornerRadius={6}
                barFill={85}
                ganttHeight={0}
                headerHeight={50}
                todayColor="rgba(139, 92, 246, 0.15)"
                TooltipContent={CustomTooltip}
                TaskListHeader={CustomTaskListHeader}
                TaskListTable={CustomTaskList}
                locale="en-US"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No scheduled tasks</p>
                  <p className="text-sm mt-2">
                    Add start and end dates to tasks to see them on the timeline
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
        
        {/* Unscheduled Tasks */}
        {unscheduledTasks.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <span className="text-muted-foreground">Unscheduled Tasks</span>
              <Badge variant="secondary">{unscheduledTasks.length}</Badge>
            </h3>
            <div className="grid gap-2">
              {unscheduledTasks.map((task: any) => (
                          <button
                  key={task._id}
                            onClick={() => !isReadOnly && setEditingTask(task)}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                          >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{task.title}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge 
                                variant="secondary" 
                        className="text-xs"
                        style={{
                          backgroundColor: statusColors[task.status]?.bg || statusColors.backlog.bg,
                          color: 'white',
                          border: 'none'
                        }}
                              >
                                {task.status.replace('_', ' ')}
                              </Badge>
                              {task.priority && (
                        <Badge variant="outline" className="text-xs capitalize">
                                  {task.priority}
                                </Badge>
                              )}
                        </div>
                          </div>
                              {!isReadOnly && (
                    <span className="text-xs text-primary">Click to schedule</span>
                              )}
                            </button>
              ))}
          </div>
        </Card>
        )}


        {/* Legend */}
        <Card className="p-4">
          <div className="flex items-center gap-6 flex-wrap text-sm">
            <div className="font-semibold">Status:</div>
            {Object.entries(statusColors).map(([status, colors]) => (
              <div key={status} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.bg }} />
                <span className="capitalize">{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
          {!isReadOnly && (
            <div className="text-xs text-muted-foreground mt-2">
              💡 Drag task bars to adjust dates • Click tasks to edit details • Unscheduled tasks appear below the chart
            </div>
          )}
        </Card>
      </div>

      <TaskEditDialog 
        task={editingTask} 
        projectId={projectId}
        open={!!editingTask} 
        onClose={() => setEditingTask(null)}
      />
    </>
  )
}