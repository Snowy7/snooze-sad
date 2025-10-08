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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  Plus,
  ChevronRight,
  FolderKanban,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
  { label: "My Projects", href: "/projects", Icon: FolderKanban },
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
  const [projectsExpanded, setProjectsExpanded] = React.useState(true)
  const isCollapsed = state === "collapsed"

  // Fetch projects for current workspace
  const projects = useQuery(
    api.functions.listProjects,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : "skip"
  )

  return (
    <TooltipProvider delayDuration={0}>
    <Sidebar collapsible="icon" data-onboarding="sidebar" className="border-none py-4" style={{ "--sidebar-width": "240px", "--sidebar-width-icon": "80px" } as React.CSSProperties}>
      <SidebarHeader className="px-3 py-2">
        <Link href="/dashboard" className="flex h-12 items-center gap-2.5 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 mb-3">
          <Logo className="h-8 w-8 flex-shrink-0 text-primary" />
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden tracking-tight">Snooze</span>
        </Link>

        {/* Workspace Switcher in Header */}
        <div className="group-data-[collapsible=icon]:hidden px-1">
          <WorkspaceSwitcher />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-0">
        {/* Personal Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-2">
            Personal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map(({ href, label, Icon }) => (
                <SidebarMenuItem key={href}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton 
                          asChild 
                          isActive={pathname === href} 
                          className="transition-smooth rounded-lg h-10 w-10 p-0 flex items-center justify-center hover:bg-accent data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                        >
                          <Link href={href}>
                            <Icon className="h-5 w-5" />
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === href} 
                      className="transition-smooth rounded-lg h-9 hover:bg-accent data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                    >
                      <Link href={href}>
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workspace Section */}
        <SidebarGroup className="flex flex-col flex-1 mt-2">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-2">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col flex-1">
            {/* Workspace Dashboard & Projects */}
            {currentWorkspaceId && (
              <SidebarMenu className="flex-1 gap-1">
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === `/workspaces/${currentWorkspaceId}`}
                    className="transition-smooth rounded-lg h-9 hover:bg-accent data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                  >
                    <Link href={`/workspaces/${currentWorkspaceId}`}>
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === `/workspaces/${currentWorkspaceId}/analysis`}
                    className="transition-smooth rounded-lg h-9 hover:bg-accent data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                  >
                    <Link href={`/workspaces/${currentWorkspaceId}/analysis`}>
                      <ChartPie />
                      <span>Analysis</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Collapsible Projects */}
                <SidebarMenuItem>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          className="transition-smooth rounded-lg h-10 w-10 p-0 flex items-center justify-center hover:bg-accent"
                        >
                          <Link href={`/workspaces/${currentWorkspaceId}/projects`}>
                            <FolderKanban className="h-5 w-5" />
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        Projects {projects && projects.length > 0 ? `(${projects.length})` : ''}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div className="flex items-center w-full">
                      <SidebarMenuButton
                        onClick={() => setProjectsExpanded(!projectsExpanded)}
                        className="cursor-pointer flex-1 transition-smooth rounded-lg h-9 hover:bg-accent"
                      >
                        <FolderKanban className="h-4 w-4" />
                        <span className="flex-1">Projects{projects && projects.length > 0 ? ` (${projects.length})` : ''}</span>
                        <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${projectsExpanded ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                    </div>
                  )}
                </SidebarMenuItem>

                {/* Projects List */}
                {projectsExpanded && !isCollapsed && (
                  <>
                    <SidebarMenuItem className="pl-6">
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === `/workspaces/${currentWorkspaceId}/projects`}
                        className="transition-smooth rounded-lg h-8 text-sm hover:bg-accent data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                      >
                        <Link href={`/workspaces/${currentWorkspaceId}/projects`}>
                          <KanbanSquare className="h-3.5 w-3.5" />
                          <span>All Projects</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    {projects && projects.length > 0 ? (
                      <>
                        {projects.slice(0, 5).map((project) => (
                          <SidebarMenuItem key={project._id} className="pl-6">
                            <SidebarMenuButton 
                              asChild 
                              isActive={pathname === `/projects/${project._id}`}
                              className="transition-smooth rounded-lg h-8 text-sm hover:bg-accent data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                            >
                              <Link href={`/projects/${project._id}`}>
                                <div
                                  className="h-2 w-2 rounded-full flex-shrink-0 ring-1 ring-offset-1 ring-offset-sidebar"
                                  style={{ backgroundColor: project.color || '#3B82F6' }}
                                />
                                <span className="truncate">{project.name}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                        {projects.length > 5 && (
                          <SidebarMenuItem className="pl-6">
                            <SidebarMenuButton asChild className="h-8 text-sm">
                              <Link href={`/workspaces/${currentWorkspaceId}/projects`} className="text-muted-foreground hover:text-foreground">
                                <span>+{projects.length - 5} more</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )}
                      </>
                    ) : null}

                  </>
                )}

                 {/* New Project Button at bottom of projects list */}
                 <div className="flex-1 items-center gap-2 content-end mt-2">
                 <SidebarMenuItem>
                   <SidebarMenuButton 
                     asChild 
                     className="transition-smooth rounded-lg h-9 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
                   >
                     <Link href="/projects/new">
                       <Plus className="h-4 w-4" />
                       <span>New Project</span>
                     </Link>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
                   </div>
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-2 py-2">
        <Link href="/settings" className="flex items-center gap-2.5 px-2 py-2 hover:bg-accent rounded-lg transition-smooth group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user?.profilePictureUrl || ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">{(user?.firstName?.[0] || "U").toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-sm group-data-[collapsible=icon]:hidden">
            <div className="font-semibold truncate text-sm">{user?.firstName || "User"}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors group-data-[collapsible=icon]:hidden" />
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    </TooltipProvider>
  )
}

export { SidebarInset } from "@/components/ui/sidebar"
