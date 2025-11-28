"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/contexts/workspace-context"

export default function ProjectsPage() {
  const router = useRouter()
  const { currentWorkspaceId } = useWorkspace()

  React.useEffect(() => {
    // Redirect to workspace projects page
    if (currentWorkspaceId) {
      router.replace(`/workspaces/${currentWorkspaceId}/projects`)
    } else {
      // If no workspace, redirect to workspaces page
      router.replace("/workspaces/new")
    }
  }, [router, currentWorkspaceId])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 animate-pulse mx-auto" />
        <p className="text-sm text-muted-foreground">Loading projects...</p>
      </div>
    </div>
  )
}
