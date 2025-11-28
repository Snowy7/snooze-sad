"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Timer, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation } from "convex/react"
import { api } from "@/lib/convex"
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

export function DailyFocusNode({ data, selected }: NodeProps) {
  const deleteNode = useMutation(api.graphs.deleteNode)
  
  const [isRunning, setIsRunning] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(25 * 60) // 25 minutes in seconds
  const [sessions, setSessions] = React.useState(0)

  React.useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false)
          setSessions(s => s + 1)
          return 25 * 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const toggleTimer = () => setIsRunning(!isRunning)
  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(25 * 60)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const handleWheel = (e: React.WheelEvent) => e.stopPropagation()
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === "BUTTON" || target.closest("button")) {
      e.stopPropagation()
    }
  }

  return (
    <div className="w-full h-full group" onWheel={handleWheel} onMouseDown={handleMouseDown}>
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={250}
        minHeight={220}
        maxWidth={400}
        maxHeight={350}
      />
      
      <Card
        className={cn(
          "p-6 w-full h-full transition-all overflow-hidden flex flex-col items-center justify-center",
          "border-2",
          selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border hover:border-primary/50"
        )}
      >
        {/* Delete button */}
        <div className="absolute top-2 right-2">
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
                <AlertDialogTitle>Delete focus timer?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this timer. This action cannot be undone.
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

        {/* Timer icon */}
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <Timer className="h-6 w-6 text-primary" />
        </div>

        {/* Timer display */}
        <div className="text-6xl font-bold text-primary mb-6 tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            size="lg"
            onClick={toggleTimer}
            className="rounded-full h-12 w-12 p-0"
          >
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={resetTimer}
            className="rounded-full h-12 w-12 p-0"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Sessions completed */}
        <div className="text-sm text-muted-foreground">
          {sessions} {sessions === 1 ? 'session' : 'sessions'} completed
        </div>
      </Card>
    </div>
  )
}

