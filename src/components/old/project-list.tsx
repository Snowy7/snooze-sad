"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Plus, ChevronDown, ChevronRight, MessageSquare, CheckSquare, Calendar, Clock, AlertCircle, Zap, MoreVertical } from "lucide-react"
import { format } from "date-fns"
import { TaskEditDialog } from "./task-edit-dialog"

const statusConfig: Record<string, { label: string; color: string }> = {
  backlog: { label: "To do", color: "bg-gray-500" },
  in_progress: { label: "Working on it", color: "bg-blue-500" },
  in_review: { label: "In review", color: "bg-purple-500" },
  stuck: { label: "Stuck", color: "bg-red-500" },
  done: { label: "Done", color: "bg-green-500" },
}

const priorityConfig: Record<string, { color: string; icon: any }> = {
  critical: { color: "text-red-600 dark:text-red-400", icon: Zap },
  high: { color: "text-orange-600 dark:text-orange-400", icon: AlertCircle },
  medium: { color: "text-yellow-600 dark:text-yellow-400", icon: Clock },
  low: { color: "text-blue-600 dark:text-blue-400", icon: Clock },
}

export function ProjectList({ projectId, isReadOnly = false }: { projectId: any; isReadOnly?: boolean }) {
  const board = useQuery(api.projects.listProjectBoard, { projectId }) as any
  const upsertTask = useMutation(api.functions.upsertTask)
  const deleteTask = useMutation(api.functions.deleteTask)
  
  const [editingTask, setEditingTask] = useState<any | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    backlog: true,
    in_progress: true,
    in_review: true,
    stuck: true,
    done: false,
  })

  const toggleSection = (status: string) => {
    setExpandedSections(prev => ({ ...prev, [status]: !prev[status] }))
  }

  async function handleToggleStatus(task: any) {
    if (isReadOnly) {
      toast.error("You don't have permission to edit tasks")
      return
    }

    const newStatus = task.status === "done" ? "in_progress" : "done"
    await upsertTask({ id: task._id, status: newStatus })
  }

  const isOverdue = (task: any) => task.endDate && new Date(task.endDate) < new Date() && task.status !== "done"

  return (
    <>
      <div className="space-y-2">
        {Object.entries(statusConfig).map(([statusKey, statusInfo]) => {
          const tasks = (board?.[statusKey] || []) as any[]
          const isExpanded = expandedSections[statusKey]

          return (
            <div key={statusKey} className="border rounded-lg overflow-hidden">
              {/* Status Header */}
              <button
                onClick={() => toggleSection(statusKey)}
                className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className={`w-3 h-3 rounded-full ${statusInfo.color}`} />
                  </div>
                  <h3 className="font-semibold text-base">{statusInfo.label}</h3>
                  <Badge variant="secondary" className="ml-2">
                    {tasks.length}
                  </Badge>
                </div>
              </button>

              {/* Tasks Table */}
              {isExpanded && tasks.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/30">
                      <tr>
                        <th className="w-12 p-3"></th>
                        <th className="text-left p-3 font-medium text-sm">Task</th>
                        <th className="text-left p-3 font-medium text-sm w-32">Priority</th>
                        <th className="text-left p-3 font-medium text-sm w-40">Due Date</th>
                        <th className="text-left p-3 font-medium text-sm w-32">Estimate</th>
                        <th className="text-left p-3 font-medium text-sm w-32">Progress</th>
                        <th className="text-left p-3 font-medium text-sm w-40">Assignees</th>
                        <th className="w-12 p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task: any) => {
                        const PriorityIcon = task.priority ? priorityConfig[task.priority]?.icon : null
                        const overdue = isOverdue(task)

                        return (
                          <tr 
                            key={task._id}
                            className={`border-b hover:bg-muted/30 transition-colors cursor-pointer ${
                              overdue ? 'bg-red-500/5' : ''
                            } ${task.status === 'done' ? 'opacity-60' : ''}`}
                            onClick={() => !isReadOnly && setEditingTask(task)}
                          >
                            {/* Checkbox */}
                            <td className="p-3">
                              <Checkbox
                                checked={task.status === "done"}
                                onCheckedChange={() => handleToggleStatus(task)}
                                disabled={isReadOnly}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>

                            {/* Task Title & Description */}
                            <td className="p-3">
                              <div>
                                <div className={`font-medium ${task.status === 'done' ? 'line-through' : ''}`}>
                                  {task.title}
                                </div>
                                {task.description && (
                                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                    {task.description}
                                  </div>
                                )}
                                {/* Labels */}
                                {task.labels && task.labels.length > 0 && (
                                  <div className="flex gap-1 mt-1.5">
                                    {task.labels.slice(0, 3).map((label: string) => (
                                      <Badge key={label} variant="secondary" className="text-xs">
                                        {label}
                                      </Badge>
                                    ))}
                                    {task.labels.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{task.labels.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Priority */}
                            <td className="p-3">
                              {task.priority && PriorityIcon && (
                                <div className="flex items-center gap-1.5">
                                  <PriorityIcon className={`h-3.5 w-3.5 ${priorityConfig[task.priority].color}`} />
                                  <span className="text-sm capitalize">{task.priority}</span>
                                </div>
                              )}
                            </td>

                            {/* Due Date */}
                            <td className="p-3">
                              {task.endDate && (
                                <div className={`flex items-center gap-1.5 text-sm ${
                                  overdue ? 'text-red-600 dark:text-red-400 font-medium' : ''
                                }`}>
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{format(new Date(task.endDate), "MMM d, yyyy")}</span>
                                </div>
                              )}
                            </td>

                            {/* Estimate */}
                            <td className="p-3">
                              <div className="flex items-center gap-2 text-sm">
                                {task.storyPoints && (
                                  <Badge variant="outline" className="text-xs">
                                    {task.storyPoints} SP
                                  </Badge>
                                )}
                                {task.estimatedHours && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{task.estimatedHours}h</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Progress (Subtasks/Comments) */}
                            <td className="p-3">
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                {task.subtasksTotal > 0 && (
                                  <div className="flex items-center gap-1">
                                    <CheckSquare className="h-3.5 w-3.5" />
                                    <span>{task.subtasksCompleted}/{task.subtasksTotal}</span>
                                  </div>
                                )}
                                {task.commentsCount > 0 && (
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    <span>{task.commentsCount}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Assignees */}
                            <td className="p-3">
                              {task.assigneeDetails && task.assigneeDetails.length > 0 && (
                                <div className="flex -space-x-2">
                                  {task.assigneeDetails.slice(0, 3).map((assignee: any, idx: number) => (
                                    <Avatar key={idx} className="h-7 w-7 border-2 border-background" title={assignee.name}>
                                      <AvatarImage src={assignee.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {assignee.name?.[0]?.toUpperCase() || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {task.assigneeDetails.length > 3 && (
                                    <div className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                                      <span className="text-[10px]">+{task.assigneeDetails.length - 3}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* More Actions */}
                            <td className="p-3">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingTask(task)
                                }}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Empty State */}
              {isExpanded && tasks.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No tasks in this status
                </div>
              )}
            </div>
          )
        })}
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
