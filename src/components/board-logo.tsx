"use client"

import * as React from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { motion } from "framer-motion"
import { useWorkspace } from "@/contexts/workspace-context"
import { usePathname } from "next/navigation"

interface BoardLogoProps {
  showWorkspaceSwitcher?: boolean
}

export function BoardLogo({ showWorkspaceSwitcher = true }: BoardLogoProps) {
  const { currentWorkspace } = useWorkspace()
  const pathname = usePathname()
  const isInWorkspace = pathname.includes("/workspaces/")

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed top-6 left-6 z-50"
    >
      {/* Logo with Name */}
      <Link href="/dashboard" className="flex flex-col gap-1 group">
        <div className="flex items-center gap-2.5">
          <Logo className="h-12 w-12 text-primary transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold tracking-tight text-foreground">Snooze</span>
        </div>
        
        {/* Workspace Name */}
        {isInWorkspace && currentWorkspace && (
          <div className="ml-14">
            <span className="text-sm font-medium text-muted-foreground">
              {currentWorkspace.name}
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  )
}

