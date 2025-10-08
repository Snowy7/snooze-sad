"use client"

import { use } from "react"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Users, FolderKanban, CheckCircle2, Clock, Target, BarChart3, Calendar } from "lucide-react"
import { Id } from "../../../../../../convex/_generated/dataModel"
import { format, subDays } from "date-fns"
import { useState } from "react"

export default function WorkspaceAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const workspaceId = id as Id<"workspaces">
  
  const [timeRange, setTimeRange] = useState("7")
  const days = parseInt(timeRange)
  
  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId })
  const projects = useQuery(api.functions.listProjects, { workspaceId })
  const members = useQuery(api.workspaces.listMembers, { workspaceId })

  // Generate date array for time range
  const dateArray = Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i)
    return format(date, "yyyy-MM-dd")
  })

  if (workspace === undefined || projects === undefined || members === undefined) {
    return <AnalysisSkeleton />
  }

  if (workspace === null) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
        <p className="text-muted-foreground">Workspace not found or you don't have access.</p>
      </div>
    )
  }

  // Calculate project statistics
  const activeProjects = projects?.filter(p => p.status === "active" || !p.status).length || 0
  const completedProjects = projects?.filter(p => p.status === "completed").length || 0
  const totalProjects = projects?.length || 0

  // Calculate project distribution by status
  const projectsByStatus = {
    active: activeProjects,
    completed: completedProjects,
    archived: projects?.filter(p => p.status === "archived").length || 0
  }

  // Calculate trend (mock data - would need historical data)
  const projectGrowth = 12 // +12%
  const memberGrowth = 8 // +8%

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Workspace Analysis
          </h1>
          <p className="text-muted-foreground mt-1">{workspace.name}</p>
        </div>
        
        {/* Time Range Filter */}
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Projects"
          value={totalProjects}
          icon={<FolderKanban className="h-5 w-5" />}
          trend={projectGrowth}
          trendLabel="vs last period"
          color="blue"
        />
        <MetricCard
          title="Active Projects"
          value={activeProjects}
          icon={<Clock className="h-5 w-5" />}
          trend={null}
          trendLabel={`${totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0}% of total`}
          color="green"
        />
        <MetricCard
          title="Completed"
          value={completedProjects}
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend={null}
          trendLabel={`${totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}% of total`}
          color="purple"
        />
        <MetricCard
          title="Team Members"
          value={members?.length || 0}
          icon={<Users className="h-5 w-5" />}
          trend={memberGrowth}
          trendLabel="vs last period"
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Status Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Project Distribution
          </h2>
          <div className="space-y-4">
            <StatusBar label="Active" count={projectsByStatus.active} total={totalProjects} color="bg-green-500" />
            <StatusBar label="Completed" count={projectsByStatus.completed} total={totalProjects} color="bg-purple-500" />
            <StatusBar label="Archived" count={projectsByStatus.archived} total={totalProjects} color="bg-gray-500" />
          </div>
        </Card>

        {/* Team Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Overview
          </h2>
          <div className="space-y-4">
            {members && members.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{members.filter(m => m.role === "owner").length}</div>
                    <div className="text-xs text-muted-foreground mt-1">Owners</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{members.filter(m => m.role === "admin").length}</div>
                    <div className="text-xs text-muted-foreground mt-1">Admins</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{members.filter(m => m.role === "member" || m.role === "viewer").length}</div>
                    <div className="text-xs text-muted-foreground mt-1">Members</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total {members.length} team member{members.length !== 1 ? 's' : ''} across all roles
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No team members</div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Projects Performance */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Recent Projects
        </h2>
        {projects && projects.length > 0 ? (
          <div className="space-y-3">
            {projects.slice(0, 10).map((project) => (
              <div key={project._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${project.color || '#3B82F6'}20` }}
                  >
                    <FolderKanban className="h-5 w-5" style={{ color: project.color || '#3B82F6' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{project.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {project.description || "No description"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {project.status && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === "completed" 
                        ? "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                        : project.status === "active"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                    }`}>
                      {project.status}
                    </div>
                  )}
                  {project.endDate && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(project.endDate), "MMM d")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No projects in this workspace yet
          </div>
        )}
      </Card>
    </div>
  )
}

function MetricCard({ title, value, icon, trend, trendLabel, color }: {
  title: string
  value: number
  icon: React.ReactNode
  trend: number | null
  trendLabel: string
  color: string
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    purple: "bg-purple-500/10 text-purple-500",
    orange: "bg-orange-500/10 text-orange-500",
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-all group hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        {trend !== null && (
          <>
            {trend > 0 ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                <TrendingUp className="h-3 w-3" />
                +{trend}%
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                <TrendingDown className="h-3 w-3" />
                {trend}%
              </span>
            )}
          </>
        )}
        <span className="text-muted-foreground">{trendLabel}</span>
      </div>
    </Card>
  )
}

function StatusBar({ label, count, total, color }: {
  label: string
  count: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {count} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-24" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-64" />
          </Card>
        ))}
      </div>
    </div>
  )
}

