"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Trash2, UserPlus, X, Mail, Clock } from "lucide-react"
import { Id } from "../../../../../../convex/_generated/dataModel"
import { formatDistanceToNow } from "date-fns"

export default function WorkspaceSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as Id<"workspaces">

  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId })
  const members = useQuery(api.workspaces.listMembers, { workspaceId })
  const invitations = useQuery(api.invitations.listInvitations, { workspaceId })

  const updateWorkspace = useMutation(api.workspaces.updateWorkspace)
  const deleteWorkspace = useMutation(api.workspaces.deleteWorkspace)
  const removeMember = useMutation(api.workspaces.removeMember)
  const updateMemberRole = useMutation(api.workspaces.updateMemberRole)
  const createInvitation = useMutation(api.invitations.createInvitation)
  const cancelInvitation = useMutation(api.invitations.cancelInvitation)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Invitation form
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [isInviting, setIsInviting] = useState(false)

  // Initialize form when workspace loads
  useState(() => {
    if (workspace && !isEditing) {
      setName(workspace.name)
      setDescription(workspace.description || "")
    }
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateWorkspace({
        workspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
      })
      setIsEditing(false)
      toast.success("Workspace updated successfully")
    } catch (error) {
      toast.error("Failed to update workspace")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteWorkspace({ workspaceId })
      toast.success("Workspace deleted")
      router.push("/dashboard")
    } catch (error) {
      toast.error("Failed to delete workspace")
      setIsDeleting(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email is required")
      return
    }

    setIsInviting(true)
    try {
      await createInvitation({
        workspaceId,
        email: inviteEmail.trim(),
        role: inviteRole,
      })
      setInviteEmail("")
      setInviteRole("member")
      toast.success("Invitation sent!")
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitation")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember({ workspaceId, userId })
      toast.success("Member removed")
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member")
    }
  }

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await updateMemberRole({ workspaceId, userId, role })
      toast.success("Role updated")
    } catch (error: any) {
      toast.error(error.message || "Failed to update role")
    }
  }

  const handleCancelInvite = async (invitationId: Id<"invitations">) => {
    try {
      await cancelInvitation({ invitationId })
      toast.success("Invitation cancelled")
    } catch (error) {
      toast.error("Failed to cancel invitation")
    }
  }

  if (!workspace) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const isOwner = workspace.role === "owner"
  const canManageMembers = workspace.role === "owner" || workspace.role === "admin"

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workspace Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your workspace settings and members
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          {isOwner && <TabsTrigger value="danger">Danger Zone</TabsTrigger>}
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">General Settings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setIsEditing(true)
                    }}
                    disabled={!canManageMembers || isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      setIsEditing(true)
                    }}
                    disabled={!canManageMembers || isSaving}
                    rows={3}
                  />
                </div>
                {canManageMembers && isEditing && (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setName(workspace.name)
                        setDescription(workspace.description || "")
                        setIsEditing(false)
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Members */}
        <TabsContent value="members">
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Members</h2>

              {/* Invite Form */}
              {canManageMembers && (
                <div className="mb-6 p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    <h3 className="font-medium">Invite Member</h3>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="email@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={isInviting}
                      type="email"
                    />
                    <Select value={inviteRole} onValueChange={setInviteRole} disabled={isInviting}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleInvite} disabled={isInviting}>
                      {isInviting ? "Sending..." : "Invite"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Members Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members?.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {member.user?.fullName || member.user?.email || "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.user?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canManageMembers && member.role !== "owner" ? (
                          <Select
                            value={member.role}
                            onValueChange={(role) => handleUpdateRole(member.userId, role)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                            {member.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(member.joinedAt, { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {canManageMembers && member.role !== "owner" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Member?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove {member.user?.email} from the workspace.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(member.userId)}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Invitations */}
        <TabsContent value="invitations">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
            {!invitations || invitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pending invitations</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invite) => (
                    <TableRow key={invite._id}>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invite.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invite.status === "pending"
                              ? "secondary"
                              : invite.status === "accepted"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {invite.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(invite.expiresAt, { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {invite.status === "pending" && canManageMembers && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancelInvite(invite._id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* Danger Zone */}
        {isOwner && (
          <TabsContent value="danger">
            <Card className="p-6 border-destructive">
              <h2 className="text-xl font-semibold text-destructive mb-4">Danger Zone</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Delete Workspace</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete a workspace, there is no going back. Please be certain.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Workspace</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the workspace
                          and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete Workspace"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

