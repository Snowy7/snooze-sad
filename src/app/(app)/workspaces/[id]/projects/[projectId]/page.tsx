"use client"

import * as React from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { GraphCanvas } from "@/components/board/graph-canvas"
import { ReactFlowProvider } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"
import { Id } from "../../../../../../../convex/_generated/dataModel"
import { motion, AnimatePresence } from "framer-motion"
import { useOwnerId } from "@/hooks/use-owner"
import { BoardLogo } from "@/components/board-logo"
import { FloatingSidebar } from "@/components/floating-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string; projectId: string }> }) {
  const { id, projectId } = use(params)
  const workspaceId = id as Id<"workspaces">
  const router = useRouter()
  const ownerId = useOwnerId()
  const [graphId, setGraphId] = React.useState<string | null>(null)
  const [mode, setMode] = React.useState<"personal" | "team">("team")
  const [isCreatingGraph, setIsCreatingGraph] = React.useState(false)
  const [graphError, setGraphError] = React.useState<string | null>(null)

  // Get project details
  const project = useQuery(api.projects.getProject, { projectId: projectId as any })

  // Get or create project graph
  const projectGraph = useQuery(
    api.graphs.getProjectGraph,
    projectId ? { projectId: projectId as any } : "skip"
  )
  const createProjectGraph = useMutation(api.graphs.createProjectGraph)

  // Effect to create project graph if it doesn't exist
  React.useEffect(() => {
    if (projectId && ownerId && project && !isCreatingGraph) {
      if (projectGraph === null && !graphId) {
        // Project graph doesn't exist, create it
        setIsCreatingGraph(true)
        setGraphError(null)
        createProjectGraph({ projectId: projectId as any, ownerId })
          .then((id) => {
            setGraphId(id)
            setIsCreatingGraph(false)
          })
          .catch((error) => {
            console.error("Failed to create project graph:", error)
            setGraphError(error.message || "Failed to create project board")
            setIsCreatingGraph(false)
          })
      } else if (projectGraph) {
        setGraphId(projectGraph._id)
      }
    }
  }, [projectGraph, projectId, ownerId, project, createProjectGraph, graphId, isCreatingGraph])

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  // Show error state if graph creation failed
  if (graphError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Failed to Initialize Project Board</h3>
            <p className="text-sm text-muted-foreground">{graphError}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setGraphError(null)
                setIsCreatingGraph(false)
              }}
              variant="default"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => router.push(`/workspaces/${id}/projects`)}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!graphId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            {isCreatingGraph ? "Creating project board..." : "Initializing project board..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      {/* Logo - Top Left */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed top-6 left-6 z-50"
      >
        <BoardLogo showWorkspaceSwitcher={true} />
      </motion.div>

      {/* Floating Sidebar - Left Side */}
      <FloatingSidebar mode={mode} />

      {/* Mode Toggle - Top Center */}
      <ModeToggle mode={mode} onModeChange={setMode} />

      {/* Bottom Center Navigation */}
      <TooltipProvider delayDuration={0}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="glass-strong border-2 border-primary/20 rounded-2xl shadow-2xl p-1 flex items-center gap-3">
            {/* Back Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/workspaces/${id}/projects`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">
                Back to Projects
              </TooltipContent>
            </Tooltip>

            {/* Vertical Divider */}
            <div className="h-8 w-px bg-border/50" />

            {/* Project Info */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-secondary/50 transition-all cursor-pointer">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${project.color || '#3B82F6'}20` }}
                  >
                    <div
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: project.color || '#3B82F6' }}
                    />
                  </div>
                  <h2 className="text-sm font-semibold">{project.name}</h2>
                </div>
              </TooltipTrigger>
              {project.description && (
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{project.description}</p>
                </TooltipContent>
              )}
            </Tooltip>

            {/* Vertical Divider */}
            <div className="h-8 w-px bg-border/50" />

            {/* Settings Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">
                Project Settings
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>
      </TooltipProvider>

      {/* Graph Canvas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={graphId}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="w-full h-full"
        >
          <ReactFlowProvider>
            <GraphCanvas
              graphId={graphId}
              mode="team"
              category="projects"
              className="w-full h-full"
            />
          </ReactFlowProvider>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
