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
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react"

export function WorkspaceSwitcher() {
  const router = useRouter()
  const { currentWorkspaceId, setCurrentWorkspaceId, workspaces, currentWorkspace } = useWorkspace()
  const [dropdownOpen, setDropdownOpen] = useState(false)

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
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {currentWorkspace?.name || "Select workspace"}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px]">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
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
                <span className="truncate">{workspace.name}</span>
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

