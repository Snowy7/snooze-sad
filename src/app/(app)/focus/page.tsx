"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Square, Timer, X, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useOwnerId } from "@/hooks/use-owner"

export default function FocusPage() {
  const ownerId = useOwnerId()
  const activeTasks = useQuery(api.functions.allActiveTasks, { ownerId }) || []
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [sessionId, setSessionId] = useState<any>(null)
  const startTimelog = useMutation(api.functions.startTimelog)
  const stopTimelog = useMutation(api.functions.stopTimelog)

  const selectedTask = activeTasks.find((t: any) => t._id === selectedTaskId)

  useEffect(() => {
    if (isRunning) {
      setTotalSeconds(hours * 3600 + minutes * 60)
      setSeconds(hours * 3600 + minutes * 60)
    }
  }, [isRunning])

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setIsRunning(false)
          setIsFocusMode(false)
          toast.success("Focus session complete! Great work!")
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  async function start() {
    if (!selectedTaskId) {
      toast.error("Please select a task first")
      return
    }
    const totalTime = hours * 3600 + minutes * 60
    if (totalTime === 0) {
      toast.error("Please set a time greater than 0")
      return
    }
    const id = await startTimelog({ taskId: selectedTaskId, userId: ownerId, start: new Date().toISOString() })
    setSessionId(id)
    setIsRunning(true)
    setIsFocusMode(true)
    setTotalSeconds(totalTime)
    setSeconds(totalTime)
  }

  async function pause() {
    setIsRunning(false)
    toast.info("Focus session paused")
  }

  async function stop() {
    if (sessionId) await stopTimelog({ logId: sessionId, end: new Date().toISOString() })
    setIsRunning(false)
    setIsFocusMode(false)
    setSeconds(0)
    setSessionId(null)
    toast.success("Focus session ended")
  }

  const displayHours = Math.floor(seconds / 3600)
  const displayMinutes = Math.floor((seconds % 3600) / 60)
  const displaySeconds = seconds % 60
  const progress = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0

  function incrementHours() {
    if (!isRunning) setHours(h => Math.min(h + 1, 23))
  }

  function decrementHours() {
    if (!isRunning) setHours(h => Math.max(h - 1, 0))
  }

  function incrementMinutes() {
    if (!isRunning) setMinutes(m => Math.min(m + 1, 59))
  }

  function decrementMinutes() {
    if (!isRunning) setMinutes(m => Math.max(m - 1, 0))
  }

  if (isFocusMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-4 right-4 gap-2"
          onClick={() => setIsFocusMode(false)}
        >
          <X className="h-4 w-4" />
          Exit Focus
        </Button>

        <div className="max-w-2xl w-full space-y-12 text-center">
          <div className="space-y-4">
            <div className="inline-flex h-20 w-20 rounded-full bg-blue-500/10 items-center justify-center mx-auto">
              <Timer className="h-10 w-10 text-blue-500" />
            </div>
            {selectedTask && (
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">{selectedTask.title}</h1>
                {selectedTask.description && (
                  <p className="text-muted-foreground text-lg max-w-xl mx-auto">{selectedTask.description}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="text-[8rem] font-bold tabular-nums tracking-tighter leading-none">
              {String(displayHours).padStart(2, "0")}:
              {String(displayMinutes).padStart(2, "0")}:
              {String(displaySeconds).padStart(2, "0")}
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {!isRunning ? (
              <Button size="lg" onClick={() => setIsRunning(true)} className="gap-2 px-8">
                <Play className="h-5 w-5" />
                Resume
              </Button>
            ) : (
              <>
                <Button size="lg" variant="outline" onClick={pause} className="gap-2 px-8">
                  <Pause className="h-5 w-5" />
                  Pause
                </Button>
                <Button size="lg" variant="destructive" onClick={stop} className="gap-2 px-8">
                  <Square className="h-5 w-5" />
                  End Session
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-6 animate-in fade-in zoom-in-95 duration-500">
      <Card className="p-12 max-w-2xl w-full">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex h-16 w-16 rounded-full bg-blue-500/10 items-center justify-center mx-auto mb-4">
              <Timer className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold">Focus Mode</h1>
            <p className="text-muted-foreground">Select a task and set your timer to begin</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Select Task</label>
              <Select value={selectedTaskId || undefined} onValueChange={setSelectedTaskId} disabled={isRunning}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a task to focus on" />
                </SelectTrigger>
                <SelectContent>
                  {activeTasks.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">No active tasks</div>
                  ) : (
                    activeTasks.map((t: any) => (
                      <SelectItem key={t._id} value={t._id} className="py-3">
                        <div>
                          <div className="font-medium">{t.title}</div>
                          {t.description && <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Set Timer</label>
              <div className="flex gap-4 items-center justify-center">
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={incrementHours}
                    disabled={isRunning}
                    className="w-full mb-2"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div className="text-6xl font-bold tabular-nums w-24 py-4 rounded-lg bg-muted">
                    {String(hours).padStart(2, "0")}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={decrementHours}
                    disabled={isRunning}
                    className="w-full mt-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <div className="text-xs text-muted-foreground mt-2">HOURS</div>
                </div>

                <div className="text-6xl font-bold">:</div>

                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={incrementMinutes}
                    disabled={isRunning}
                    className="w-full mb-2"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div className="text-6xl font-bold tabular-nums w-24 py-4 rounded-lg bg-muted">
                    {String(minutes).padStart(2, "0")}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={decrementMinutes}
                    disabled={isRunning}
                    className="w-full mt-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <div className="text-xs text-muted-foreground mt-2">MINUTES</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-4">
              {[
                { label: "15 min", h: 0, m: 15 },
                { label: "25 min", h: 0, m: 25 },
                { label: "45 min", h: 0, m: 45 },
                { label: "1 hour", h: 1, m: 0 },
                { label: "2 hours", h: 2, m: 0 },
              ].map(preset => (
                <Button 
                  key={preset.label}
                  size="sm" 
                  variant={hours === preset.h && minutes === preset.m ? "default" : "outline"} 
                  onClick={() => !isRunning && (setHours(preset.h), setMinutes(preset.m))}
                  disabled={isRunning}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Button size="lg" onClick={start} className="gap-2 px-12" disabled={!selectedTaskId}>
              <Play className="h-5 w-5" />
              Start Focus Session
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
