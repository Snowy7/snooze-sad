"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppTopbar } from "@/components/app-topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { WorkspaceProvider } from "@/contexts/workspace-context"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { SpotlightOnboarding } from "@/components/spotlight-onboarding"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { signOut } from "@/lib/workos/auth"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [syncing, setSyncing] = React.useState(false)
  const [syncAttempted, setSyncAttempted] = React.useState(false)
  const [userReady, setUserReady] = React.useState(() => {
    // For returning users, check if they've authenticated before
    if (typeof window !== 'undefined') {
      return localStorage.getItem('snooze_authenticated') === 'true'
    }
    return false
  })
  
  // Check if user exists in Convex database
  const dbUser = useQuery(api.users.getCurrentUserQuery)
  const syncCurrentUser = useMutation(api.users.syncCurrentUser)

  // Redirect to auth if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth")
    }
  }, [user, loading, router])

  // If user exists in WorkOS but not in database, try to sync them ONCE
  React.useEffect(() => {
    if (!loading && user && dbUser === null && !syncing && !syncAttempted) {
      setSyncing(true)
      setSyncAttempted(true)
      
      syncCurrentUser({
        workosUser: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          profilePictureUrl: user.profilePictureUrl || "",
          emailVerified: user.emailVerified || false,
        }
      })
        .then(() => {
          setSyncing(false)
          // Give a delay for the database to propagate the change
          setTimeout(() => {
            setUserReady(true)
            // Mark user as authenticated for faster future loads
            if (typeof window !== 'undefined') {
              localStorage.setItem('snooze_authenticated', 'true')
            }
          }, 300)
        })
        .catch((error) => {
          console.error("Failed to sync user:", error)
          setSyncing(false)
          // If sync fails, sign out
          signOut().then(() => {
            router.replace("/auth")
          })
        })
    } else if (!loading && user && dbUser !== null && dbUser !== undefined) {
      // User already exists in database
      setUserReady(true)
      // Mark user as authenticated for faster future loads
      if (typeof window !== 'undefined') {
        localStorage.setItem('snooze_authenticated', 'true')
      }
    }
  }, [user, loading, dbUser, syncing, syncAttempted, syncCurrentUser, router, userReady])
  
  // Show loading while checking auth, syncing, or not ready
  if (loading || syncing || !userReady) {
    const message = syncing 
      ? "Setting up your account..." 
      : loading 
      ? "Loading..." 
      : "Checking authentication...";
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md p-6 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 animate-pulse" />
          </div>
          <h2 className="text-2xl font-semibold">{message}</h2>
          <p className="text-sm text-muted-foreground">
            {syncing ? "This will only take a moment" : "Please wait"}
          </p>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Don't render if no user
  if (!user) {
    return null
  }

  return (
    <WorkspaceProvider>
      <WorkspaceCheckAndRender>
        {children}
      </WorkspaceCheckAndRender>
    </WorkspaceProvider>
  )
}

// Component that checks workspaces and renders the full layout or redirects
function WorkspaceCheckAndRender({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const workspaces = useQuery(api.workspaces.listMyWorkspaces)
  const dbUser = useQuery(api.users.getCurrentUserQuery)
  
  // Get current pathname synchronously
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  
  // NO AUTO-REDIRECT - Onboarding will handle workspace creation
  
  // Show loading while checking workspaces (but not if we're already on /workspaces/new)
  if (workspaces === undefined && currentPath !== '/workspaces/new') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md p-6 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 animate-pulse" />
          </div>
          <h2 className="text-2xl font-semibold">Loading workspace...</h2>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>
      </div>
    )
  }
  
  // Render full layout (don't show loading screen during redirect)
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <div className="">{children}</div>
      </SidebarInset>
      <SpotlightOnboarding />
    </SidebarProvider>
  )
}



