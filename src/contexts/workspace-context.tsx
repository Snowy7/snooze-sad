"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Id } from "../../convex/_generated/dataModel"

interface WorkspaceContextType {
  currentWorkspaceId: Id<"workspaces"> | null
  setCurrentWorkspaceId: (id: Id<"workspaces"> | null) => void
  workspaces: any[]
  currentWorkspace: any
  isLoading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<Id<"workspaces"> | null>(null)
  
  // Fetch all user workspaces
  const workspaces = useQuery(api.workspaces.listMyWorkspaces) || []
  
  // Fetch current workspace details
  const currentWorkspace = useQuery(
    api.workspaces.getWorkspace,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : "skip"
  )

  // Auto-select first workspace on load
  useEffect(() => {
    if (!currentWorkspaceId && workspaces.length > 0) {
      // Try to load from localStorage first
      const savedWorkspaceId = localStorage.getItem("currentWorkspaceId")
      if (savedWorkspaceId && workspaces.some(w => w._id === savedWorkspaceId)) {
        setCurrentWorkspaceId(savedWorkspaceId as Id<"workspaces">)
      } else {
        setCurrentWorkspaceId(workspaces[0]._id)
      }
    }
  }, [workspaces, currentWorkspaceId])

  // Save to localStorage when changed
  useEffect(() => {
    if (currentWorkspaceId) {
      localStorage.setItem("currentWorkspaceId", currentWorkspaceId)
    }
  }, [currentWorkspaceId])

  const isLoading = workspaces === undefined

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspaceId,
        setCurrentWorkspaceId,
        workspaces,
        currentWorkspace,
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}

