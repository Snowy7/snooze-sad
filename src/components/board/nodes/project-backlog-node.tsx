"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Inbox, X, Plus, ChevronRight, ListTodo } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { useRouter } from "next/navigation"

export function ProjectBacklogNode({ data, selected }: NodeProps) {
  const router = useRouter()
  const deleteNode = useMutation(api.graphs.deleteNode)
  const createTaskList = useMutation(api.taskLists.createTaskList)
  const projectId = data.projectId

  const taskLists = useQuery(
    api.taskLists.listTaskLists,
    projectId ? { projectId } : "skip"
  ) || []

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [newTaskList, setNewTaskList] = React.useState({
    name: "",
    description: "",
  })

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleCreateTaskList = async () => {
    if (!projectId || !newTaskList.name) return

    try {
      await createTaskList({
        projectId,
        name: newTaskList.name,
        description: newTaskList.description || undefined,
      })
      setNewTaskList({ name: "", description: "" })
      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to create task list:", error)
    }
  }

  const handleTaskListClick = (taskListId: string) => {
    const project = data.projectId
    const pathParts = window.location.pathname.split("/")
    const workspaceId = pathParts[2]
    router.push(`/workspaces/${workspaceId}/projects/${project}/tasklists/${taskListId}`)
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
        minWidth={380}
        minHeight={280}
        maxWidth={600}
        maxHeight={600}
      />

      <Card className={cn(
        "p-5 w-full h-full transition-all flex flex-col overflow-hidden",
        "border-2",
        selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <ListTodo className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Task Lists</h3>
              <p className="text-xs text-muted-foreground">{taskLists.length} lists</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="h-3 w-3" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Task List</DialogTitle>
                  <DialogDescription>
                    Organize tasks into lists for better management.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newTaskList.name}
                      onChange={(e) => setNewTaskList({ ...newTaskList, name: e.target.value })}
                      placeholder="Backlog, Feature Requests, Bug Fixes..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTaskList.description}
                      onChange={(e) => setNewTaskList({ ...newTaskList, description: e.target.value })}
                      placeholder="What is this list for?"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTaskList} disabled={!newTaskList.name}>
                    Create List
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove card?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will only remove the card from the board. Task lists will not be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Task Lists */}
        <ScrollArea className="flex-1 -mx-1 px-1">
          <div className="space-y-2">
            {taskLists.length === 0 ? (
              <div className="text-center py-8">
                <ListTodo className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No task lists yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create one to organize tasks</p>
              </div>
            ) : (
              taskLists.map((taskList: any) => (
                <Card 
                  key={taskList._id} 
                  className="p-3 hover:bg-accent cursor-pointer transition-colors group/item"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTaskListClick(taskList._id)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <ListTodo className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <h4 className="font-medium text-sm truncate">{taskList.name}</h4>
                      </div>
                      {taskList.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 ml-6">
                          {taskList.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 ml-6">
                        <span className="text-xs text-muted-foreground">
                          {taskList.taskCount || 0} task{taskList.taskCount !== 1 ? 's' : ''}
                        </span>
                        {taskList.completedTaskCount > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {taskList.completedTaskCount} done
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Hint */}
        {taskLists.length > 0 && (
          <p className="text-[10px] text-muted-foreground text-center mt-3 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
            Click a list to view and manage tasks
          </p>
        )}
      </Card>
    </div>
  )
}

