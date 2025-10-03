"use client"

import { useAuth } from "@workos-inc/authkit-nextjs/components"

export function useOwnerId() {
  const { user } = useAuth()
  return user?.id || "me"
}


