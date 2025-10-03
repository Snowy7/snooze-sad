import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user notifications
export const listMyNotifications = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject || identity.tokenIdentifier;

    let notificationsQuery = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.unreadOnly) {
      notificationsQuery = ctx.db
        .query("notifications")
        .withIndex("by_user_and_read", (q) => q.eq("userId", userId).eq("read", false));
    }

    const notifications = await notificationsQuery
      .order("desc")
      .take(args.limit || 50);

    return notifications;
  },
});

// Get unread count
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const userId = identity.subject || identity.tokenIdentifier;

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => q.eq("userId", userId).eq("read", false))
      .collect();

    return unreadNotifications.length;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject || identity.tokenIdentifier;

    const notification = await ctx.db.get(notificationId);
    if (!notification) throw new Error("Notification not found");
    if (notification.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(notificationId, { read: true });
  },
});

// Mark all as read
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject || identity.tokenIdentifier;

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => q.eq("userId", userId).eq("read", false))
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { read: true });
    }
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject || identity.tokenIdentifier;

    const notification = await ctx.db.get(notificationId);
    if (!notification) throw new Error("Notification not found");
    if (notification.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.delete(notificationId);
  },
});

// Create notification (internal use)
export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
      createdAt: Date.now(),
    });
  },
});

