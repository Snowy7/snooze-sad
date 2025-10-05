"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  LayoutDashboard,
  ListChecks,
  KanbanSquare,
  NotebookText,
  Timer,
  ChartPie,
  Settings,
  User,
  Zap,
  Plus,
  Search,
  Moon,
  Sun,
  LogOut,
  FileText,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useTheme } from "next-themes"
import { signOut } from "@/lib/workos/auth"

export function CommandMenu() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey
      
      // Command menu toggle (Cmd/Ctrl + K)
      if (e.key === "k" && modifier && !e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        setOpen((open) => !open)
        return
      }
      
      // Navigation shortcuts (Cmd/Ctrl + Shift + Key)
      if (modifier && e.shiftKey) {
        let handled = false
        
        if (e.key === "D" || e.key === "d") {
          e.preventDefault()
          e.stopPropagation()
          router.push("/dashboard")
          handled = true
        } else if (e.key === "T" || e.key === "t") {
          e.preventDefault()
          e.stopPropagation()
          router.push("/daily")
          handled = true
        } else if (e.key === "P" || e.key === "p") {
          e.preventDefault()
          e.stopPropagation()
          router.push("/projects")
          handled = true
        } else if (e.key === "H" || e.key === "h") {
          e.preventDefault()
          e.stopPropagation()
          router.push("/habits")
          handled = true
        } else if (e.key === "C" || e.key === "c") {
          e.preventDefault()
          e.stopPropagation()
          router.push("/calendar")
          handled = true
        } else if (e.key === "N" || e.key === "n") {
          e.preventDefault()
          e.stopPropagation()
          router.push("/notes")
          handled = true
        } else if (e.key === "F" || e.key === "f") {
          e.preventDefault()
          e.stopPropagation()
          router.push("/focus")
          handled = true
        } else if (e.key === "A" || e.key === "a") {
          e.preventDefault()
          e.stopPropagation()
          router.push("/analytics")
          handled = true
        } else if (e.key === "X" || e.key === "x") {
          e.preventDefault()
          e.stopPropagation()
          router.push("/projects/new")
          handled = true
        } else if (e.key === "Q" || e.key === "q") {
          e.preventDefault()
          e.stopPropagation()
          // Clear local storage before signing out
          if (typeof window !== 'undefined') {
            localStorage.removeItem('snooze_authenticated');
            localStorage.removeItem('onboarding_completed');
            localStorage.removeItem('spotlight_onboarding_completed');
          }
          signOut()
          handled = true
        }
        
        if (handled) return
      }
      
      // Quick action shortcuts (Cmd/Ctrl without Shift)
      if (modifier && !e.shiftKey && !e.altKey) {
        if (e.key === "," || e.key === ",") {
          e.preventDefault()
          e.stopPropagation()
          router.push("/settings")
          return
        }
      }
    }

    document.addEventListener("keydown", down, { capture: true })
    return () => document.removeEventListener("keydown", down, { capture: true })
  }, [router])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent w-full md:w-64"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
              <CommandShortcut className="hidden sm:inline-flex">⇧⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/daily"))}>
              <ListChecks className="mr-2 h-4 w-4" />
              <span>Daily Tasks</span>
              <CommandShortcut className="hidden sm:inline-flex">⇧⌘T</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/projects"))}>
              <KanbanSquare className="mr-2 h-4 w-4" />
              <span>Projects</span>
              <CommandShortcut className="hidden sm:inline-flex">⇧⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/habits"))}>
              <Zap className="mr-2 h-4 w-4" />
              <span>Habits</span>
              <CommandShortcut className="hidden sm:inline-flex">⇧⌘H</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/calendar"))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
              <CommandShortcut className="hidden sm:inline-flex">⇧⌘C</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/notes"))}>
              <NotebookText className="mr-2 h-4 w-4" />
              <span>Notes</span>
              <CommandShortcut className="hidden sm:inline-flex">⇧⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/focus"))}>
              <Timer className="mr-2 h-4 w-4" />
              <span>Focus Mode</span>
              <CommandShortcut className="hidden sm:inline-flex">⇧⌘F</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/analytics"))}>
              <ChartPie className="mr-2 h-4 w-4" />
              <span>Analytics</span>
              <CommandShortcut className="hidden sm:inline-flex">⇧⌘A</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => router.push("/projects/new"))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>New Project</span>
              <CommandShortcut className="hidden sm:inline-flex">⇧⌘X</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/notes"))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>New Note</span>
              <CommandShortcut className="hidden sm:inline-flex">⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/focus"))}>
              <Timer className="mr-2 h-4 w-4" />
              <span>Start Focus Session</span>
              <CommandShortcut className="hidden sm:inline-flex">⌘F</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
              <CommandShortcut className="hidden sm:inline-flex">⌘L</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
              <CommandShortcut className="hidden sm:inline-flex">⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>System</span>
              <CommandShortcut className="hidden sm:inline-flex">⌘Y</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Account">
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <User className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut className="hidden sm:inline-flex">⌘,</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(async () => {
              // Clear local storage before signing out
              if (typeof window !== 'undefined') {
                localStorage.removeItem('snooze_authenticated');
                localStorage.removeItem('onboarding_completed');
                localStorage.removeItem('spotlight_onboarding_completed');
              }
              await signOut();
            })}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
              <CommandShortcut className="hidden sm:inline-flex">⇧⌘Q</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

