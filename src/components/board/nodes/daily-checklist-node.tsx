"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X, ListChecks, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
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
import { useOwnerId } from "@/hooks/use-owner"

export function DailyChecklistNode({ data, selected }: NodeProps) {
  const ownerId = useOwnerId()
  const today = new Date().toISOString().split("T")[0]
  
  const deleteNode = useMutation(api.graphs.deleteNode)
  const templates = useQuery(api.functions.listDailyTaskTemplates, ownerId ? { ownerId } : "skip") || []
  const checklistItems = useQuery(
    api.dailyChecklist.getDailyChecklistItems,
    ownerId ? { ownerId, date: today } : "skip"
  ) || []
  
  const createChecklistItem = useMutation(api.dailyChecklist.createDailyChecklistItem)
  const updateChecklistItem = useMutation(api.dailyChecklist.updateDailyChecklistItem)
  const deleteChecklistItem = useMutation(api.dailyChecklist.deleteDailyChecklistItem)
  
  const [newItemText, setNewItemText] = React.useState("")
  const [showRoutines, setShowRoutines] = React.useState(true)
  const [routineCheckStates, setRoutineCheckStates] = React.useState<Map<string, boolean>>(new Map())

  // Load routine completion states from localStorage
  React.useEffect(() => {
    if (!ownerId) return
    const today = new Date().toDateString()
    const saved = localStorage.getItem(`routines-${ownerId}-${today}`)
    if (saved) {
      const completed = JSON.parse(saved) as string[]
      setRoutineCheckStates(new Map(completed.map(id => [id, true])))
    }
  }, [ownerId])

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const addItem = async () => {
    if (!newItemText.trim() || !ownerId) return
    await createChecklistItem({
      ownerId,
      text: newItemText,
      date: today,
    })
    setNewItemText("")
  }

  const toggleItem = (id: string, isRoutine: boolean, currentChecked: boolean) => {
    if (isRoutine) {
      // Toggle routine completion and save to localStorage
      const newStates = new Map(routineCheckStates)
      newStates.set(id, !newStates.get(id))
      setRoutineCheckStates(newStates)
      
      if (ownerId) {
        const todayStr = new Date().toDateString()
        const completed = Array.from(newStates.entries())
          .filter(([_, checked]) => checked)
          .map(([itemId]) => itemId)
        localStorage.setItem(`routines-${ownerId}-${todayStr}`, JSON.stringify(completed))
      }
    } else {
      // Toggle checklist item in database
      updateChecklistItem({
        itemId: id as any,
        checked: !currentChecked,
      })
    }
  }

  const removeItem = async (id: string) => {
    await deleteChecklistItem({ itemId: id as any })
  }

  // Combine routines and checklist items
  const activeRoutines = templates.filter(t => t.isActive)
  const routineItems = activeRoutines.map(t => ({
    _id: t._id,
    title: t.title,
    status: routineCheckStates.get(t._id) ? "done" : "backlog",
    isRoutine: true,
  }))

  const allItems = showRoutines 
    ? [...routineItems, ...checklistItems]
    : checklistItems

  const completedCount = allItems.filter(item => item.status === "done").length
  const progress = allItems.length > 0 ? (completedCount / allItems.length) * 100 : 0

  const handleWheel = (e: React.WheelEvent) => e.stopPropagation()
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === "INPUT" || target.tagName === "BUTTON" || target.closest("button")) {
      e.stopPropagation()
    }
  }

  return (
    <div className="w-full h-full group" onWheel={handleWheel} onMouseDown={handleMouseDown}>
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={300}
        minHeight={300}
        maxWidth={500}
        maxHeight={700}
      />
      
      <Card
        className={cn(
          "p-4 w-full h-full transition-all overflow-hidden flex flex-col",
          "border-2",
          selected ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border hover:border-primary/50"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ListChecks className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm flex-1">Today's Tasks</h3>

          {/* Toggle routines visibility */}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setShowRoutines(!showRoutines)}
            title={showRoutines ? "Hide routines" : "Show routines"}
          >
            {showRoutines ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>

          {/* Delete button */}
          <AlertDialog>
            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete checklist?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this checklist. This action cannot be undone.
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

        {/* Progress bar */}
        {allItems.length > 0 && (
          <div className="mb-3 flex-shrink-0">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>
                {completedCount} of {allItems.length}
                {showRoutines && routineItems.length > 0 && (
                  <span className="ml-1 text-primary">({routineItems.length} routines)</span>
                )}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items list */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-3">
          {allItems.map((item) => {
            const isRoutine = "isRoutine" in item && item.isRoutine
            const isChecked = item.status === "done"
            return (
              <div
                key={item._id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg transition-colors group/item",
                  isRoutine ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
                )}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleItem(item._id, isRoutine, isChecked)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0"
                />
                <span className={cn(
                  "flex-1 text-sm",
                  isChecked && "line-through text-muted-foreground",
                  isRoutine && "font-medium text-primary"
                )}>
                  {item.title}
                  {isRoutine && <span className="ml-1 text-xs opacity-60">(routine)</span>}
                </span>
                {!isRoutine && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0"
                    onClick={() => removeItem(item._id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )
          })}
          
          {allItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
              <ListChecks className="h-8 w-8 mb-2 opacity-50" />
              <p>{showRoutines ? "No tasks or routines" : "No tasks yet"}</p>
              <p className="text-xs mt-1">
                {showRoutines ? "Add routines or tasks below" : "Add a task below"}
              </p>
            </div>
          )}
        </div>

        {/* Add new item */}
        <div className="flex gap-2 flex-shrink-0">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Enter") addItem()
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Add one-time task..."
            className="text-sm h-8"
          />
          <Button size="sm" onClick={addItem} className="h-8 w-8 p-0 flex-shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Completion message */}
        {completedCount === allItems.length && allItems.length > 0 && (
          <div className="mt-3 p-2 rounded-lg bg-primary/10 border border-primary/20 text-center flex-shrink-0">
            <p className="text-xs font-semibold text-primary">
              🎉 All tasks completed! Amazing work!
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
