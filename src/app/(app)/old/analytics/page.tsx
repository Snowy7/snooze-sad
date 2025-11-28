"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export default function AnalyticsPage() {
  const router = useRouter()
  
  React.useEffect(() => {
    router.replace("/personal/analytics")
  }, [router])

  return null
}
