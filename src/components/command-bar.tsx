"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ListChecks,
  FolderKanban,
  CalendarDays,
  NotebookText,
  Timer,
  ChartPie,
  Search,
  Plus,
  Settings,
  Command as CommandIcon,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { Logo } from "@/components/logo"
import { WorkspaceSwitcher } from "@/components/workspace-switcher"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { signOut } from "@/lib/workos/auth"
import { cn } from "@/lib/utils"
import { EnhancedCommandPalette } from "@/components/enhanced-command-palette"

type NavTab = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const navTabs: NavTab[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Daily", href: "/daily", icon: ListChecks },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Notes", href: "/notes", icon: NotebookText },
  { label: "Analytics", href: "/analytics", icon: ChartPie },
  { label: "Focus", href: "/focus", icon: Timer },
]

export function CommandBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [commandOpen, setCommandOpen] = React.useState(false)

  // Keyboard shortcut for command palette
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth")
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Left: Logo + Workspace Switcher */}
        <div className="flex items-center gap-3">
          <Link href="/personal" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo className="h-6 w-6 text-primary flex-shrink-0" />
            <span className="font-bold text-lg tracking-tight hidden sm:inline">Snooze</span>
          </Link>
          <div className="h-6 w-px bg-border hidden md:block" />
          <div className="hidden md:block">
            <WorkspaceSwitcher />
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1 flex-1 justify-center">
          {navTabs.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right: Command Search + Quick Actions + Profile */}
        <div className="flex items-center gap-2">
          {/* Command/Search Button */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hidden md:flex"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="text-muted-foreground">Search...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* Quick Create Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/projects/new")}>
                <FolderKanban className="h-4 w-4 mr-2" />
                New Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/daily")}>
                <ListChecks className="h-4 w-4 mr-2" />
                New Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/notes")}>
                <NotebookText className="h-4 w-4 mr-2" />
                New Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <NotificationsDropdown />

          <div className="h-6 w-px bg-border" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePictureUrl || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {(user?.firstName?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePictureUrl || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {(user?.firstName?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{user?.firstName || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Workspace Switcher */}
      <div className="md:hidden px-4 pb-2">
        <WorkspaceSwitcher />
      </div>

      {/* Enhanced Command Palette */}
      <EnhancedCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}

