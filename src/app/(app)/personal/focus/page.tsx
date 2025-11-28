"use client"

import * as React from "react"
import { BoardLogo } from "@/components/board-logo"
import { FloatingSidebar } from "@/components/floating-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function PersonalFocusPage() {
  const router = useRouter()
  const [mode, setMode] = React.useState<"personal" | "team">("personal")

  const handleModeChange = (newMode: "personal" | "team") => {
    setMode(newMode)
    if (newMode === "team") {
      router.push("/dashboard")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full h-full"
    >
      <BoardLogo showWorkspaceSwitcher={false} />
      <FloatingSidebar mode="personal" />
      <ModeToggle mode={mode} onModeChange={handleModeChange} />
      
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-2xl font-bold">Focus Mode</h2>
          <p className="text-muted-foreground">
            Your focus mode is coming soon! Use the Daily Focus timer on your Daily page for now.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

