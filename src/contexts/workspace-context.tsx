"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Id } from "../../convex/_generated/dataModel"
import { usePathname } from "next/navigation"

interface WorkspaceContextType {
  currentWorkspaceId: Id<"workspaces"> | null
  setCurrentWorkspaceId: (id: Id<"workspaces"> | null) => void
  workspaces: any[]
  currentWorkspace: any
  isLoading: boolean
  isSwitching: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<Id<"workspaces"> | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)
  const [previousWorkspaceId, setPreviousWorkspaceId] = useState<Id<"workspaces"> | null>(null)
  const pathname = usePathname()
  
  // Fetch all user workspaces
  const workspaces = useQuery(api.workspaces.listMyWorkspaces) || []
  
  // Fetch current workspace details
  const currentWorkspace = useQuery(
    api.workspaces.getWorkspace,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : "skip"
  )

  // Extract workspace ID from URL if present
  useEffect(() => {
    const match = pathname.match(/\/workspaces\/([^\/]+)/)
    if (match && match[1]) {
      const urlWorkspaceId = match[1] as Id<"workspaces">
      // Verify it's a valid workspace the user has access to
      if (workspaces && workspaces.length > 0 && workspaces.some(w => w._id === urlWorkspaceId)) {
        if (currentWorkspaceId !== urlWorkspaceId) {
          setCurrentWorkspaceId(urlWorkspaceId)
        }
      } else if (workspaces && workspaces.length > 0 && !workspaces.some(w => w._id === urlWorkspaceId)) {
        // User doesn't have access to this workspace, redirect to personal dashboard
        console.warn("User does not have access to workspace:", urlWorkspaceId)
        // Redirect to personal dashboard instead of trying to find another workspace
        window.location.href = "/personal"
      }
    }
  }, [pathname, workspaces, currentWorkspaceId])

  // Auto-select first workspace on load (fallback)
  useEffect(() => {
    if (!currentWorkspaceId && workspaces.length > 0 && !pathname.includes("/workspaces/")) {
      // Try to load from localStorage first
      const savedWorkspaceId = localStorage.getItem("currentWorkspaceId")
      if (savedWorkspaceId && workspaces.some(w => w._id === savedWorkspaceId)) {
        setCurrentWorkspaceId(savedWorkspaceId as Id<"workspaces">)
      } else {
        setCurrentWorkspaceId(workspaces[0]._id)
      }
    }
  }, [workspaces, currentWorkspaceId, pathname])

  // Track workspace switching
  useEffect(() => {
    if (currentWorkspaceId && previousWorkspaceId && currentWorkspaceId !== previousWorkspaceId) {
      setIsSwitching(true)
      
      // Set a maximum timeout, but also check if currentWorkspace is loaded
      const timer = setTimeout(() => {
        setIsSwitching(false)
      }, 500) // Reduced from 800ms
      
      return () => clearTimeout(timer)
    }
    
    if (currentWorkspaceId) {
      setPreviousWorkspaceId(currentWorkspaceId)
    }
  }, [currentWorkspaceId, previousWorkspaceId])

  // Auto-disable switching state when workspace data is loaded
  useEffect(() => {
    if (isSwitching && currentWorkspace) {
      setIsSwitching(false)
    }
  }, [currentWorkspace, isSwitching])

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
        isSwitching,
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

