"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export default function NotesPage() {
  const router = useRouter()
  
  React.useEffect(() => {
    router.replace("/personal/notes")
  }, [router])

  return null
}
