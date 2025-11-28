"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { BoardLogo } from "@/components/board-logo"
import { FloatingSidebar } from "@/components/floating-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2, LayoutGrid, List, Plus, ListTodo } from "lucide-react"
import { TaskKanban } from "@/components/tasks/task-kanban"
import { TaskListView } from "@/components/tasks/task-list-view"
import { EnhancedTaskDialog } from "@/components/tasks/enhanced-task-dialog"
import { TaskEditWrapper } from "@/components/tasks/task-edit-wrapper"
import { cn } from "@/lib/utils"
import React from "react"

export default function TaskListDetailPage({ params }: { params: Promise<{ id: string; projectId: string; taskListId: string }> }) {
  const { id, projectId, taskListId } = use(params)
  const router = useRouter()
  
  const taskList = useQuery(api.taskLists.getTaskList, { taskListId: taskListId as any })
  const tasks = useQuery(api.taskLists.getTaskListTasks, { taskListId: taskListId as any }) || []
  const project = useQuery(api.projects.getProject, { projectId: projectId as any })
  const workspaceMembers = useQuery(
    api.workspaces.listMembers,
    id ? { workspaceId: id as any } : "skip"
  ) || []
  
  const updateTaskList = useMutation(api.taskLists.updateTaskList)
  const deleteTaskList = useMutation(api.taskLists.deleteTaskList)
  const updateTask = useMutation(api.workItems.updateWorkItem)
  const removeTaskFromList = useMutation(api.taskLists.removeTaskFromList)
  
  const [mode, setMode] = React.useState<"personal" | "team">("team")
  const [viewMode, setViewMode] = React.useState<"kanban" | "list">("kanban")
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<any>(null)
  const [taskEditPanelOpen, setTaskEditPanelOpen] = React.useState(false)
  
  const handleDelete = async () => {
    if (!taskList || !confirm("Delete this task list? Tasks will not be deleted.")) return
    
    await deleteTaskList({ taskListId: taskList._id })
    router.push(`/workspaces/${id}/projects/${projectId}`)
  }
  
  const handleTaskUpdate = async (taskId: string, updates: any) => {
    await updateTask({
      workItemId: taskId as any,
      ...updates,
    })
  }
  
  const handleTaskDelete = async (taskId: string) => {
    if (!confirm("Remove this task from the list?")) return
    await removeTaskFromList({ taskId: taskId as any, taskListId: taskListId as any })
  }
  
  const handleTaskClick = (task: any) => {
    setSelectedTask(task)
    setTaskEditPanelOpen(true)
  }

  const handleModeChange = (newMode: "personal" | "team") => {
    setMode(newMode)
    if (newMode === "personal") {
      router.push("/personal")
    }
  }
  
  const completedCount = tasks.filter((t: any) => t.status === "done").length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0
  const isLoading = !taskList
  
  return (
    <div className="relative w-full h-screen flex flex-col bg-background">
      {/* App chrome - always visible */}
      <BoardLogo showWorkspaceSwitcher={true} />
      <FloatingSidebar mode={mode} />
      <ModeToggle mode={mode} onModeChange={handleModeChange} />
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden pt-16">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 animate-pulse mx-auto" />
              <p className="text-sm text-muted-foreground">Loading task list...</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col max-w-[1600px] mx-auto px-6">
            {/* Header */}
            <div className="flex items-center justify-between py-4 border-b">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push(`/workspaces/${id}/projects/${projectId}`)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="h-6 w-px bg-border" />
                <div>
                  <h1 className="text-xl font-bold">{taskList.name}</h1>
                  <p className="text-xs text-muted-foreground">
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''} • {progress}% complete
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                  <Button
                    size="icon"
                    variant={viewMode === "kanban" ? "default" : "ghost"}
                    onClick={() => setViewMode("kanban")}
                    className="h-7 w-7"
                    title="Kanban View"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    onClick={() => setViewMode("list")}
                    className="h-7 w-7"
                    title="List View"
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button size="sm" onClick={() => setTaskDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden py-4">
            {viewMode === "kanban" ? (
              <TaskKanban
                tasks={tasks.filter((t): t is NonNullable<typeof t> => t !== null) as any}
                onTaskClick={handleTaskClick}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onCreateTask={() => setTaskDialogOpen(true)}
                workspaceMembers={workspaceMembers}
              />
            ) : (
              <TaskListView
                tasks={tasks.filter((t): t is NonNullable<typeof t> => t !== null) as any}
                workspaceMembers={workspaceMembers}
                onTaskClick={handleTaskClick}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onCreateTask={() => setTaskDialogOpen(true)}
              />
            )}
          </div>
        </div>
        )}
      </div>
      
      {/* Task Dialog */}
      {project && (
        <>
          <EnhancedTaskDialog
            open={taskDialogOpen}
            onOpenChange={setTaskDialogOpen}
            workspaceId={project.workspaceId!}
            projectId={projectId}
            defaultTaskListId={taskListId}
            onTaskCreated={() => setTaskDialogOpen(false)}
          />
          <TaskEditWrapper
            open={taskEditPanelOpen}
            onOpenChange={setTaskEditPanelOpen}
            task={selectedTask}
            workspaceId={project.workspaceId!}
            projectId={projectId}
          />
        </>
      )}
    </div>
  )
}
