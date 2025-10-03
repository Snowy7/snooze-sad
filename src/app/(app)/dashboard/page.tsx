"use client"

import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { format } from "date-fns";
import { useOwnerId } from "@/hooks/use-owner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, TrendingUp, Clock, FileText, Plus, Zap, ListChecks, ArrowRight } from "lucide-react";
import Link from "next/link";
import { OnboardingModal } from "@/components/onboarding-modal";
import { SpotlightOnboarding } from "@/components/spotlight-onboarding";
import { WeeklyProgress } from "@/components/dashboard/weekly-progress";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const ownerId = useOwnerId()
  const data = useQuery(api.functions.listDashboard, { ownerId, today })
  const projects = useQuery(api.functions.listProjects, { ownerId }) || []
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  const tasks = (data?.tasksToday ?? []).slice(0, 5)
  const overdue = (data?.overdue ?? []).slice(0, 3)
  const notes = (data?.notes ?? []).slice(0, 3)
  const recentProjects = projects?.filter((p: any) => !p.status || p.status === "active").slice(0, 4) ?? []
  const upcomingTasks = (data?.tasksToday ?? []).filter((t: any) => t.status !== "done" && t.endDate).slice(0, 4)
  const completed = tasks.filter((t: any) => t.status === "done").length
  const total = tasks.length || 1

  // Check if user has completed onboarding
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboarding_completed")
    if (!onboardingCompleted) {
      setShowOnboarding(true)
    }
  }, [])

  // Show skeleton while loading
  if (data === undefined || projects === undefined) {
    return <DashboardSkeleton />
  }

  return (
    <>
      <SpotlightOnboarding />
      <div className="space-y-6 p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Welcome back!</h1>
            <p className="text-sm text-muted-foreground mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          </div>
        <div className="flex gap-2" data-onboarding="quick-actions">
          <Link href="/daily">
            <Button size="sm" variant="outline" className="gap-2">
              <ListChecks className="h-4 w-4" />
              Daily Tasks
            </Button>
          </Link>
          <Link href="/notes">
            <Button size="sm" variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              New Note
            </Button>
          </Link>
          <Link href="/focus">
            <Button size="sm" className="gap-2">
              <Zap className="h-4 w-4" />
              Start Focus
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4" data-onboarding="stats">
        <StatCard 
          label="Today's Tasks" 
          value={`${completed}/${total}`} 
          icon={<CheckCircle2 className="h-5 w-5" />} 
          trend="+2 from yesterday"
          color="blue"
        />
        <StatCard 
          label="Overdue" 
          value={overdue.length} 
          icon={<Clock className="h-5 w-5" />} 
          trend={overdue.length === 0 ? "All caught up!" : "Needs attention"}
          color="red"
        />
        <StatCard 
          label="Completion Rate" 
          value={`${Math.round((completed / total) * 100)}%`} 
          icon={<TrendingUp className="h-5 w-5" />} 
          trend="Last 7 days"
          color="green"
        />
        <StatCard 
          label="Active Projects" 
          value={recentProjects.length} 
          icon={<FileText className="h-5 w-5" />} 
          trend={`${upcomingTasks.length} upcoming`}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Today's Tasks</h2>
              <Link href="/daily">
                <Button size="sm" variant="ghost" className="gap-1">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <ul className="space-y-2">
              {tasks.length === 0 ? (
                <li className="text-sm text-muted-foreground py-12 text-center border-2 border-dashed rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
                    <p>No tasks for today</p>
                    <Link href="/daily">
                      <Button size="sm" variant="outline" className="mt-2">Add Task</Button>
                    </Link>
                  </div>
                </li>
              ) : (
                tasks.map((t: any) => (
                  <li key={t._id} className="flex items-center gap-3 group hover:bg-accent p-3 rounded-lg transition-all border border-transparent hover:border-border">
                    {t.status === "done" ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                    <span className={`text-sm flex-1 ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                  </li>
                ))
              )}
            </ul>
          </Card>

          {overdue.length > 0 && (
            <Card className="p-6 border-red-500/20 bg-red-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  <h2 className="text-lg font-semibold">Overdue Tasks</h2>
                </div>
                <Link href="/projects">
                  <Button size="sm" variant="ghost" className="gap-1">
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <ul className="space-y-2">
                {overdue.map((t: any) => (
                  <li key={t._id} className="flex items-center gap-3 hover:bg-accent p-3 rounded-lg transition-colors">
                    <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-sm flex-1">{t.title}</span>
                    <span className="text-xs text-muted-foreground">{t.endDate}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Notes</h2>
              <Link href="/notes">
                <Button size="sm" variant="ghost" className="gap-1">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <ul className="space-y-2">
            {notes.length === 0 ? (
              <li className="text-sm text-muted-foreground py-8 text-center">No notes yet</li>
            ) : (
              notes.map((n: any) => (
                <li key={n._id} className="flex items-start gap-3 hover:bg-accent p-2 rounded-lg transition-colors">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{n.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{n.content?.replace(/<[^>]*>/g, '').slice(0, 50)}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <WeeklyProgress />

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Active Projects</h2>
              <Link href="/projects">
                <Button size="sm" variant="ghost" className="gap-1">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {recentProjects.length === 0 ? (
                <div className="text-sm text-muted-foreground py-12 text-center border-2 border-dashed rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                    <p>No projects yet</p>
                    <Link href="/projects/new">
                      <Button size="sm" variant="outline" className="mt-2 gap-2">
                        <Plus className="h-4 w-4" />
                        Create Project
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                recentProjects.map((p: any) => (
                  <Link key={p._id} href={`/projects/${p._id}`}>
                    <div className="flex items-center gap-3 hover:bg-accent p-3 rounded-lg transition-all border border-transparent hover:border-border cursor-pointer">
                      <div className={`h-3 w-3 rounded-full ${getProjectColor(p.color)} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        {p.description && <div className="text-xs text-muted-foreground truncate">{p.description}</div>}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
              <Link href="/daily">
                <Button size="sm" variant="ghost" className="gap-1">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <ul className="space-y-2">
              {upcomingTasks.length === 0 ? (
                <li className="text-sm text-muted-foreground py-8 text-center">No upcoming tasks</li>
              ) : (
                upcomingTasks.map((t: any) => (
                  <li key={t._id} className="flex items-center gap-3 hover:bg-accent p-3 rounded-lg transition-all border border-transparent hover:border-border">
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm flex-1">{t.title}</span>
                    {t.endDate && <span className="text-xs text-muted-foreground">{format(new Date(t.endDate), "MMM d")}</span>}
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
    </>
  )
}

function StatCard({ label, value, icon, trend, color }: { label: string; value: string | number; icon: React.ReactNode; trend: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500",
    red: "bg-red-500/10 text-red-500",
    green: "bg-green-500/10 text-green-500",
    orange: "bg-orange-500/10 text-orange-500",
    purple: "bg-purple-500/10 text-purple-500",
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{trend}</p>
        </div>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

function getProjectColor(color?: string) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
    red: "bg-red-500",
  }
  return colors[color || "blue"]
}
