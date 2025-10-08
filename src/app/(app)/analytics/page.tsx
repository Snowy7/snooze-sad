"use client"

import { useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, CheckCircle2, Clock, Target, Award, Flame, BarChart3, Calendar } from "lucide-react"
import { useOwnerId } from "@/hooks/use-owner"
import { format, subDays } from "date-fns"

export default function AnalyticsPage() {
  const ownerId = useOwnerId()
  const analytics = useQuery(api.functions.getAnalytics, { ownerId, days: 7 })

  if (!analytics) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const { totalCompleted, totalActive, dailyCompletions, timeByProject, projects } = analytics
  
  const totalTime = Object.values(timeByProject).reduce((sum: number, time: any) => sum + (time || 0), 0)
  const totalHours = (totalTime / 3600).toFixed(1)

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, "yyyy-MM-dd")
    return {
      day: format(date, "EEE"),
      date: dateStr,
      tasks: dailyCompletions[dateStr] || 0
    }
  })

  const maxTasks = Math.max(...last7Days.map(d => d.tasks), 1)

  const projectData = Object.entries(timeByProject)
    .filter(([_, time]) => (time as number) > 0)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([name, time]) => ({
      name,
      time: time as number,
      percent: Math.round(((time as number) / totalTime) * 100)
    }))

  const avgPerDay = (totalCompleted / 7).toFixed(1)
  const firstHalf = last7Days.slice(0, 3).reduce((sum, d) => sum + d.tasks, 0) / 3
  const secondHalf = last7Days.slice(4, 7).reduce((sum, d) => sum + d.tasks, 0) / 3
  const trendPercentage = firstHalf > 0 ? (((secondHalf - firstHalf) / firstHalf) * 100).toFixed(0) : 0
  const isImproving = Number(trendPercentage) > 0

  const bestDay = last7Days.reduce((best, day) => day.tasks > best.tasks ? day : best, last7Days[0])
  const streak = calculateStreak(last7Days)

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Analytics</h1>
        <p className="text-sm text-muted-foreground">Your productivity insights for the last 7 days</p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Completed</p>
              <p className="text-3xl font-bold">{totalCompleted}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {isImproving ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-orange-500" />}
            {avgPerDay} avg/day
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">In Progress</p>
              <p className="text-3xl font-bold">{totalActive}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Active tasks</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Streak</p>
              <p className="text-3xl font-bold">{streak}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Days active</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Projects</p>
              <p className="text-3xl font-bold">{projects}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Active</p>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Daily Activity</h2>
                <p className="text-sm text-muted-foreground">Tasks completed each day</p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${isImproving ? 'text-green-600' : 'text-orange-600'}`}>
                {isImproving ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {isImproving ? '+' : ''}{trendPercentage}%
              </div>
            </div>
            
            <div className="space-y-4">
              {last7Days.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <div className="w-12 text-sm text-muted-foreground font-medium">{day.day}</div>
                  <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                    <div 
                      className={`h-full rounded-lg transition-all duration-500 ${
                        day.tasks > 0 ? 'bg-primary' : 'bg-muted'
                      }`}
                      style={{ width: `${(day.tasks / maxTasks) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-bold">{day.tasks}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Project Distribution */}
          {projectData.length > 0 && (
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold">Project Distribution</h2>
                <p className="text-sm text-muted-foreground">Time spent by project</p>
              </div>
              
              <div className="space-y-4">
                {projectData.map((project, idx) => (
                  <div key={project.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate flex-1">{project.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">{project.percent}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0 ? 'bg-blue-500' :
                          idx === 1 ? 'bg-green-500' :
                          idx === 2 ? 'bg-purple-500' :
                          idx === 3 ? 'bg-orange-500' :
                          'bg-pink-500'
                        }`}
                        style={{ width: `${project.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right - Insights */}
        <div className="space-y-6">
          {/* Performance Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Performance</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="text-sm font-bold">{totalCompleted > 0 ? Math.round((totalCompleted / (totalCompleted + totalActive)) * 100) : 0}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalCompleted > 0 ? Math.round((totalCompleted / (totalCompleted + totalActive)) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Best Day</span>
                </div>
                <p className="text-2xl font-bold">{bestDay.day}</p>
                <p className="text-sm text-muted-foreground">{bestDay.tasks} tasks completed</p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Focus Time</span>
                </div>
                <p className="text-2xl font-bold">{totalHours}h</p>
                <p className="text-sm text-muted-foreground">This week</p>
              </div>
            </div>
          </Card>

          {/* Productivity Trend */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Trend</h2>
            <div className="text-center py-6">
              <div className={`inline-flex items-center justify-center h-20 w-20 rounded-full mb-4 ${
                isImproving ? 'bg-green-500/10' : 'bg-orange-500/10'
              }`}>
                {isImproving ? (
                  <TrendingUp className="h-10 w-10 text-green-500" />
                ) : (
                  <TrendingDown className="h-10 w-10 text-orange-500" />
                )}
              </div>
              <p className={`text-3xl font-bold mb-2 ${isImproving ? 'text-green-600' : 'text-orange-600'}`}>
                {isImproving ? '+' : ''}{trendPercentage}%
              </p>
              <p className="text-sm text-muted-foreground">
                {isImproving ? 'Productivity is improving!' : 'Keep pushing forward!'}
              </p>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">This Week</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Completed</span>
                <span className="text-sm font-bold">{totalCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Daily Average</span>
                <span className="text-sm font-bold">{avgPerDay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Streak</span>
                <span className="text-sm font-bold">{streak} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Focus Hours</span>
                <span className="text-sm font-bold">{totalHours}h</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function calculateStreak(days: Array<{ tasks: number }>): number {
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].tasks > 0) {
      streak++
    } else {
      break
    }
  }
  return streak
}