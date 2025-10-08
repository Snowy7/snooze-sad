"use client"

import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { format } from "date-fns";
import { useOwnerId } from "@/hooks/use-owner";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, TrendingUp, Clock, FileText, Plus, Zap, ListChecks, ArrowRight, Sparkles, Target, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { WeeklyProgress } from "@/components/dashboard/weekly-progress";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const ownerId = useOwnerId()
  const { user } = useAuth()
  const router = useRouter()
  const data = useQuery(api.functions.listDashboard, { ownerId, today })
  const projects = useQuery(api.functions.listProjects, { ownerId }) || []
  const upsertTask = useMutation(api.functions.upsertTask)
  
  // Generate last 7 days for weekly progress
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return format(date, "yyyy-MM-dd")
  })
  const weeklyProgressData = useQuery(api.functions.getWeeklyProgress, { ownerId, dates: weekDates })
  
  const tasks = (data?.tasksToday ?? []).slice(0, 8)
  const overdue = (data?.overdue ?? []).slice(0, 5)
  const recentProjects = projects?.filter((p: any) => !p.status || p.status === "active").slice(0, 6) ?? []
  const upcomingTasks = (data?.tasksToday ?? []).filter((t: any) => t.status !== "done" && t.endDate).slice(0, 5)
  const completed = tasks.filter((t: any) => t.status === "done").length
  const total = tasks.length || 1
  const completionRate = Math.round((completed / total) * 100)
  
  // Personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }
  
  // Motivational message based on progress
  const getMotivationalMessage = () => {
    if (overdue.length > 0) return "Let's tackle those overdue tasks!"
    if (completionRate === 100) return "Amazing work today! You're crushing it!"
    if (completionRate >= 75) return "You're doing great! Keep it up!"
    if (completionRate >= 50) return "You're halfway there! Stay focused!"
    if (completed > 0) return "Great start! Keep the momentum going!"
    return "Ready to make today productive? Let's do this!"
  }

  const handleToggleTask = async (task: any) => {
    const newStatus = task.status === "done" ? "todo" : "done"
    await upsertTask({
      id: task._id,
      title: task.title,
      status: newStatus,
      ownerId: task.ownerId,
      projectId: task.projectId,
      order: task.order,
      startDate: task.startDate,
      endDate: task.endDate,
      priority: task.priority,
      tags: task.tags,
      description: task.description,
    })
  }

  // Show skeleton while loading
  if (data === undefined || projects === undefined) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Hero Greeting */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="relative">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            {getGreeting()}, {user?.firstName || "there"}!
            <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-muted-foreground mb-4">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            {getMotivationalMessage()}
          </div>
        </div>
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completed}/{total}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdue.length}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recentProjects.length}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Primary Focus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Focus */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Today's Focus</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{getMotivationalMessage()}</p>
              </div>
              <Link href="/daily">
                <Button size="sm" variant="ghost" className="gap-1">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No tasks for today</p>
                <Link href="/daily">
                  <Button size="sm" variant="outline">Add Task</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((t: any) => (
                  <div key={t._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group">
                    <button
                      onClick={() => handleToggleTask(t)}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                    >
                      {t.status === "done" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      )}
                    </button>
                    <Link href={`/projects/${t.projectId}`} className="flex-1 min-w-0">
                      <span className={`text-sm ${t.status === "done" ? "line-through text-muted-foreground" : "group-hover:text-primary transition-colors"}`}>
                        {t.title}
                      </span>
                    </Link>
                    {t.priority && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        t.priority === "high" ? "bg-red-500/10 text-red-500" :
                        t.priority === "medium" ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        {t.priority}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Overdue Section - Only show if there are overdue tasks */}
          {overdue.length > 0 && (
            <Card className="p-6 border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-red-500" />
                </div>
                <h2 className="text-lg font-bold">Overdue Tasks</h2>
                <span className="ml-auto text-sm text-red-600 font-medium">{overdue.length} tasks</span>
              </div>
              <div className="space-y-2">
                {overdue.map((t: any) => (
                  <Link key={t._id} href={`/projects/${t.projectId}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                    <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-sm flex-1">{t.title}</span>
                    <span className="text-xs text-muted-foreground">{t.endDate}</span>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Active Projects Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Active Projects</h2>
              <Link href="/projects">
                <Button size="sm" variant="ghost" className="gap-1">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            
            {recentProjects.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed">
                <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No projects yet</p>
                <Link href="/projects/new">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Project
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {recentProjects.map((p: any) => (
                  <Link key={p._id} href={`/projects/${p._id}`}>
                    <Card className="p-4 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-start gap-3">
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: p.color || '#3B82F6' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{p.name}</div>
                          {p.description && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">{p.description}</div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Secondary Info */}
        <div className="space-y-6">
          {/* Weekly Progress */}
          <WeeklyProgress data={weeklyProgressData} />

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/projects/new">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </Link>
              <Link href="/notes">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  New Note
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Calendar
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}