"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Id } from "../../../../../convex/_generated/dataModel"
import { format } from "date-fns"

export default function WorkspaceDashboardPage() {
  const params = useParams()
  const workspaceId = params.id as Id<"workspaces">

  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId })
  const members = useQuery(api.workspaces.listMembers, { workspaceId })
  const projects = useQuery(api.functions.listProjects, { workspaceId })

  // Loading state
  if (workspace === undefined || members === undefined || projects === undefined) {
    return <WorkspaceDashboardSkeleton />
  }

  // Calculate stats
  const totalProjects = projects?.length || 0
  const activeProjects = projects?.filter(p => p.status === "active" || !p.status).length || 0
  const completedProjects = projects?.filter(p => p.status === "completed").length || 0

  // Handle null workspace (not found or no access)
  if (workspace === null) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
        <p className="text-muted-foreground">Workspace not found or you don't have access.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient">
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-muted-foreground mt-2 text-base">{workspace.description}</p>
            )}
          </div>
          <Link href={`/workspaces/${workspaceId}/settings`}>
            <Button variant="outline" className="gap-2">
              Workspace Settings
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid with enhanced metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 card-elevated-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Projects</p>
              <p className="text-3xl font-bold mt-2">{totalProjects}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
              <FolderKanban className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: totalProjects > 0 ? '100%' : '0%' }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Across workspace</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Projects</p>
              <p className="text-3xl font-bold mt-2">{activeProjects}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-all">
              <Clock className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: totalProjects > 0 ? `${(activeProjects / totalProjects) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0}% of total</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</p>
              <p className="text-3xl font-bold mt-2">{completedProjects}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
              <CheckCircle2 className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: totalProjects > 0 ? `${(completedProjects / totalProjects) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}% completion</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Team Members</p>
              <p className="text-3xl font-bold mt-2">{members?.length || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-all">
              <Users className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Active collaborators</p>
        </Card>
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link key={project._id} href={`/projects/${project._id}`}>
                <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${project.color || '#3B82F6'}20` }}
                        >
                          <FolderKanban
                            className="h-5 w-5"
                            style={{ color: project.color || '#3B82F6' }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold group-hover:text-blue-500 transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {project.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {project.status && (
                      <Badge variant={project.status === "active" ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                    )}

                    {(project.startDate || project.endDate) && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {project.startDate && format(new Date(project.startDate), "MMM d")}
                        {project.startDate && project.endDate && " - "}
                        {project.endDate && format(new Date(project.endDate), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No projects yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first project to get started
                </p>
              </div>
              <Link href="/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Team Members Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Team Members</h2>
          <Link href={`/workspaces/${workspaceId}/settings?tab=members`}>
            <Button variant="outline" size="sm">
              Manage Team
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members && members.length > 0 ? (
              members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                    {member.user?.fullName?.[0]?.toUpperCase() || member.user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium truncate">{member.user?.fullName || member.user?.email || "Unknown User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.user?.email}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground col-span-full">No members yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function WorkspaceDashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20" />
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-32" />
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6">
          <Skeleton className="h-64" />
        </Card>
      </div>
    </div>
  )
}

