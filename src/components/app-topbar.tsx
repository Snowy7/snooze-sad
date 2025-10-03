"use client"

import * as React from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandMenu } from "@/components/command-menu"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { usePathname } from "next/navigation"

export function AppTopbar() {
  const pathname = usePathname()
  const pageName = pathname.split("/").filter(Boolean).pop() || "dashboard"
  const title = pageName.charAt(0).toUpperCase() + pageName.slice(1)
  
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger />
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex-1 flex justify-center max-w-md mx-auto" data-onboarding="search">
        <CommandMenu />
      </div>
      <div className="flex items-center gap-2">
        <NotificationsDropdown />
        <ModeToggle />
      </div>
    </header>
  )
}
