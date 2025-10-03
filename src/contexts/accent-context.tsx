"use client"

import { createContext, useContext, useEffect, ReactNode } from "react"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex"

export const ACCENT_COLORS = [
  { name: "Slate", value: "slate", class: "bg-slate-500" },
  { name: "Gray", value: "gray", class: "bg-gray-500" },
  { name: "Zinc", value: "zinc", class: "bg-zinc-500" },
  { name: "Neutral", value: "neutral", class: "bg-neutral-500" },
  { name: "Stone", value: "stone", class: "bg-stone-500" },
  { name: "Red", value: "red", class: "bg-red-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
  { name: "Amber", value: "amber", class: "bg-amber-500" },
  { name: "Yellow", value: "yellow", class: "bg-yellow-500" },
  { name: "Lime", value: "lime", class: "bg-lime-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Emerald", value: "emerald", class: "bg-emerald-500" },
  { name: "Teal", value: "teal", class: "bg-teal-500" },
  { name: "Cyan", value: "cyan", class: "bg-cyan-500" },
  { name: "Sky", value: "sky", class: "bg-sky-500" },
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Indigo", value: "indigo", class: "bg-indigo-500" },
  { name: "Violet", value: "violet", class: "bg-violet-500" },
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Fuchsia", value: "fuchsia", class: "bg-fuchsia-500" },
  { name: "Pink", value: "pink", class: "bg-pink-500" },
  { name: "Rose", value: "rose", class: "bg-rose-500" },
]

interface AccentContextType {
  accentColor: string
  isLoading: boolean
}

const AccentContext = createContext<AccentContextType | undefined>(undefined)

export function AccentProvider({ children }: { children: ReactNode }) {
  const user = useQuery(api.users.getCurrentUserQuery)
  
  // Try to get from localStorage first for instant load
  const getInitialAccent = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accentColor') || 'slate'
    }
    return 'slate'
  }
  
  const accentColor = user?.accentColor || getInitialAccent()
  const isLoading = user === undefined

  // Apply accent color to CSS variables and save to localStorage
  useEffect(() => {
    if (accentColor) {
      document.documentElement.setAttribute("data-accent", accentColor)
      if (typeof window !== 'undefined') {
        localStorage.setItem('accentColor', accentColor)
      }
    }
  }, [accentColor])

  return (
    <AccentContext.Provider value={{ accentColor, isLoading }}>
      {children}
    </AccentContext.Provider>
  )
}

export function useAccent() {
  const context = useContext(AccentContext)
  if (context === undefined) {
    throw new Error("useAccent must be used within an AccentProvider")
  }
  return context
}

