"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Plus, Trash2, Flame, CheckCircle2, Circle, X } from "lucide-react"
import { useOwnerId } from "@/hooks/use-owner"
import { format, subDays, startOfDay } from "date-fns"

export default function HabitsPage() {
  const ownerId = useOwnerId()
  const habits = useQuery(api.functions.listHabits, { ownerId }) || []
  const upsertHabit = useMutation(api.functions.upsertHabit)
  const deleteHabit = useMutation(api.functions.deleteHabit)
  const toggleHabitLog = useMutation(api.functions.toggleHabitLog)
  
  const [editingHabit, setEditingHabit] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Get last 7 days for habit tracking
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(startOfDay(new Date()), 6 - i)
    return {
      date: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE"),
      isToday: format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
    }
  })

  function handleNew() {
    setEditingHabit({ title: "", description: "", frequency: "daily", targetDays: [] })
    setIsDialogOpen(true)
  }

  async function handleSave(data: any) {
    toast.promise(
      upsertHabit({ id: editingHabit?._id || null, ...data, ownerId }),
      {
        loading: 'Saving habit...',
        success: 'Habit saved',
        error: 'Failed to save habit'
      }
    )
    setIsDialogOpen(false)
    setEditingHabit(null)
  }

  async function handleDelete(id: string) {
    const confirm = window.confirm("Delete this habit and all its logs?")
    if (!confirm) return
    
    toast.promise(
      deleteHabit({ id: id as any }),
      {
        loading: 'Deleting habit...',
        success: 'Habit deleted',
        error: 'Failed to delete habit'
      }
    )
  }

  async function handleToggle(habitId: string, date: string) {
    const today = format(new Date(), "yyyy-MM-dd")
    if (date > today) {
      toast.error("Cannot mark future dates")
      return
    }
    
    toast.promise(
      toggleHabitLog({ habitId: habitId as any, date }),
      {
        loading: 'Updating...',
        success: 'Progress updated',
        error: 'Failed to update'
      }
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <p className="text-sm text-muted-foreground">Build consistent routines and track your streaks</p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Flame className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">No habits yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Create your first habit to start tracking</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {habits.map((habit: any) => (
            <HabitCard 
              key={habit._id} 
              habit={habit} 
              days={days}
              onToggle={handleToggle}
              onEdit={() => { setEditingHabit(habit); setIsDialogOpen(true); }}
              onDelete={() => handleDelete(habit._id)}
            />
          ))}
        </div>
      )}

      <HabitDialog 
        habit={editingHabit}
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingHabit(null); }}
        onSave={handleSave}
      />
    </div>
  )
}

function HabitCard({ habit, days, onToggle, onEdit, onDelete }: any) {
  const startDate = days[0].date
  const endDate = days[days.length - 1].date
  const logs = useQuery(api.functions.getHabitLogs, { habitId: habit._id, startDate, endDate }) || []
  
  // Calculate streak - counts consecutive days from yesterday backwards (not including today)
  let currentStreak = 0
  const today = format(new Date(), "yyyy-MM-dd")
  const todayLog = logs.find((l: any) => l.date === today)
  
  // Start from yesterday and go backwards
  for (let i = 1; i < 365; i++) {
    const checkDate = format(subDays(new Date(), i), "yyyy-MM-dd")
    const log = logs.find((l: any) => l.date === checkDate)
    
    // If log exists and is completed, continue streak
    if (log && log.completed) {
      currentStreak++
    } else {
      // If no log or not completed, streak is broken
      break
    }
  }
  
  // If today is completed, add 1 to show current streak including today
  if (todayLog && todayLog.completed) {
    currentStreak++
  }

  function isCompleted(date: string) {
    const log = logs.find((l: any) => l.date === date)
    return log ? log.completed : false
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{habit.title}</h3>
            {currentStreak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-500">
                <Flame className="h-3 w-3" />
                <span className="text-xs font-medium">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          {habit.description && (
            <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
          )}
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day: any) => {
          const completed = isCompleted(day.date)
          const today = format(new Date(), "yyyy-MM-dd")
          const isPast = day.date < today
          const isFuture = day.date > today
          const isClickable = day.date === today
          
          return (
            <button
              key={day.date}
              onClick={() => isClickable && onToggle(habit._id, day.date)}
              disabled={!isClickable}
              className={`aspect-square rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                completed 
                  ? 'border-green-500 bg-green-500/10' 
                  : day.isToday 
                    ? 'border-blue-500 hover:bg-blue-500/5 cursor-pointer'
                    : isFuture
                      ? 'border-border/50 opacity-50 cursor-not-allowed'
                      : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <span className="text-xs font-medium">{day.label}</span>
              {completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : isFuture ? (
                <Circle className="h-5 w-5 text-muted-foreground/50" />
              ) : isPast ? (
                <X className="h-5 w-5 text-red-500/50" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

function HabitDialog({ habit, open, onClose, onSave }: any) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState("daily")
  const [targetDays, setTargetDays] = useState<number[]>([])

  useEffect(() => {
    if (habit) {
      setTitle(habit.title || "")
      setDescription(habit.description || "")
      setFrequency(habit.frequency || "daily")
      setTargetDays(habit.targetDays || [])
    }
  }, [habit])

  const daysOfWeek = [
    { label: "Sun", value: 0 },
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
  ]

  function toggleDay(day: number) {
    if (targetDays.includes(day)) {
      setTargetDays(targetDays.filter(d => d !== day))
    } else {
      setTargetDays([...targetDays, day])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{habit?._id ? 'Edit' : 'New'} Habit</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Exercise, Read, Meditate..." />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Specific Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {frequency === "weekly" && (
            <div>
              <Label>Target Days</Label>
              <div className="flex gap-2 mt-2">
                {daysOfWeek.map(day => (
                  <Button
                    key={day.value}
                    size="sm"
                    variant={targetDays.includes(day.value) ? "default" : "outline"}
                    onClick={() => toggleDay(day.value)}
                    type="button"
                    className="flex-1"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ title, description, frequency, targetDays })}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

