"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderKanban, X, Plus, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
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
import { useWorkspace } from "@/contexts/workspace-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

export function ProjectListNode({ data, selected }: NodeProps) {
  const { currentWorkspaceId } = useWorkspace()
  const deleteNode = useMutation(api.graphs.deleteNode)

  // Fetch projects
  const projects = useQuery(
    api.functions.listProjects,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : "skip"
  )

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleWheel = (e: React.WheelEvent) => e.stopPropagation()
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === "BUTTON" || target.closest("button") || target.tagName === "A" || target.closest("a")) {
      e.stopPropagation()
    }
  }

  return (
    <div className="w-full h-full group" onWheel={handleWheel} onMouseDown={handleMouseDown}>
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={400}
        minHeight={240}
        maxWidth={700}
        maxHeight={500}
      />

      <Card
        className={cn(
          "p-5 w-full h-full transition-all overflow-hidden flex flex-col",
          "border-2",
          selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border hover:border-primary/50"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderKanban className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Projects</h3>
              <p className="text-xs text-muted-foreground">{projects?.length || 0} total</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link href={currentWorkspaceId ? `/workspaces/${currentWorkspaceId}/projects` : "/projects"} onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="ghost" className="h-7 gap-1 px-2">
                <ArrowRight className="h-3 w-3" />
                View All
              </Button>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete project list?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove this widget from your board.
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
        </div>

        {/* Projects List */}
        <ScrollArea className="flex-1 -mx-1 px-1">
          {projects && projects.length > 0 ? (
            <div className="space-y-2">
              {projects.slice(0, 6).map((project) => (
                <Link
                  key={project._id}
                  href={currentWorkspaceId ? `/workspaces/${currentWorkspaceId}/projects/${project._id}` : `/projects/${project._id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Card className="p-3 hover:bg-accent cursor-pointer transition-colors group/item">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${project.color || '#3B82F6'}20` }}
                      >
                        <FolderKanban
                          className="h-4 w-4"
                          style={{ color: project.color || '#3B82F6' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate group-hover/item:text-primary transition-colors">
                          {project.name}
                        </h4>
                        {project.description && (
                          <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                        )}
                      </div>
                      {project.status && (
                        <Badge
                          variant={project.status === "active" ? "default" : "secondary"}
                          className="capitalize flex-shrink-0"
                        >
                          {project.status}
                        </Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
              {projects.length > 6 && (
                <Link href="/projects" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="w-full">
                    View all {projects.length} projects
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <FolderKanban className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">No projects yet</p>
              <p className="text-xs text-muted-foreground mb-3">Create your first project to get started</p>
              <Link href={currentWorkspaceId ? `/workspaces/${currentWorkspaceId}/projects` : "/projects"} onClick={(e) => e.stopPropagation()}>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  View Projects
                </Button>
              </Link>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  )
}

