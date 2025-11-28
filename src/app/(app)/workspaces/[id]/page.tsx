"use client"

import * as React from "react"
import { use } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { GraphCanvas } from "@/components/board/graph-canvas"
import { ReactFlowProvider } from "@xyflow/react"
import { BoardLogo } from "@/components/board-logo"
import { FloatingSidebar } from "@/components/floating-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { useOwnerId } from "@/hooks/use-owner"
import { Id } from "../../../../../convex/_generated/dataModel"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspace } from "@/contexts/workspace-context"
import { BoardLoadingOverlay } from "@/components/board-loading-overlay"

export default function WorkspaceDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const workspaceId = id as Id<"workspaces">
  const router = useRouter()
  const pathname = usePathname()
  const ownerId = useOwnerId()
  const { isSwitching, currentWorkspaceId, workspaces } = useWorkspace()
  const [mode, setMode] = React.useState<"personal" | "team">("team")
  const [graphId, setGraphId] = React.useState<string | null>(null)
  const [hasNavigated, setHasNavigated] = React.useState(false)

  // Check if user has access to this workspace
  const hasAccess = workspaces.some(w => w._id === workspaceId)

  // Redirect if user doesn't have access to this workspace
  React.useEffect(() => {
    if (workspaces.length > 0 && !hasAccess) {
      // User doesn't have access to this workspace, redirect to personal dashboard
      router.replace("/personal")
    }
  }, [workspaces, hasAccess, router])

  // Fallback redirect after 5 seconds to prevent infinite loading
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (workspaces.length === 0) {
        router.replace("/personal")
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [workspaces.length, router])

  // Get last visited page
  const lastVisitedPage = useQuery(
    api.workspaces.getLastVisitedPage,
    workspaceId ? { workspaceId } : "skip"
  )
  
  // Update last visited page
  const updateLastVisitedPage = useMutation(api.workspaces.updateLastVisitedPage)

  // Navigate to last visited page on mount
  React.useEffect(() => {
    if (lastVisitedPage && !hasNavigated && pathname === `/workspaces/${workspaceId}`) {
      setHasNavigated(true)
      router.push(lastVisitedPage)
    }
  }, [lastVisitedPage, hasNavigated, pathname, workspaceId, router])

  // Update last visited page when pathname changes
  React.useEffect(() => {
    if (pathname && pathname !== `/workspaces/${workspaceId}` && pathname.startsWith(`/workspaces/${workspaceId}`)) {
      updateLastVisitedPage({ workspaceId, path: pathname })
    }
  }, [pathname, workspaceId, updateLastVisitedPage])

  // Get default team graph for this workspace
  const defaultTeamGraph = useQuery(
    api.graphs.getDefaultGraph,
    workspaceId ? { workspaceId } : "skip"
  )
  const createDefaultTeamGraph = useMutation(api.graphs.createDefaultGraph)

  // Effect to manage graphId for team mode and handle workspace changes
  React.useEffect(() => {
    if (workspaceId && ownerId) {
      // Reset graphId when workspace changes to force reload
      if (currentWorkspaceId && currentWorkspaceId !== workspaceId) {
        setGraphId(null)
        return
      }

      if (defaultTeamGraph === null) {
        createDefaultTeamGraph({ workspaceId })
          .then((id) => setGraphId(id))
          .catch((error) => console.error("Failed to create team graph:", error))
      } else if (defaultTeamGraph) {
        setGraphId(defaultTeamGraph._id)
      }
    }
  }, [defaultTeamGraph, workspaceId, ownerId, createDefaultTeamGraph, currentWorkspaceId])

  const handleModeChange = (newMode: "personal" | "team") => {
    setMode(newMode)
    if (newMode === "personal") {
      router.push("/personal")
    }
  }

  // Show loading while checking access
  if (workspaces.length === 0) {
    return (
      <div className="relative w-full h-screen">
        <BoardLogo showWorkspaceSwitcher={true} />
        <FloatingSidebar mode={mode} />
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading workspace...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while checking access or if no access
  if (!hasAccess) {
    return (
      <div className="relative w-full h-screen">
        <BoardLogo showWorkspaceSwitcher={true} />
        <FloatingSidebar mode={mode} />
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </div>
        </div>
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
            <p className="text-sm text-muted-foreground">Loading team dashboard...</p>
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
      
      <AnimatePresence mode="wait">
        <motion.div
          key={graphId}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full h-full"
        >
          <ReactFlowProvider>
            <GraphCanvas
              graphId={graphId}
              mode={mode}
              category="team"
              className="w-full h-full"
            />
          </ReactFlowProvider>
        </motion.div>
      </AnimatePresence>

      {/* Loading overlay when switching workspaces */}
      <BoardLoadingOverlay 
        isLoading={isSwitching || (!graphId && !!workspaceId && !!ownerId)}
        message={isSwitching ? "Switching workspace..." : "Loading dashboard..."}
      />
    </div>
  )
}
