"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  ListChecks,
  KanbanSquare,
  CalendarDays,
  NotebookText,
  ChartPie,
  Timer,
  Zap,
  Settings,
  Building2,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { Logo } from "@/components/logo"
import { WorkspaceSwitcher } from "@/components/workspace-switcher"
import { useWorkspace } from "@/contexts/workspace-context"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"

type NavItem = {
  label: string
  href: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Daily", href: "/daily", Icon: ListChecks },
  { label: "Habits", href: "/habits", Icon: Zap },
  { label: "Calendar", href: "/calendar", Icon: CalendarDays },
  { label: "Notes", href: "/notes", Icon: NotebookText },
  { label: "Focus", href: "/focus", Icon: Timer },
  { label: "Analytics", href: "/analytics", Icon: ChartPie },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { currentWorkspace, currentWorkspaceId } = useWorkspace()
  const { state } = useSidebar()
  
  // Fetch projects for current workspace
  const projects = useQuery(
    api.functions.listProjects,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : "skip"
  )

  return (
    <Sidebar collapsible="icon" data-onboarding="sidebar">
      <SidebarHeader className="border-b">
        <Link href="/dashboard" className="flex h-14 items-center gap-3 px-3 group-data-[collapsible=icon]:justify-center">
          <Logo className="h-8 w-8 flex-shrink-0 text-blue-500" />
          <span className="font-semibold text-base group-data-[collapsible=icon]:hidden">Snooze</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* Workspace Switcher */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-1">
              <WorkspaceSwitcher />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href} className="transition-colors">
                    <Link href={href}>
                      <Icon className="transition-transform group-hover:scale-110" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects in Workspace */}
        {currentWorkspaceId && projects && projects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              Projects
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.slice(0, 5).map((project) => (
                  <SidebarMenuItem key={project._id}>
                    <SidebarMenuButton asChild isActive={pathname === `/projects/${project._id}`}>
                      <Link href={`/projects/${project._id}`}>
                        <div 
                          className="h-3 w-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: project.color || '#3B82F6' }}
                        />
                        <span className="truncate">{project.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {projects.length > 5 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/projects" className="text-muted-foreground">
                        <KanbanSquare className="opacity-50" />
                        <span>View all ({projects.length})</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Workspace Settings */}
        {currentWorkspaceId && currentWorkspace && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === `/workspaces/${currentWorkspaceId}/settings`}>
                    <Link href={`/workspaces/${currentWorkspaceId}/settings`}>
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-3 hover:bg-accent rounded-md transition-colors group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8 border-2 flex-shrink-0">
            <AvatarImage src={user?.profilePictureUrl || ""} />
            <AvatarFallback className="bg-blue-500/10 text-blue-500">{(user?.firstName?.[0] || "U").toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-sm group-data-[collapsible=icon]:hidden">
            <div className="font-medium truncate">{user?.firstName || "User"}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export { SidebarInset } from "@/components/ui/sidebar"
