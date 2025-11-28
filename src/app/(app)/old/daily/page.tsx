"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export default function DailyPage() {
  const router = useRouter()
  
  React.useEffect(() => {
    router.replace("/personal/daily")
  }, [router])

  return null
}
