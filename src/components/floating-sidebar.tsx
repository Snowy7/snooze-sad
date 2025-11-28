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
  Settings,
  Plus,
  Bell,
  Moon,
  Sun,
  User,
  Users,
  Monitor,
  LogOut,
  Command,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { signOut } from "@/lib/workos/auth"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { EnhancedCommandPalette } from "./enhanced-command-palette"
import { useWorkspace } from "@/contexts/workspace-context"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  personalOnly?: boolean
  teamOnly?: boolean
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/personal", icon: LayoutDashboard },
  { label: "Daily", href: "/personal/daily", icon: ListChecks, personalOnly: true },
  { label: "Projects", href: "/projects", icon: FolderKanban, teamOnly: true },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Docs", href: "/personal/docs", icon: NotebookText, personalOnly: true },
  { label: "Analytics", href: "/personal/analytics", icon: ChartPie, personalOnly: true },
  { label: "Focus", href: "/personal/focus", icon: Timer, personalOnly: true },
]

interface FloatingSidebarProps {
  mode?: "personal" | "team"
}

export function FloatingSidebar({ mode = "team" }: FloatingSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [commandOpen, setCommandOpen] = React.useState(false)
  const { currentWorkspaceId, workspaces, currentWorkspace, setCurrentWorkspaceId } = useWorkspace()
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = React.useState(false)

  // Get member count for current workspace
  const members = useQuery(
    api.workspaces.listMembers,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : "skip"
  )

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
    <TooltipProvider delayDuration={0}>
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-50"
      >
        <div className="glass-strong border-2 border-primary/20 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 w-16">
          {/* Mode Navigation - Top */}
          <div className="pb-2 border-b border-border/50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={mode === "personal" ? "/personal" : (currentWorkspaceId ? `/workspaces/${currentWorkspaceId}` : "/dashboard")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-10 h-10 p-0 rounded-xl transition-all",
                      (pathname === "/personal" || pathname === "/dashboard" || pathname.startsWith("/workspaces/"))
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    {mode === "personal" ? <User className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {mode === "personal" ? "Personal Dashboard" : "Team Dashboard"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Workspace Switcher for Team Mode */}
          {mode === "team" && (
            <div className="pb-2 border-b border-border/50">
              {!currentWorkspace && workspaces.length === 0 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-full p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                      onClick={() => router.push("/workspaces/new")}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    Create Workspace
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full h-full cursor-pointer flex items-center justify-center">
                      <DropdownMenu open={workspaceDropdownOpen} onOpenChange={setWorkspaceDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                          <div className="h-8 w-8 rounded-lg accent-bg flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {currentWorkspace?.name ? currentWorkspace.name.substring(0, 2).toUpperCase() : "WS"}
                            </span>
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start" className="w-full">
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
                                    setWorkspaceDropdownOpen(false)
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
                                setWorkspaceDropdownOpen(false)

                                // Navigate to the same sub-page in the new workspace if applicable
                                if (pathname.includes("/workspaces/")) {
                                  const pathParts = pathname.split("/").filter(Boolean)
                                  if (pathParts.length > 2) {
                                    const subRoutes = pathParts.slice(2).join("/")
                                    router.push(`/workspaces/${workspace._id}/${subRoutes}`)
                                  } else {
                                    router.push(`/workspaces/${workspace._id}`)
                                  }
                                } else {
                                  router.push(`/workspaces/${workspace._id}`)
                                }
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${currentWorkspaceId === workspace._id ? "opacity-100" : "opacity-0"
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
                                setWorkspaceDropdownOpen(false)
                                router.push("/workspaces/new")
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create Workspace
                            </Button>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className={`font-medium ${workspaceDropdownOpen ? "hidden" : "block"}`}>
                    {currentWorkspace?.name || "Select workspace"}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Navigation Items */}
          {navItems.map(({ href, label, icon: Icon, personalOnly, teamOnly }) => {
            // Filter based on mode
            if (mode === "personal" && teamOnly) return null
            if (mode === "team" && personalOnly) return null

            // Hide dashboard from nav items since it's at the top now
            if (href === "/dashboard") return null

            // Make Projects link dynamic based on workspace
            let finalHref = href
            if (label === "Projects" && currentWorkspaceId) {
              finalHref = `/workspaces/${currentWorkspaceId}/projects`
            }

            const isActive = pathname === finalHref || pathname.startsWith(finalHref + "/")

            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link href={finalHref}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-10 h-10 p-0 rounded-xl transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {label}
                </TooltipContent>
              </Tooltip>
            )
          })}

          <div className="h-px bg-border my-1" />


          {/* Quick Actions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                onClick={() => setCommandOpen(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Quick Create (⌘K)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
              >
                <Bell className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Notifications</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Toggle Theme</TooltipContent>
          </Tooltip>

          <div className="h-px bg-border my-1" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 rounded-xl hover:bg-primary/10"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePictureUrl || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {(user?.firstName?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePictureUrl || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {(user?.firstName?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{user?.firstName || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
      </motion.div>
      <EnhancedCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </TooltipProvider>
  )
}

