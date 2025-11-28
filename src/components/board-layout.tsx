"use client"

import * as React from "react"
import { FloatingSidebar } from "@/components/floating-sidebar"
import { BoardLogo } from "@/components/board-logo"

interface BoardLayoutProps {
  children: React.ReactNode
  mode?: "personal" | "team"
  showWorkspaceSwitcher?: boolean
}

export function BoardLayout({ children, mode = "team", showWorkspaceSwitcher = true }: BoardLayoutProps) {
  return (
    <div className="relative w-full h-full">
      {/* Logo at top-left */}
      <BoardLogo showWorkspaceSwitcher={showWorkspaceSwitcher} />
      
      {/* Floating sidebar on left */}
      <FloatingSidebar mode={mode} />
      
      {/* Main content */}
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  )
}

