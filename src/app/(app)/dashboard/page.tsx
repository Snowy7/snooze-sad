"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/contexts/workspace-context"

export default function DashboardPage() {
  const router = useRouter()
  const { currentWorkspaceId } = useWorkspace()

  React.useEffect(() => {
    // Redirect to workspace dashboard if user has a workspace, otherwise personal
    if (currentWorkspaceId) {
      router.replace(`/workspaces/${currentWorkspaceId}`)
    } else {
      router.replace("/personal")
    }
  }, [router, currentWorkspaceId])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 animate-pulse mx-auto" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  )
}
