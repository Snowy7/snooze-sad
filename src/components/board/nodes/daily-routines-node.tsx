"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { CheckSquare, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export function DailyRoutinesNode({ data, selected }: NodeProps) {
  const ownerId = useOwnerId()
  const deleteNode = useMutation(api.graphs.deleteNode)
  const templates = useQuery(api.functions.listDailyTaskTemplates, ownerId ? { ownerId } : "skip") || []
  const upsertTemplate = useMutation(api.functions.upsertDailyTaskTemplate)
  const deleteTemplate = useMutation(api.functions.deleteDailyTaskTemplate)
  
  const [newRoutine, setNewRoutine] = React.useState("")
  const [completedToday, setCompletedToday] = React.useState<Set<string>>(new Set())

  // Load completed routines from localStorage for today
  React.useEffect(() => {
    if (!ownerId) return
    const today = new Date().toDateString()
    const saved = localStorage.getItem(`routines-${ownerId}-${today}`)
    if (saved) {
      setCompletedToday(new Set(JSON.parse(saved)))
    }
  }, [ownerId])

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const addRoutine = async () => {
    if (!newRoutine.trim() || !ownerId) return
    await upsertTemplate({
      ownerId,
      title: newRoutine,
      isActive: true,
    })
    setNewRoutine("")
  }

  const toggleRoutine = async (templateId: string, newActiveState: boolean) => {
    const template = templates.find(t => t._id === templateId)
    if (!template || !ownerId) return

    await upsertTemplate({
      id: template._id,
      ownerId,
      title: template.title,
      isActive: newActiveState,
    })
  }

  const toggleCompleted = (templateId: string) => {
    const newCompleted = new Set(completedToday)
    if (newCompleted.has(templateId)) {
      newCompleted.delete(templateId)
    } else {
      newCompleted.add(templateId)
    }
    setCompletedToday(newCompleted)
    
    // Save to localStorage
    if (ownerId) {
      const today = new Date().toDateString()
      localStorage.setItem(`routines-${ownerId}-${today}`, JSON.stringify([...newCompleted]))
    }
  }

  const removeRoutine = async (templateId: string) => {
    await deleteTemplate({ id: templateId as any })
  }

  const activeTemplates = templates.filter(t => t.isActive)
  const completedCount = activeTemplates.filter(t => completedToday.has(t._id)).length
  const progress = activeTemplates.length > 0 ? (completedCount / activeTemplates.length) * 100 : 0

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
        minHeight={260}
        maxWidth={450}
        maxHeight={600}
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
            <CheckSquare className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm flex-1">Daily Routines</h3>

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
                <AlertDialogTitle>Delete routines tracker?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this routines widget. Your routine templates will be preserved.
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

        {/* Progress */}
        {activeTemplates.length > 0 && (
          <div className="mb-3 flex-shrink-0">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{completedCount} of {activeTemplates.length} complete</span>
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

        {/* Active Routines list */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-3">
          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Active Routines
          </div>
          {activeTemplates.map((template) => (
            <div
              key={template._id}
              className="flex items-center gap-2 p-2 rounded-lg border-2 transition-colors group/item"
              style={{
                backgroundColor: completedToday.has(template._id) ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--card))',
                borderColor: completedToday.has(template._id) ? 'hsl(var(--primary))' : 'hsl(var(--border))',
              }}
            >
              <button
                onClick={() => toggleCompleted(template._id)}
                className="flex-1 text-left text-sm font-medium"
              >
                <span className={cn(
                  "transition-all",
                  completedToday.has(template._id) && "line-through text-muted-foreground"
                )}>
                  {template.title}
                </span>
              </button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleRoutine(template._id, false)
                }}
                title="Disable routine"
              >
                <CheckSquare className="h-3 w-3 text-muted-foreground" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete routine?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{template.title}" from your routines.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeRoutine(template._id)} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
          
          {activeTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center text-muted-foreground text-sm py-4">
              <CheckSquare className="h-6 w-6 mb-2 opacity-50" />
              <p className="text-xs">No active routines</p>
            </div>
          )}

          {/* Disabled Routines Section */}
          {templates.filter(t => !t.isActive).length > 0 && (
            <>
              <div className="text-xs font-semibold text-muted-foreground mb-2 mt-4 uppercase tracking-wide">
                Disabled Routines
              </div>
              {templates.filter(t => !t.isActive).map((template) => (
                <div
                  key={template._id}
                  className="flex items-center gap-2 p-2 rounded-lg border-2 border-dashed border-border opacity-60 hover:opacity-100 transition-all group/item"
                >
                  <span className="flex-1 text-sm text-muted-foreground line-through">
                    {template.title}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleRoutine(template._id, true)
                    }}
                    title="Re-enable routine"
                  >
                    <CheckSquare className="h-3 w-3 text-primary" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete routine?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{template.title}" from your routines.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeRoutine(template._id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Add new routine */}
        <div className="flex gap-2 flex-shrink-0">
          <Input
            value={newRoutine}
            onChange={(e) => setNewRoutine(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Enter") addRoutine()
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Add routine..."
            className="text-sm h-8"
          />
          <Button size="sm" onClick={addRoutine} className="h-8 w-8 p-0 flex-shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Motivation message */}
        {completedCount === activeTemplates.length && activeTemplates.length > 0 && (
          <div className="mt-3 p-2 rounded-lg bg-primary/10 border border-primary/20 text-center flex-shrink-0">
            <p className="text-xs font-semibold text-primary">
              🎉 All routines completed! Excellent work!
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

