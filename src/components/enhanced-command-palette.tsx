"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  ListChecks,
  FolderKanban,
  CalendarDays,
  NotebookText,
  Timer,
  ChartPie,
  Plus,
  FileText,
  CheckSquare,
  StickyNote,
  BarChart3,
  Settings,
} from "lucide-react"
import { useWorkspace } from "@/contexts/workspace-context"
import { useMutation } from "convex/react"
import { api } from "@/lib/convex"

interface EnhancedCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EnhancedCommandPalette({ open, onOpenChange }: EnhancedCommandPaletteProps) {
  const router = useRouter()
  const { currentWorkspaceId } = useWorkspace()
  const createWorkItem = useMutation(api.workItems.createWorkItem)
  const createNode = useMutation(api.graphs.createNode)

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange]
  )

  const handleCreateNode = async (type: string, title: string) => {
    if (!currentWorkspaceId) return

    try {
      // Create the work item first
      const workItemId = await createWorkItem({
        workspaceId: currentWorkspaceId,
        type,
        title,
        status: "backlog",
      })

      // TODO: Get the current graph ID and create a node on it
      // For now, we'll just navigate to the appropriate page
      runCommand(() => {
        if (type === "task") router.push("/daily")
        else if (type === "project") router.push("/projects")
        else if (type === "note") router.push("/notes")
      })
    } catch (error) {
      console.error("Failed to create node:", error)
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => handleCreateNode("task", "New Task"))
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Create Task</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => handleCreateNode("project", "New Project"))
            }
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>Create Project</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => handleCreateNode("note", "New Note"))
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Create Note</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => console.log("Create widget"))
            }
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Add Widget</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/daily"))}
          >
            <ListChecks className="mr-2 h-4 w-4" />
            <span>Daily Tasks</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/projects"))}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>Projects</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/calendar"))}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/notes"))}
          >
            <NotebookText className="mr-2 h-4 w-4" />
            <span>Notes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/focus"))}
          >
            <Timer className="mr-2 h-4 w-4" />
            <span>Focus Mode</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/analytics"))}
          >
            <ChartPie className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Settings */}
        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

