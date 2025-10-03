"use client"

import { useState } from "react"
import { useWorkspace } from "@/contexts/workspace-context"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Plus, Building2, Settings, LayoutDashboard, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"

export function WorkspaceSwitcher() {
  const router = useRouter()
  const { currentWorkspaceId, setCurrentWorkspaceId, workspaces, currentWorkspace } = useWorkspace()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  // Get member count for current workspace
  const members = useQuery(
    api.workspaces.listMembers,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : "skip"
  )

  if (!currentWorkspace && workspaces.length === 0) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => router.push("/workspaces/new")}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Workspace
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start h-auto py-2 px-2 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col items-start overflow-hidden flex-1">
                <span className="truncate text-sm font-medium w-full text-left">
                  {currentWorkspace?.name || "Select workspace"}
                </span>
                {members && members.length > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-auto" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[280px]">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Switch Workspace</span>
            <Badge variant="secondary" className="text-xs">
              {workspaces.length}
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Settings Link at Top */}
          {currentWorkspaceId && (
            <>
              <div className="p-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setDropdownOpen(false)
                    router.push(`/workspaces/${currentWorkspaceId}/settings`)
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Workspace Settings
                </Button>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Workspace List */}
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace._id}
              onSelect={() => {
                setCurrentWorkspaceId(workspace._id)
                setDropdownOpen(false)
              }}
              className="cursor-pointer"
            >
              <Check
                className={`mr-2 h-4 w-4 ${
                  currentWorkspaceId === workspace._id ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="truncate font-medium">{workspace.name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {workspace.role}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <div className="p-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setDropdownOpen(false)
                router.push("/workspaces/new")
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Workspace
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

