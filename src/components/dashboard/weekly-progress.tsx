"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, TrendingUp, TrendingDown } from "lucide-react"
import { format, subDays } from "date-fns"

interface WeeklyProgressProps {
  data?: Array<{ date: string; completed: number; total: number }>
}

export function WeeklyProgress({ data }: WeeklyProgressProps) {
  // Generate last 7 days with mock or real data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, "yyyy-MM-dd")
    const dayData = data?.find(d => d.date === dateStr)
    
    return {
      date: dateStr,
      day: format(date, "EEE"),
      completed: dayData?.completed || 0,
      total: dayData?.total || 0,
      percentage: dayData?.total ? Math.round((dayData.completed / dayData.total) * 100) : 0
    }
  })

  const totalCompleted = weekData.reduce((sum, day) => sum + day.completed, 0)
  const totalTasks = weekData.reduce((sum, day) => sum + day.total, 0)
  const avgCompletion = totalTasks ? Math.round((totalCompleted / totalTasks) * 100) : 0
  
  // Compare to previous week (mock for now)
  const trend = 12 // +12% from last week
  const isPositive = trend >= 0

  const maxCompleted = Math.max(...weekData.map(d => d.completed), 1)

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Weekly Progress</h3>
          <p className="text-sm text-muted-foreground">Last 7 days completion rate</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{avgCompletion}%</div>
          <div className={`text-xs flex items-center justify-end gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{isPositive ? "+" : ""}{trend}% vs last week</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {weekData.map((day, index) => (
          <div key={day.date} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">{day.day}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {day.completed}/{day.total}
                </span>
                <span className="font-medium min-w-[3ch] text-right">
                  {day.percentage}%
                </span>
              </div>
            </div>
            <div className="relative h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                  day.percentage >= 80
                    ? "bg-green-500"
                    : day.percentage >= 50
                    ? "bg-blue-500"
                    : day.percentage > 0
                    ? "bg-orange-500"
                    : "bg-muted"
                }`}
                style={{ width: `${day.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total completed</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="font-semibold">{totalCompleted} tasks</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Average completion</span>
          <span className="font-semibold">{avgCompletion}%</span>
        </div>
      </div>
    </Card>
  )
}

