"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface KeyboardShortcutProps {
  keys: string[]
  description: string
  className?: string
}

export function KeyboardShortcut({ keys, description, className }: KeyboardShortcutProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <span className="text-sm text-muted-foreground flex-1">{description}</span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded shadow-sm min-w-[24px] text-center">
              {key}
            </kbd>
            {index < keys.length - 1 && (
              <span className="text-xs text-muted-foreground">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

