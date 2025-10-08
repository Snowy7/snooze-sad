"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Square, Timer, X, ChevronUp, ChevronDown, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { useOwnerId } from "@/hooks/use-owner"

export default function FocusPage() {
  const ownerId = useOwnerId()
  const activeTasks = useQuery(api.functions.allActiveTasks, { ownerId }) || []
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [customFocusName, setCustomFocusName] = useState("")
  const [useCustomName, setUseCustomName] = useState(false)
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
  const focusTitle = useCustomName ? customFocusName : selectedTask?.title || "Focus Session"
  const focusDescription = useCustomName ? "" : selectedTask?.description

  useEffect(() => {
    if (isRunning && seconds === 0) {
      setTotalSeconds(hours * 3600 + minutes * 60)
      setSeconds(hours * 3600 + minutes * 60)
    }
  }, [isRunning, hours, minutes])

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
    if (!useCustomName && !selectedTaskId) {
      toast.error("Please select a task or enter a custom focus name")
      return
    }
    if (useCustomName && !customFocusName.trim()) {
      toast.error("Please enter a focus session name")
      return
    }
    const totalTime = hours * 3600 + minutes * 60
    if (totalTime === 0) {
      toast.error("Please set a time greater than 0")
      return
    }
    if (!sessionId && selectedTaskId) {
      const id = await startTimelog({ taskId: selectedTaskId, userId: ownerId, start: new Date().toISOString() })
      setSessionId(id)
    }
    setIsRunning(true)
    setIsFocusMode(true)
    if (seconds === 0) {
      setTotalSeconds(totalTime)
      setSeconds(totalTime)
    }
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
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6 animate-in fade-in duration-500">
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-6 right-6 gap-2 hover:bg-accent"
          onClick={() => setIsFocusMode(false)}
        >
          <X className="h-4 w-4" />
          Exit Focus
        </Button>

        <div className="max-w-3xl w-full space-y-10 text-center">
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex h-16 w-16 rounded-2xl bg-primary/10 items-center justify-center mx-auto ring-1 ring-primary/20">
              <Timer className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{focusTitle}</h1>
              {focusDescription && (
                <p className="text-muted-foreground max-w-xl mx-auto line-clamp-2">{focusDescription}</p>
              )}
            </div>
          </div>

          {/* Timer Display */}
          <div className="space-y-6">
            <div className="text-[8rem] font-bold tabular-nums tracking-tight leading-none">
              {String(displayHours).padStart(2, "0")}:
              {String(displayMinutes).padStart(2, "0")}:
              {String(displaySeconds).padStart(2, "0")}
            </div>
            
            {/* Progress Bar */}
            <div className="max-w-lg mx-auto space-y-3">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
                <span className="text-muted-foreground">
                  {Math.floor((totalSeconds - seconds) / 60)}m / {Math.floor(totalSeconds / 60)}m
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button size="lg" onClick={() => setIsRunning(true)} className="gap-2 px-8 h-12">
                <Play className="h-5 w-5" />
                Resume
              </Button>
            ) : (
              <>
                <Button size="lg" variant="outline" onClick={pause} className="gap-2 px-8 h-12">
                  <Pause className="h-5 w-5" />
                  Pause
                </Button>
                <Button size="lg" variant="destructive" onClick={stop} className="gap-2 px-8 h-12">
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
    <div className="flex items-center justify-center min-h-full p-6 animate-in fade-in duration-500">
      <Card className="p-8 max-w-2xl w-full">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-primary/10 items-center justify-center mx-auto mb-2 ring-1 ring-primary/20">
              <Timer className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Focus Mode</h1>
            <p className="text-sm text-muted-foreground">Deep work starts with intention</p>
          </div>

          <div className="space-y-6">
            {/* Focus Target Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">What are you focusing on?</label>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setUseCustomName(!useCustomName)
                    if (!useCustomName) {
                      setSelectedTaskId(null)
                    } else {
                      setCustomFocusName("")
                    }
                  }}
                  disabled={isRunning}
                  type="button"
                  className="h-8 text-xs"
                >
                  {useCustomName ? "Select Task" : "Custom Name"}
                </Button>
              </div>
              
              {useCustomName ? (
                <Input
                  placeholder="e.g., Deep work on project proposal"
                  value={customFocusName}
                  onChange={(e) => setCustomFocusName(e.target.value)}
                  disabled={isRunning}
                  className="w-full"
                />
              ) : (
                <Select value={selectedTaskId || undefined} onValueChange={setSelectedTaskId} disabled={isRunning}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a task from your list" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTasks.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        No active tasks found
                      </div>
                    ) : (
                      activeTasks.map((t: any) => (
                        <SelectItem key={t._id} value={t._id} className="py-2.5">
                          <div>
                            <div className="font-medium">{t.title}</div>
                            {t.description && (
                              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {t.description}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Timer Setup */}
            <div className="space-y-4">
              <label className="text-sm font-semibold block">Set your timer</label>
              
              {/* Time Input Controls */}
              <div className="flex gap-4 items-center justify-center py-4">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={incrementHours}
                    disabled={isRunning}
                    className="h-10 w-10 rounded-lg hover:bg-accent"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                  <div className="my-2 flex flex-col items-center">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={hours}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        setHours(Math.min(Math.max(val, 0), 23))
                      }}
                      disabled={isRunning}
                      className="w-24 h-24 text-5xl font-bold tabular-nums text-center bg-muted rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition-colors disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wider">Hours</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={decrementHours}
                    disabled={isRunning}
                    className="h-10 w-10 rounded-lg hover:bg-accent"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </div>

                <div className="text-5xl font-bold text-muted-foreground mb-6">:</div>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={incrementMinutes}
                    disabled={isRunning}
                    className="h-10 w-10 rounded-lg hover:bg-accent"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                  <div className="my-2 flex flex-col items-center">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        setMinutes(Math.min(Math.max(val, 0), 59))
                      }}
                      disabled={isRunning}
                      className="w-24 h-24 text-5xl font-bold tabular-nums text-center bg-muted rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition-colors disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wider">Minutes</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={decrementMinutes}
                    disabled={isRunning}
                    className="h-10 w-10 rounded-lg hover:bg-accent"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap justify-center gap-2">
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
                    className="h-8 px-4 text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex justify-center pt-2">
            <Button 
              size="lg" 
              onClick={start} 
              className="gap-2 px-10 h-12 shadow-lg shadow-primary/20" 
              disabled={!useCustomName && !selectedTaskId}
            >
              <Play className="h-5 w-5" />
              Start Focus Session
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}