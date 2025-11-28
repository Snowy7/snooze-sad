"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Zap, X, Plus, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DatePicker } from "@/components/ui/date-picker"
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

export function ProjectSprintsNode({ data, selected }: NodeProps) {
  const router = useRouter()
  const deleteNode = useMutation(api.graphs.deleteNode)
  const createSprint = useMutation(api.sprints.createSprint)
  const projectId = data.projectId

  const sprints = useQuery(
    api.sprints.listSprints,
    projectId ? { projectId } : "skip"
  ) || []

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [newSprint, setNewSprint] = React.useState({
    name: "",
    description: "",
    goal: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  })

  const activeSprint = sprints.find((s: any) => s.status === "active")

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleCreateSprint = async () => {
    if (!projectId || !newSprint.name || !newSprint.startDate || !newSprint.endDate) return

    // Validate dates
    if (newSprint.endDate < newSprint.startDate) {
      alert("End date must be after start date")
      return
    }

    try {
      await createSprint({
        projectId,
        name: newSprint.name,
        description: newSprint.description || undefined,
        goal: newSprint.goal || undefined,
        startDate: newSprint.startDate.toISOString(),
        endDate: newSprint.endDate.toISOString(),
      })
      setNewSprint({ name: "", description: "", goal: "", startDate: undefined, endDate: undefined })
      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to create sprint:", error)
    }
  }

  const handleSprintClick = (sprintId: string) => {
    const project = data.projectId
    const pathParts = window.location.pathname.split("/")
    const workspaceId = pathParts[2]
    router.push(`/workspaces/${workspaceId}/projects/${project}/sprints/${sprintId}`)
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
        minHeight={240}
        maxWidth={600}
        maxHeight={500}
      />

      <Card className={cn(
        "p-5 w-full h-full transition-all flex flex-col overflow-hidden",
        "border-2",
        selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Sprints</h3>
              <p className="text-xs text-muted-foreground">{sprints.length} total</p>
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
                  <DialogTitle>Create Sprint</DialogTitle>
                  <DialogDescription>
                    Create a new sprint to organize tasks into time-boxed iterations.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newSprint.name}
                      onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                      placeholder="Sprint 12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal</Label>
                    <Textarea
                      id="goal"
                      value={newSprint.goal}
                      onChange={(e) => setNewSprint({ ...newSprint, goal: e.target.value })}
                      placeholder="What do you want to achieve?"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newSprint.description}
                      onChange={(e) => setNewSprint({ ...newSprint, description: e.target.value })}
                      placeholder="Additional details..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <DatePicker
                        date={newSprint.startDate}
                        onSelect={(date) => setNewSprint({ ...newSprint, startDate: date })}
                        placeholder="Select start date"
                        maxDate={newSprint.endDate}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <DatePicker
                        date={newSprint.endDate}
                        onSelect={(date) => setNewSprint({ ...newSprint, endDate: date })}
                        placeholder="Select end date"
                        minDate={newSprint.startDate}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateSprint} 
                    disabled={!newSprint.name || !newSprint.startDate || !newSprint.endDate}
                  >
                    Create Sprint
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
                    This will only remove the card from the board. Sprints will not be deleted.
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

        {/* Active Sprint Highlight */}
        {activeSprint && (
          <Card className="p-3 bg-blue-500/5 border-blue-500/20 mb-3 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Active Sprint</span>
              <Badge className="ml-auto bg-blue-500">Live</Badge>
            </div>
            <h4 className="font-semibold text-sm mb-1">{(activeSprint as any).name}</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{new Date((activeSprint as any).startDate).toLocaleDateString()} - {new Date((activeSprint as any).endDate).toLocaleDateString()}</span>
              <span className="text-blue-500 font-medium">
                {(activeSprint as any).completedTaskCount}/{(activeSprint as any).taskCount} tasks
              </span>
            </div>
          </Card>
        )}

        {/* Sprints List */}
        <ScrollArea className="flex-1 -mx-1 px-1">
          <div className="space-y-2">
            {sprints.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No sprints yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create one to get started</p>
              </div>
            ) : (
              sprints.map((sprint: any) => (
                <Card 
                  key={sprint._id} 
                  className={cn(
                    "p-3 cursor-pointer transition-colors group/item",
                    sprint.status === "active" ? "bg-blue-500/5" : "hover:bg-accent"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSprintClick(sprint._id)
                  }}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-medium text-sm truncate">{sprint.name}</h4>
                        {sprint.status === "active" && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">
                      {sprint.completedTaskCount}/{sprint.taskCount} tasks
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Hint */}
        {sprints.length > 0 && (
          <p className="text-[10px] text-muted-foreground text-center mt-3 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
            Click a sprint to view details
          </p>
        )}
      </Card>
    </div>
  )
}

