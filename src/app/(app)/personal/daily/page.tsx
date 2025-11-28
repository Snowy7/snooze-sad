"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { ReactFlowProvider } from "@xyflow/react"
import { GraphCanvas } from "@/components/board/graph-canvas"
import { BoardLogo } from "@/components/board-logo"
import { FloatingSidebar } from "@/components/floating-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { useOwnerId } from "@/hooks/use-owner"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function PersonalDailyPage() {
  const ownerId = useOwnerId()
  const router = useRouter()
  const dailyGraph = useQuery(api.graphs.getDailyGraph, ownerId ? { ownerId } : "skip")
  const createDailyGraph = useMutation(api.graphs.createDailyGraph)
  const [isLoading, setIsLoading] = React.useState(false)
  const [mode, setMode] = React.useState<"personal" | "team">("personal")

  const handleModeChange = (newMode: "personal" | "team") => {
    setMode(newMode)
    if (newMode === "team") {
      router.push("/dashboard")
    }
  }

  // Create daily graph if it doesn't exist
  React.useEffect(() => {
    if (ownerId && !dailyGraph && !isLoading) {
      setIsLoading(true)
      createDailyGraph({ ownerId }).then(() => setIsLoading(false))
    }
  }, [ownerId, dailyGraph, createDailyGraph, isLoading])

  if (!dailyGraph && isLoading) {
    return (
      <div className="relative w-full h-full">
        <BoardLogo showWorkspaceSwitcher={false} />
        <FloatingSidebar mode="personal" />
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        
        <div className="flex items-center justify-center h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-3"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 animate-spin mx-auto flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
            </div>
            <p className="text-sm text-muted-foreground">Creating your daily board...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!dailyGraph) {
    return null
  }

  return (
    <ReactFlowProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full"
      >
        <BoardLogo showWorkspaceSwitcher={false} />
        <FloatingSidebar mode="personal" />
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        
        <GraphCanvas
          graphId={dailyGraph._id as any}
          mode="personal"
          category="daily"
        />
      </motion.div>
    </ReactFlowProvider>
  )
}

