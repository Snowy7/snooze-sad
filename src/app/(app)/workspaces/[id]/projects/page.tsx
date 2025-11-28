"use client"

import * as React from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { GraphCanvas } from "@/components/board/graph-canvas"
import { ReactFlowProvider } from "@xyflow/react"
import { BoardLogo } from "@/components/board-logo"
import { FloatingSidebar } from "@/components/floating-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { useOwnerId } from "@/hooks/use-owner"
import { Id } from "../../../../../../convex/_generated/dataModel"
import { useWorkspace } from "@/contexts/workspace-context"
import { BoardLoadingOverlay } from "@/components/board-loading-overlay"
import { EmptyProjectsState } from "@/components/project/empty-projects-state"

export default function ProjectsBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const workspaceId = id as Id<"workspaces">
  const router = useRouter()
  const ownerId = useOwnerId()
  const { isSwitching, currentWorkspaceId } = useWorkspace()
  const [mode, setMode] = React.useState<"personal" | "team">("team")
  const [graphId, setGraphId] = React.useState<string | null>(null)

  // Check if workspace has any projects
  const projects = useQuery(
    api.projects.listProjectsForWorkspace,
    workspaceId ? { workspaceId } : "skip"
  )

  // Get or create projects graph
  const projectsGraph = useQuery(
    api.graphs.getProjectsGraph,
    workspaceId ? { workspaceId } : "skip"
  )
  const createProjectsGraph = useMutation(api.graphs.createProjectsGraph)

  // Effect to create projects graph if it doesn't exist and handle workspace changes
  React.useEffect(() => {
    if (workspaceId && ownerId) {
      // Reset graphId when workspace changes to force reload
      if (currentWorkspaceId && currentWorkspaceId !== workspaceId) {
        setGraphId(null)
        return
      }

      if (projectsGraph === null) {
        createProjectsGraph({ workspaceId, ownerId })
          .then((id) => setGraphId(id))
          .catch((error) => console.error("Failed to create projects graph:", error))
      } else if (projectsGraph) {
        setGraphId(projectsGraph._id)
      }
    }
  }, [projectsGraph, workspaceId, ownerId, createProjectsGraph, currentWorkspaceId])

  const handleModeChange = (newMode: "personal" | "team") => {
    setMode(newMode)
    if (newMode === "personal") {
      router.push("/personal")
    } else if (currentWorkspaceId) {
      router.push(`/workspaces/${currentWorkspaceId}`)
    }
  }

  // Show empty state if no projects exist
  if (projects && projects.length === 0) {
    return (
      <div className="relative w-full h-screen">
        <BoardLogo showWorkspaceSwitcher={true} />
        <FloatingSidebar mode={mode} />
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        <EmptyProjectsState workspaceId={workspaceId} />
      </div>
    )
  }

  if (!graphId) {
    return (
      <div className="relative w-full h-screen">
        <BoardLogo showWorkspaceSwitcher={true} />
        <FloatingSidebar mode={mode} />
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading projects board...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      <BoardLogo showWorkspaceSwitcher={true} />
      <FloatingSidebar mode={mode} />
      <ModeToggle mode={mode} onModeChange={handleModeChange} />
      
      <ReactFlowProvider>
        <GraphCanvas
          graphId={graphId}
          mode={mode}
          category="projects"
          className="w-full h-full"
        />
      </ReactFlowProvider>

      {/* Loading overlay when switching workspaces */}
      <BoardLoadingOverlay 
        isLoading={isSwitching || (!graphId && !!workspaceId && !!ownerId)}
        message={isSwitching ? "Switching workspace..." : "Loading projects..."}
      />
    </div>
  )
}

