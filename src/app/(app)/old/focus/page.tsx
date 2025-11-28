"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export default function FocusPage() {
  const router = useRouter()
  
  React.useEffect(() => {
    router.replace("/personal/focus")
  }, [router])

  return null
}
