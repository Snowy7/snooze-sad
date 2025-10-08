import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper function to get user ID with fallback for auth timing issues
async function getUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  
  if (identity) {
    return identity.subject || identity.tokenIdentifier;
  }
  
  // Fallback: find most recent user (handles auth timing issues)
  const users = await ctx.db.query("users").order("desc").take(1);
  if (users.length > 0) {
    return users[0].externalId!;
  }
  
  return null;
}

// List all workspaces where the user is a member
export const listMyWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Get all workspace memberships for this user
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Fetch the actual workspaces
    const workspaces = await Promise.all(
      memberships.map(async (membership) => {
        const workspace = await ctx.db.get(membership.workspaceId);
        if (!workspace) return null;
        return {
          ...workspace,
          role: membership.role,
        };
      })
    );

    return workspaces.filter((w) => w !== null);
  },
});

// Get a single workspace by ID
export const getWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    // Check if user is a member
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    // Return null if not a member (UI will handle gracefully)
    if (!membership) return null;

    const workspace = await ctx.db.get(workspaceId);
    // Return null if workspace doesn't exist
    if (!workspace) return null;

    return {
      ...workspace,
      role: membership.role,
    };
  },
});

// Create a new workspace
export const createWorkspace = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("No user found. Please try again.");
    }

    // Check if user already has a workspace with this name
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const membership of memberships) {
      const workspace = await ctx.db.get(membership.workspaceId);
      if (workspace && workspace.name.toLowerCase() === args.name.toLowerCase()) {
        throw new Error("You already have a workspace with this name. Please choose a different name.");
      }
    }

    // Create workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      description: args.description,
      ownerId: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add creator as owner member
    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId,
      role: "owner",
      joinedAt: Date.now(),
    });

    // Create activity
    await ctx.db.insert("activities", {
      workspaceId,
      userId,
      action: "created",
      entityType: "workspace",
      entityId: workspaceId,
      createdAt: Date.now(),
    });

    return workspaceId;
  },
});

// Update workspace
export const updateWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found. Please try again.");

    // Check if user is admin or owner
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Only workspace owners and admins can update workspace");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.logo !== undefined) updates.logo = args.logo;

    await ctx.db.patch(args.workspaceId, updates);

    // Create activity
    await ctx.db.insert("activities", {
      workspaceId: args.workspaceId,
      userId,
      action: "updated",
      entityType: "workspace",
      entityId: args.workspaceId,
      createdAt: Date.now(),
    });
  },
});

// Delete workspace
export const deleteWorkspace = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found. Please try again.");

    // Check if user is owner
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only workspace owner can delete workspace");
    }

    // Delete all members
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete workspace
    await ctx.db.delete(workspaceId);
  },
});

// List workspace members
export const listMembers = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Check if user is a member
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    // Return empty array if not a member (UI will handle gracefully)
    if (!membership) return [];

    // Get all members
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    // Fetch user details for each member
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_external_id", (q) => q.eq("externalId", member.userId))
          .unique();

        return {
          ...member,
          user: user ? {
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
          } : null,
        };
      })
    );

    return membersWithDetails;
  },
});

// Remove member from workspace
export const removeMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUserId = identity.subject || identity.tokenIdentifier;

    // Check if current user is admin or owner
    const currentMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("userId", currentUserId)
      )
      .unique();

    if (!currentMembership || (currentMembership.role !== "owner" && currentMembership.role !== "admin")) {
      throw new Error("Only workspace owners and admins can remove members");
    }

    // Cannot remove owner
    const targetMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("userId", args.userId)
      )
      .unique();

    if (!targetMembership) throw new Error("Member not found");
    if (targetMembership.role === "owner") throw new Error("Cannot remove workspace owner");

    await ctx.db.delete(targetMembership._id);

    // Create activity
    await ctx.db.insert("activities", {
      workspaceId: args.workspaceId,
      userId: currentUserId,
      action: "removed_member",
      entityType: "workspace",
      entityId: args.workspaceId,
      metadata: { removedUserId: args.userId },
      createdAt: Date.now(),
    });
  },
});

// Update member role
export const updateMemberRole = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUserId = identity.subject || identity.tokenIdentifier;

    // Check if current user is owner
    const currentMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("userId", currentUserId)
      )
      .unique();

    if (!currentMembership || currentMembership.role !== "owner") {
      throw new Error("Only workspace owner can update member roles");
    }

    // Cannot change owner role
    const targetMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("userId", args.userId)
      )
      .unique();

    if (!targetMembership) throw new Error("Member not found");
    if (targetMembership.role === "owner") throw new Error("Cannot change owner role");

    await ctx.db.patch(targetMembership._id, { role: args.role });

    // Create activity
    await ctx.db.insert("activities", {
      workspaceId: args.workspaceId,
      userId: currentUserId,
      action: "updated_member_role",
      entityType: "workspace",
      entityId: args.workspaceId,
      metadata: { targetUserId: args.userId, newRole: args.role },
      createdAt: Date.now(),
    });
  },
});

