"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { GraphCanvas } from "@/components/board/graph-canvas"
import { ReactFlowProvider } from "@xyflow/react"
import { BoardLogo } from "@/components/board-logo"
import { FloatingSidebar } from "@/components/floating-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { useOwnerId } from "@/hooks/use-owner"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspace } from "@/contexts/workspace-context"

export default function PersonalPage() {
  const router = useRouter()
  const { currentWorkspaceId } = useWorkspace()
  const ownerId = useOwnerId()
  const [mode, setMode] = React.useState<"personal" | "team">("personal")
  const [graphId, setGraphId] = React.useState<string | null>(null)

  // Get personal graph
  const personalGraph = useQuery(
    api.graphs.getPersonalGraph,
    ownerId ? { ownerId } : "skip"
  )
  const createPersonalGraph = useMutation(api.graphs.createPersonalGraph)

  // Effect to manage personal graph
  React.useEffect(() => {
    if (ownerId) {
      if (personalGraph === null) {
        createPersonalGraph({ ownerId })
          .then((id) => setGraphId(id))
          .catch((error) => console.error("Failed to create personal graph:", error))
      } else if (personalGraph) {
        setGraphId(personalGraph._id)
      }
    }
  }, [personalGraph, ownerId, createPersonalGraph])

  const handleModeChange = (newMode: "personal" | "team") => {
    setMode(newMode)
    if (newMode === "team") {
      if (currentWorkspaceId) {
        router.push(`/workspaces/${currentWorkspaceId}`)
      } else {
        router.push("/workspaces/new")
      }
    }
  }

  if (!graphId) {
    return (
      <div className="relative w-full h-screen">
        <BoardLogo showWorkspaceSwitcher={false} />
        <FloatingSidebar mode={mode} />
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading personal dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      <BoardLogo showWorkspaceSwitcher={false} />
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
              category="personal"
              className="w-full h-full"
            />
          </ReactFlowProvider>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
