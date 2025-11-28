"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Flag, X, Plus, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
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

export function ProjectMilestonesNode({ data, selected }: NodeProps) {
  const router = useRouter()
  const deleteNode = useMutation(api.graphs.deleteNode)
  const createMilestone = useMutation(api.milestones.createMilestone)
  const projectId = data.projectId

  const milestones = useQuery(
    api.milestones.listMilestones,
    projectId ? { projectId } : "skip"
  ) || []

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [newMilestone, setNewMilestone] = React.useState({
    name: "",
    description: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  })

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleCreateMilestone = async () => {
    if (!projectId || !newMilestone.name) return

    // Validate dates
    if (newMilestone.startDate && newMilestone.endDate && newMilestone.endDate < newMilestone.startDate) {
      alert("End date must be after start date")
      return
    }

    try {
      await createMilestone({
        projectId,
        name: newMilestone.name,
        description: newMilestone.description || undefined,
        startDate: newMilestone.startDate?.toISOString(),
        endDate: newMilestone.endDate?.toISOString(),
      })
      setNewMilestone({ name: "", description: "", startDate: undefined, endDate: undefined })
      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to create milestone:", error)
    }
  }

  const handleMilestoneClick = (milestoneId: string) => {
    // Navigate to milestone detail view (we'll create this page next)
    const project = data.projectId
    // Get workspace from URL or context
    const pathParts = window.location.pathname.split("/")
    const workspaceId = pathParts[2] // Assuming /workspaces/[id]/...
    router.push(`/workspaces/${workspaceId}/projects/${project}/milestones/${milestoneId}`)
  }

  const handleWheel = (e: React.WheelEvent) => e.stopPropagation()
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === "BUTTON" || target.closest("button")) {
      e.stopPropagation()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return { label: "Active", variant: "default" as const }
      case "completed":
        return { label: "Done", variant: "secondary" as const }
      case "planned":
        return { label: "Planned", variant: "outline" as const }
      default:
        return { label: status, variant: "outline" as const }
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
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Flag className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Milestones</h3>
              <p className="text-xs text-muted-foreground">{milestones.length} total</p>
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
                  <DialogTitle>Create Milestone</DialogTitle>
                  <DialogDescription>
                    Add a new milestone to track major goals and deliverables.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newMilestone.name}
                      onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                      placeholder="MVP Release"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                      placeholder="Describe the milestone..."
                      rows={3}
                    />
                  </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <DatePicker
                      date={newMilestone.startDate}
                      onSelect={(date) => setNewMilestone({ ...newMilestone, startDate: date })}
                      placeholder="Select start date"
                      maxDate={newMilestone.endDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <DatePicker
                      date={newMilestone.endDate}
                      onSelect={(date) => setNewMilestone({ ...newMilestone, endDate: date })}
                      placeholder="Select end date"
                      minDate={newMilestone.startDate}
                    />
                  </div>
                </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateMilestone} disabled={!newMilestone.name}>
                    Create Milestone
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
                    This will only remove the card from the board. Milestones will not be deleted.
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

        {/* Milestones List */}
        <ScrollArea className="flex-1 -mx-1 px-1">
          <div className="space-y-3">
            {milestones.length === 0 ? (
              <div className="text-center py-8">
                <Flag className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No milestones yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create one to get started</p>
              </div>
            ) : (
              milestones.map((milestone: any) => {
                const statusBadge = getStatusBadge(milestone.status)
                return (
                  <Card 
                    key={milestone._id} 
                    className="p-3 hover:bg-accent cursor-pointer transition-colors group/item"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMilestoneClick(milestone._id)
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{milestone.name}</h4>
                          <Badge 
                            variant={statusBadge.variant}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {statusBadge.label}
                          </Badge>
                        </div>
                        {milestone.endDate && (
                          <p className="text-xs text-muted-foreground">Due {new Date(milestone.endDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {milestone.taskCount || 0} task{milestone.taskCount !== 1 ? 's' : ''}
                        </span>
                        <span className="font-medium">{milestone.progress || 0}%</span>
                      </div>
                      <Progress value={milestone.progress || 0} className="h-1.5" />
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </ScrollArea>

        {/* Hint */}
        {milestones.length > 0 && (
          <p className="text-[10px] text-muted-foreground text-center mt-3 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
            Click a milestone to view details
          </p>
        )}
      </Card>
    </div>
  )
}

