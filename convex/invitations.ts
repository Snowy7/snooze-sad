import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Generate a random token for invitation
function generateInviteToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Create invitation
export const createInvitation = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject || identity.tokenIdentifier;

    // Check if user is admin or owner
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Only workspace owners and admins can invite members");
    }

    // Check if user is already a member
    const existingMember = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Get user by email to check if they're already a member
    const invitedUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (invitedUser) {
      const isMember = existingMember.some(m => m.userId === invitedUser.externalId);
      if (isMember) {
        throw new Error("User is already a member of this workspace");
      }
    }

    // Check for existing pending invitation
    const existingInvite = await ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("email"), args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvite) {
      throw new Error("Invitation already sent to this email");
    }

    // Create invitation
    const token = generateInviteToken();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    const invitationId = await ctx.db.insert("invitations", {
      workspaceId: args.workspaceId,
      email: args.email,
      role: args.role,
      invitedBy: userId,
      status: "pending",
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    // Create notification if user exists
    if (invitedUser) {
      await ctx.db.insert("notifications", {
        userId: invitedUser.externalId!,
        type: "invitation",
        title: "Workspace Invitation",
        message: `You've been invited to join a workspace`,
        read: false,
        actionUrl: `/invitations/${token}`,
        metadata: { invitationId, workspaceId: args.workspaceId },
        createdAt: Date.now(),
      });
    }

    // Create activity
    await ctx.db.insert("activities", {
      workspaceId: args.workspaceId,
      userId,
      action: "invited_member",
      entityType: "workspace",
      entityId: args.workspaceId,
      metadata: { email: args.email, role: args.role },
      createdAt: Date.now(),
    });

    return invitationId;
  },
});

// List workspace invitations
export const listInvitations = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject || identity.tokenIdentifier;

    // Check if user is a member
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    if (!membership) throw new Error("Not a member of this workspace");

    return await ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

// Get invitation by token
export const getInvitationByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!invitation) return null;

    // Check if expired
    if (invitation.expiresAt < Date.now()) {
      return { ...invitation, expired: true };
    }

    // Get workspace details
    const workspace = await ctx.db.get(invitation.workspaceId);

    return {
      ...invitation,
      workspace,
      expired: false,
    };
  },
});

// Accept invitation
export const acceptInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject || identity.tokenIdentifier;

    // Get invitation
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!invitation) throw new Error("Invitation not found");
    if (invitation.status !== "pending") throw new Error("Invitation is no longer valid");
    if (invitation.expiresAt < Date.now()) throw new Error("Invitation has expired");

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", invitation.workspaceId).eq("userId", userId)
      )
      .unique();

    if (existingMembership) throw new Error("Already a member of this workspace");

    // Add user to workspace
    await ctx.db.insert("workspaceMembers", {
      workspaceId: invitation.workspaceId,
      userId,
      role: invitation.role,
      joinedAt: Date.now(),
    });

    // Update invitation status
    await ctx.db.patch(invitation._id, { status: "accepted" });

    // Create activity
    await ctx.db.insert("activities", {
      workspaceId: invitation.workspaceId,
      userId,
      action: "joined",
      entityType: "workspace",
      entityId: invitation.workspaceId,
      createdAt: Date.now(),
    });

    // Create notification for inviter
    await ctx.db.insert("notifications", {
      userId: invitation.invitedBy,
      type: "invitation_accepted",
      title: "Invitation Accepted",
      message: `${invitation.email} has joined the workspace`,
      read: false,
      createdAt: Date.now(),
    });

    return invitation.workspaceId;
  },
});

// Decline invitation
export const declineInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!invitation) throw new Error("Invitation not found");
    if (invitation.status !== "pending") throw new Error("Invitation is no longer valid");

    await ctx.db.patch(invitation._id, { status: "declined" });
  },
});

// Cancel invitation (by inviter)
export const cancelInvitation = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, { invitationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject || identity.tokenIdentifier;

    const invitation = await ctx.db.get(invitationId);
    if (!invitation) throw new Error("Invitation not found");

    // Check if user is admin or owner
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", invitation.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Only workspace owners and admins can cancel invitations");
    }

    await ctx.db.delete(invitationId);
  },
});

