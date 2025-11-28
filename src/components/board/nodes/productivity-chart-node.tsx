"use client"

import * as React from "react"
import { NodeProps, NodeResizer } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { TrendingUp, X } from "lucide-react"
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

export function ProductivityChartNode({ data, selected }: NodeProps) {
  const deleteNode = useMutation(api.graphs.deleteNode)

  const handleDelete = async () => {
    if (data.nodeId) {
      await deleteNode({ nodeId: data.nodeId as any })
    }
  }

  const handleWheel = (e: React.WheelEvent) => e.stopPropagation()

  // Mock productivity data
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const productivityScores = [85, 92, 78, 88, 95, 70, 65]
  const maxScore = Math.max(...productivityScores)

  return (
    <div className="w-full h-full group" onWheel={handleWheel}>
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={350}
        minHeight={250}
        maxWidth={700}
        maxHeight={450}
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
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm flex-1">Weekly Productivity</h3>

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
                <AlertDialogTitle>Delete chart?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this productivity chart.
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

        {/* Chart */}
        <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-6">
          {productivityScores.map((score, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative">
                <div
                  className="w-full bg-gradient-to-t from-primary to-primary/70 rounded-t-lg transition-all"
                  style={{
                    height: `${(score / maxScore) * 140}px`,
                    minHeight: "20px"
                  }}
                />
                <div className="absolute -top-5 left-0 right-0 text-center text-xs font-medium text-primary">
                  {score}%
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{days[i]}</div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Avg:</span>
            <span className="ml-1 font-semibold">{Math.round(productivityScores.reduce((a, b) => a + b) / productivityScores.length)}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Best:</span>
            <span className="ml-1 font-semibold text-green-500">{maxScore}%</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

