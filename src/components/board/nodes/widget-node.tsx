"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { TrendingUp, Target, Activity, X, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function WidgetNode({ data, selected }: NodeProps) {
  const deleteNode = useMutation(api.graphs.deleteNode)
  const widgetType = data.widgetType || "stats"
  
  const today = new Date().toISOString().split("T")[0]
  const dashboardData = useQuery(
    api.functions.listDashboard,
    data.ownerId ? { ownerId: data.ownerId as string, today } : "skip"
  )

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === "BUTTON" || target.closest("button")) {
      e.stopPropagation()
    }
  }

  const renderContent = () => {
    if (!dashboardData) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-muted-foreground animate-pulse">Loading...</div>
        </div>
      )
    }

    // Extract stats from dashboard data
    const tasksToday = dashboardData.tasksToday || []
    const stats = {
      completedToday: tasksToday.filter((t: any) => t.status === "done").length,
      totalToday: tasksToday.length,
      activeProjects: dashboardData.projects?.length || 0,
      overdueTasks: dashboardData.overdue?.length || 0,
      weeklyProgress: tasksToday.length > 0 ? (tasksToday.filter((t: any) => t.status === "done").length / tasksToday.length) : 0,
    }

    switch (widgetType) {
      case "stats":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-primary">{stats.completedToday}</p>
                <p className="text-xs text-muted-foreground">Tasks completed today</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <p className="text-lg font-semibold text-primary">{stats.activeProjects}</p>
                </div>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                  <p className="text-lg font-semibold text-orange-600">{stats.overdueTasks}</p>
                </div>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-primary">Weekly Progress</span>
                <span className="text-xs font-semibold text-primary">{Math.round(stats.weeklyProgress * 100)}%</span>
              </div>
              <Progress value={stats.weeklyProgress * 100} className="h-2" />
            </div>
          </div>
        )

      case "activity":
        const recentActivity = ((dashboardData as any).recentActivities || []).slice(0, 5).map((a: any) => ({
          _id: a._id,
          action: `${a.action} ${a.entityType}: ${a.metadata?.title || "item"}`,
          timestamp: a.createdAt
        }))
        
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-sm font-semibold text-primary">Recent Activity</h4>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[180px]">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity: any) => (
                  <div key={activity._id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        )

      case "goal":
        const tasksCompleted = tasksToday.filter((t: any) => t.status === "done").length
        const goal = {
          title: "Monthly Tasks Goal",
          current: tasksCompleted,
          target: 50,
        }
        const progress = (goal.current / goal.target) * 100

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground">{goal.title}</h4>
                <p className="text-xs text-muted-foreground">Track your progress</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Progress</span>
                <span className="text-xs font-semibold text-primary">{goal.current} / {goal.target}</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(progress)}% complete
              </p>
            </div>

            {progress >= 100 && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs font-semibold text-primary text-center">
                  🎉 Goal achieved! Great work!
                </p>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Unknown widget type</p>
          </div>
        )
    }
  }

  const widgetTitles = {
    stats: "Personal Stats",
    activity: "Activity Feed",
    goal: "Goals",
  }

  return (
    <div
      className="w-full h-full group"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    >
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={280}
        minHeight={200}
        maxWidth={500}
        maxHeight={400}
      />
      
      <Card
        className={cn(
          "p-4 w-full h-full transition-all overflow-hidden flex flex-col",
          "border-2",
          selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border hover:border-primary/50"
        )}
      >
        {/* Delete button */}
        <div className="absolute top-2 right-2 z-10">
          <AlertDialog>
            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete widget?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this widget. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </Card>
    </div>
  )
}
