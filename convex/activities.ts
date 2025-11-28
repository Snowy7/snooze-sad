import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

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

// Alias for backward compatibility
export const listActivities = listWorkspaceActivities;

// Get work item activities
export const listWorkItemActivities = query({
  args: {
    workItemId: v.id("workItems"),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_work_item", (q) => q.eq("workItemId", args.workItemId))
      .order("desc")
      .collect()

    // Get user information for each activity
    const activitiesWithUsers = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("externalId"), activity.userId))
          .first()

        return {
          ...activity,
          user: user
            ? {
                id: user.externalId,
                name: user.fullName || user.email,
                email: user.email,
                avatar: user.profilePictureUrl || user.avatar,
              }
            : null,
        }
      })
    )

    return activitiesWithUsers
  },
})

// Create activity log for work item
export const createActivity = mutation({
  args: {
    workItemId: v.id("workItems"),
    action: v.string(),
    field: v.optional(v.string()),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    const activityId = await ctx.db.insert("activities", {
      workItemId: args.workItemId,
      userId: user.externalId!,
      action: args.action,
      entityType: "workItem",
      entityId: args.workItemId,
      field: args.field,
      oldValue: args.oldValue,
      newValue: args.newValue,
      metadata: args.metadata,
      createdAt: Date.now(),
    })

    return activityId
  },
})
