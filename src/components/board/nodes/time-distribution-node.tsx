"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { PieChart, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Button } from "@/components/ui/button"
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

export function TimeDistributionNode({ data, selected }: NodeProps) {
  const deleteNode = useMutation(api.graphs.deleteNode)

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleWheel = (e: React.WheelEvent) => e.stopPropagation()

  // Mock time distribution data
  const timeData = [
    { label: "Development", hours: 28, color: "hsl(var(--primary))" },
    { label: "Meetings", hours: 8, color: "hsl(220 70% 50%)" },
    { label: "Planning", hours: 6, color: "hsl(150 70% 50%)" },
    { label: "Reviews", hours: 4, color: "hsl(30 70% 50%)" },
    { label: "Other", hours: 2, color: "hsl(280 70% 50%)" },
  ]

  const totalHours = timeData.reduce((sum, item) => sum + item.hours, 0)

  return (
    <div className="w-full h-full group" onWheel={handleWheel}>
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={300}
        minHeight={280}
        maxWidth={450}
        maxHeight={500}
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
            <PieChart className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm flex-1">Time Distribution</h3>

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
                <AlertDialogTitle>Delete time distribution?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this widget.
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

        {/* Data visualization */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalHours}h</div>
            <div className="text-xs text-muted-foreground">Total this week</div>
          </div>

          <div className="space-y-2">
            {timeData.map((item, i) => {
              const percentage = (item.hours / totalHours) * 100
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.hours}h ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}

