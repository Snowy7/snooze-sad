"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Circle, CheckCircle2 } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns"
import { useOwnerId } from "@/hooks/use-owner"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const ownerId = useOwnerId()
  
  const tasks = useQuery(api.functions.tasksByDateRange, {
    startDate: format(monthStart, "yyyy-MM-dd"),
    endDate: format(monthEnd, "yyyy-MM-dd"),
    ownerId
  }) || []

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dates = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Pad start with previous month days
  const startDay = monthStart.getDay()
  const prevMonthDays = Array.from({ length: startDay }, (_, i) => null)
  const allDays = [...prevMonthDays, ...dates]

  function getTasksForDate(date: Date | null) {
    if (!date) return []
    const dateStr = format(date, "yyyy-MM-dd")
    return tasks.filter((t: any) => {
      // Check if task has specific date
      if (t.date === dateStr) return true
      // Check if task's date range includes this date
      if (t.startDate && t.endDate) {
        return dateStr >= t.startDate && dateStr <= t.endDate
      }
      return false
    })
  }

  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline" onClick={goToToday}>Today</Button>
            <Button size="sm" variant="outline" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map(d => (
            <div key={d} className="text-center text-sm font-medium text-muted-foreground py-2">{d}</div>
          ))}
          {allDays.map((date, i) => {
            const dayTasks = date ? getTasksForDate(date) : []
            const isToday = date ? isSameDay(date, new Date()) : false
            const isCurrentMonth = date ? isSameMonth(date, currentDate) : false
            
            return (
              <div 
                key={i} 
                className={`min-h-24 rounded-lg border transition-colors ${
                  isToday ? 'border-blue-500 bg-blue-500/5' : 'border-border'
                } ${!isCurrentMonth ? 'opacity-30' : ''} ${dayTasks.length > 0 ? 'hover:bg-accent cursor-pointer' : ''}`}
              >
                {date && (
                  <div className="p-2">
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-500' : ''}`}>
                      {format(date, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((t: any) => (
                        <div key={t._id} className="flex items-start gap-1 text-xs">
                          {t.status === "done" ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <span className="truncate flex-1">{t.title}</span>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-muted-foreground">+{dayTasks.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold mb-4">Upcoming Tasks</h3>
        <div className="space-y-3">
          {tasks.filter((t: any) => t.status !== "done" && t.endDate).slice(0, 5).length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No upcoming tasks</div>
          ) : (
            tasks.filter((t: any) => t.status !== "done" && t.endDate).slice(0, 5).map((t: any) => (
              <div key={t._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Due {format(new Date(t.endDate), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
