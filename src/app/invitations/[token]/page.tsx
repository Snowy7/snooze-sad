"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { toast } from "sonner"
import { Building2, Check, X, AlertCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const token = params.token as string

  const invitation = useQuery(api.invitations.getInvitationByToken, { token })
  const acceptInvitation = useMutation(api.invitations.acceptInvitation)
  const declineInvitation = useMutation(api.invitations.declineInvitation)

  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

  const handleAccept = async () => {
    if (!user) {
      // Redirect to auth with return URL
      router.push(`/auth?redirect=/invitations/${token}`)
      return
    }

    setIsAccepting(true)
    try {
      const workspaceId = await acceptInvitation({ token })
      toast.success("Invitation accepted! Welcome to the workspace")
      router.push(`/dashboard`)
    } catch (error: any) {
      toast.error(error.message || "Failed to accept invitation")
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    setIsDeclining(true)
    try {
      await declineInvitation({ token })
      toast.success("Invitation declined")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Failed to decline invitation")
      setIsDeclining(false)
    }
  }

  if (authLoading || invitation === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 space-y-6">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 space-y-6 text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Invitation Not Found</h1>
            <p className="text-muted-foreground">
              This invitation link is invalid or has been removed.
            </p>
          </div>
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (invitation.expired || invitation.expiresAt < Date.now()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 space-y-6 text-center">
          <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto">
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Invitation Expired</h1>
            <p className="text-muted-foreground">
              This invitation has expired. Please contact the workspace owner for a new invitation.
            </p>
          </div>
          <Link href="/dashboard">
            <Button className="w-full" variant="outline">
              Go to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (invitation.status !== "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 space-y-6 text-center">
          <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Invitation {invitation.status}</h1>
            <p className="text-muted-foreground">
              This invitation has already been {invitation.status}.
            </p>
          </div>
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Workspace Icon */}
        <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
          <Building2 className="h-8 w-8 text-blue-500" />
        </div>

        {/* Title */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">You've Been Invited!</h1>
          <p className="text-muted-foreground">
            You've been invited to join a workspace on Snooze
          </p>
        </div>

        {/* Invitation Details */}
        <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Workspace</p>
              <p className="font-semibold">{(invitation as any).workspace?.name || "Unknown"}</p>
            </div>
            <Badge>{invitation.role}</Badge>
          </div>
          {(invitation as any).workspace?.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{(invitation as any).workspace.description}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Your Email</p>
            <p className="text-sm font-medium">{invitation.email}</p>
          </div>
          <div className="text-xs text-muted-foreground">
            Expires {formatDistanceToNow(invitation.expiresAt, { addSuffix: true })}
          </div>
        </div>

        {/* Auth Status */}
        {!user && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
            <p className="text-blue-900 dark:text-blue-100">
              You'll need to sign in or create an account to accept this invitation.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleDecline}
            variant="outline"
            className="flex-1"
            disabled={isDeclining || isAccepting}
          >
            {isDeclining ? (
              <>
                <X className="h-4 w-4 mr-2 animate-spin" />
                Declining...
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Decline
              </>
            )}
          </Button>
          <Button
            onClick={handleAccept}
            className="flex-1"
            disabled={isDeclining || isAccepting}
          >
            {isAccepting ? (
              <>
                <Check className="h-4 w-4 mr-2 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {user ? "Accept Invitation" : "Sign In & Accept"}
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  )
}

