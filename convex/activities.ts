import { v } from "convex/values";
import { query } from "./_generated/server";

// Get workspace activities
export const listWorkspaceActivities = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject || identity.tokenIdentifier;

    // Check if user is a member
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!membership) throw new Error("Not a member of this workspace");

    // Get activities
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(args.limit || 50);

    // Enrich with user details
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_external_id", (q) => q.eq("externalId", activity.userId))
          .unique();

        return {
          ...activity,
          user: user ? {
            fullName: user.fullName,
            avatar: user.avatar,
            email: user.email,
          } : null,
        };
      })
    );

    return enrichedActivities;
  },
});

// Get project activities
export const listProjectActivities = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject || identity.tokenIdentifier;

    // Get project to find workspace
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // For backward compatibility, skip workspace check if project has no workspace
    if (project.workspaceId) {
      // Check if user is a workspace member
      const membership = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace_and_user", (q) => 
          q.eq("workspaceId", project.workspaceId!).eq("userId", userId)
        )
        .unique();

      if (!membership) throw new Error("Not a member of this workspace");
    }

    // Get activities
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(args.limit || 50);

    // Enrich with user details
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_external_id", (q) => q.eq("externalId", activity.userId))
          .unique();

        return {
          ...activity,
          user: user ? {
            fullName: user.fullName,
            avatar: user.avatar,
            email: user.email,
          } : null,
        };
      })
    );

    return enrichedActivities;
  },
});

