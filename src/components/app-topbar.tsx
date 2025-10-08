"use client"

import * as React from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandMenu } from "@/components/command-menu"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { usePathname } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Id } from "../../convex/_generated/dataModel"
import { Plus } from "lucide-react"
import Link from "next/link"

export function AppTopbar() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  
  // Determine what type of route we're on
  const isWorkspaceRoute = segments[0] === "workspaces" && segments[1] && segments[1] !== "new"
  const isProjectRoute = segments[0] === "projects" && segments[1] && segments[1] !== "new"
  
  // Fetch workspace data if needed (always call hooks, use skip when not needed)
  const workspaceId = isWorkspaceRoute ? (segments[1] as Id<"workspaces">) : undefined
  const workspace = useQuery(
    api.workspaces.getWorkspace,
    workspaceId ? { workspaceId } : "skip"
  )
  
  // Fetch project data if needed (always call hooks, use skip when not needed)
  const projectId = isProjectRoute ? (segments[1] as Id<"projects">) : undefined
  const projectDetails = useQuery(
    api.functions.getProjectDetails,
    projectId ? { projectId } : "skip"
  )
  
  // Determine the title
  const getTitle = () => {
    if (isWorkspaceRoute && workspace) {
      return workspace.name
    }
    
    if (isProjectRoute && projectDetails?.project) {
      return projectDetails.project.name
    }
    
    const pageName = segments[segments.length - 1] || "dashboard"
    
    // Map route names to friendly titles
    const titleMap: Record<string, string> = {
      dashboard: "Dashboard",
      daily: "Daily Tasks",
      calendar: "Calendar",
      notes: "Notes",
      focus: "Focus Mode",
      analytics: "Analytics",
      settings: "Settings",
      projects: "My Projects",
      workspaces: "Workspaces",
      new: "Create New",
      analysis: "Analysis"
    }
    
    return titleMap[pageName] || pageName.charAt(0).toUpperCase() + pageName.slice(1)
  }
  
  const title = getTitle()
  
  return (
    <header className="flex-shrink-0 flex h-16 items-center gap-4 px-6 border-b bg-card/50">
      <SidebarTrigger className="h-9 w-9 -ml-2" />
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-base font-semibold truncate">
          {segments.slice(0, -1).length > 0 ? (
            <span className="text-muted-foreground font-normal capitalize">{segments.slice(0, -1).join(" / ")} / </span>
          ) : null}
          <span className="capitalize">{title}</span>
        </h1>
      </div>
      <div className="flex-1 flex justify-center max-w-lg mx-auto" data-onboarding="search">
        <CommandMenu />
      </div>
      <div className="flex items-center gap-2">
        <NotificationsDropdown />
        <Link href="/projects/new" className="hidden sm:inline-flex">
          <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-smooth shadow-sm">
            <Plus className="h-4 w-4" />
            New
          </button>
        </Link>
        <ModeToggle />
      </div>
    </header>
  )
}
