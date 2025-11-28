"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export default function PersonalNotesRedirect() {
  const router = useRouter()
  
  React.useEffect(() => {
    router.replace("/personal/docs")
  }, [router])
  
  return null
}
