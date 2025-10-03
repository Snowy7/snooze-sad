"use client"

import { useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, CheckCircle2, Clock, Target, Award, Flame, BarChart3 } from "lucide-react"
import { useOwnerId } from "@/hooks/use-owner"
import { format, subDays } from "date-fns"

export default function AnalyticsPage() {
  const ownerId = useOwnerId()
  const analytics = useQuery(api.functions.getAnalytics, { ownerId, days: 7 })

  if (!analytics) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-6" />
            <Skeleton className="h-64 w-full" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-6" />
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </div>
    )
  }

  const { totalCompleted, totalActive, dailyCompletions, timeByProject, projects } = analytics
  
  // Calculate total time
  const totalTime = Object.values(timeByProject).reduce((sum: number, time: any) => sum + (time || 0), 0)
  const totalHours = (totalTime / 3600).toFixed(1)

  // Get daily data for last 7 days
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

  // Get project distribution
  const projectData = Object.entries(timeByProject)
    .filter(([_, time]) => (time as number) > 0)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([name, time]) => ({
      name,
      time: time as number,
      percent: Math.round(((time as number) / totalTime) * 100)
    }))

  // Calculate average per day and trend
  const avgPerDay = (totalCompleted / 7).toFixed(1)
  const firstHalf = last7Days.slice(0, 3).reduce((sum, d) => sum + d.tasks, 0) / 3
  const secondHalf = last7Days.slice(4, 7).reduce((sum, d) => sum + d.tasks, 0) / 3
  const trendPercentage = firstHalf > 0 ? (((secondHalf - firstHalf) / firstHalf) * 100).toFixed(0) : 0
  const isImproving = Number(trendPercentage) > 0

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your productivity and progress over time</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 border-green-500/20 bg-green-500/5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Completed</p>
              <p className="text-3xl font-bold">{totalCompleted}</p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                {isImproving ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {avgPerDay} avg/day
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Tasks</p>
              <p className="text-3xl font-bold">{totalActive}</p>
              <p className="text-xs text-muted-foreground">In progress</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Target className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Focus Time</p>
              <p className="text-3xl font-bold">{totalHours}h</p>
              <p className="text-xs text-muted-foreground">Tracked</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Projects</p>
              <p className="text-3xl font-bold">{projects}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold mb-4">Completed Tasks (Last 7 Days)</h2>
          <div className="space-y-4">
            {last7Days.map((d, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">{d.day}</span>
                <div className="flex-1 h-8 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${(d.tasks / maxTasks) * 100}%` }} 
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{d.tasks}</span>
              </div>
            ))}
          </div>
          {last7Days.every(d => d.tasks === 0) && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No completed tasks this week
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold mb-4">Time Distribution by Project</h2>
          {projectData.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No time tracked yet
            </div>
          ) : (
            <div className="space-y-4">
              {projectData.map((p, i) => {
                const colors = [
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-orange-500',
                  'bg-pink-500'
                ]
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground">{(p.time / 3600).toFixed(1)}h ({p.percent}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-500`} 
                        style={{ width: `${p.percent}%` }} 
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-base font-semibold mb-4">Quick Stats</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold mt-1">
              {totalCompleted + totalActive > 0 
                ? Math.round((totalCompleted / (totalCompleted + totalActive)) * 100)
                : 0}%
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Avg per Day</p>
            <p className="text-2xl font-bold mt-1">
              {(last7Days.reduce((sum, d) => sum + d.tasks, 0) / 7).toFixed(1)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Most Productive Day</p>
            <p className="text-2xl font-bold mt-1">
              {last7Days.reduce((max, d) => d.tasks > max.tasks ? d : max, last7Days[0]).day}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
