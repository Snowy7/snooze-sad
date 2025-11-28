"use client"

import * as React from "react"
import { User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useRouter, usePathname } from "next/navigation"
import { useWorkspace } from "@/contexts/workspace-context"

interface ModeToggleProps {
  mode: "personal" | "team"
  onModeChange: (mode: "personal" | "team") => void
  className?: string
}

export function ModeToggle({ mode, onModeChange, className }: ModeToggleProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { workspaces } = useWorkspace()

  const handleModeChange = (newMode: "personal" | "team") => {
    onModeChange(newMode)
    
    // If switching to team mode and no workspaces exist, redirect to create workspace
    if (newMode === "team" && workspaces.length === 0) {
      router.push("/workspaces/new")
      return
    }
    
    // If we're on a personal-only page and switching to team, go to dashboard
    if (newMode === "team" && (pathname.startsWith("/daily") || pathname.startsWith("/personal"))) {
      router.push("/dashboard")
    }
  }

  return (
    <div className={cn("fixed top-4 left-1/2 -translate-x-1/2 z-50", className)}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-strong border-2 border-primary/20 rounded-xl shadow-lg p-1.5 flex gap-1"
      >
        <Button
          variant={mode === "personal" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleModeChange("personal")}
          className={cn(
            "gap-2 h-9 px-4 transition-all",
            mode === "personal" && "shadow-sm"
          )}
        >
          <User className="h-4 w-4" />
          Personal
        </Button>
        <Button
          variant={mode === "team" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleModeChange("team")}
          className={cn(
            "gap-2 h-9 px-4 transition-all",
            mode === "team" && "shadow-sm"
          )}
        >
          <Users className="h-4 w-4" />
          Team
        </Button>
      </motion.div>
    </div>
  )
}
