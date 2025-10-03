import { internalMutation, mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// Query to get the current user
export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

// Query to find a user by WorkOS ID
export const byWorkOSId = query({
  args: { workosId: v.string() },
  handler: async (ctx, { workosId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", workosId))
      .unique();
  },
});

// Upsert user from WorkOS identity
export const upsertFromWorkOS = internalMutation({
  args: {
    data: v.object({
      object: v.string(),
      id: v.string(),
      first_name: v.string(),
      last_name: v.string(),
      profile_picture_url: v.optional(v.string()),
      email: v.string(),
      email_verified: v.boolean(),
      locale: v.optional(v.union(v.string(), v.null())),
      metadata: v.optional(v.object({})),
      last_sign_in_at: v.string(),
      created_at: v.string(),
      updated_at: v.string(),
      external_id: v.optional(v.union(v.string(), v.null())),
    }),
  },
  async handler(ctx, { data }) {
    const userAttributes = {
      fullName: data.first_name + " " + data.last_name,
      externalId: data.id,
      email: data.email,
      avatar: data.profile_picture_url ?? "",
      emailVerified: data.email_verified,
      onboardingCompleted: false,
      role: "user" as const,
      createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
    };

    const user = await userByWorkOSId(ctx, data.id ?? "");
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, {
        ...userAttributes,
        onboardingCompleted: user.onboardingCompleted || false,
        role: user.role || "user",
      });
    }
  },
});

// Delete user from WorkOS identity
export const deleteFromWorkOS = internalMutation({
  args: { workosId: v.string() },
  async handler(ctx, { workosId }) {
    const user = await userByWorkOSId(ctx, workosId);
    if (user !== null) {
      await ctx.db.delete(user._id);
    }
  },
});

// Helper to get the current user or throw
export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

// Helper to get the current user
export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  console.log("getCurrentUser - identity:", {
    tokenIdentifier: identity.tokenIdentifier,
    subject: identity.subject,
  });

  // Try to find user by token identifier
  let user = await userByWorkOSId(ctx, identity.tokenIdentifier);
  console.log("Found by tokenIdentifier:", user ? "YES" : "NO");
  
  // If not found and subject is different, try with subject
  if (!user && identity.subject && identity.subject !== identity.tokenIdentifier) {
    user = await userByWorkOSId(ctx, identity.subject);
    console.log("Found by subject:", user ? "YES" : "NO");
  }

  // If still not found, try to find by email as fallback
  if (!user && identity.email) {
    user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .unique();
    console.log("Found by email:", user ? "YES" : "NO");
  }

  return user;
}

// Helper to find a user by WorkOS ID
export async function userByWorkOSId(ctx: QueryCtx, workosId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_external_id", (q) => q.eq("externalId", workosId))
    .unique();
}

// On boarding mutation
export const onboarding = mutation({
  args: {
    onboardingCompleted: v.boolean(),
  },
  handler: async (ctx, { onboardingCompleted }) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (!user) {
      throw new Error("User not found");
    }
    await ctx.db.patch(user._id, { onboardingCompleted });
  },
});

// Get current user query
export const getCurrentUserQuery = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

// Manual user sync for when webhook fails
export const resetOnboarding = mutation({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (!user) {
      throw new Error("User not found");
    }
    await ctx.db.patch(user._id, { onboardingCompleted: false });
  },
});

export const syncCurrentUser = mutation({
  args: {
    workosUser: v.object({
      id: v.string(),
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      profilePictureUrl: v.optional(v.string()),
      emailVerified: v.boolean(),
    })
  },
  handler: async (ctx, { workosUser }) => {
    // Try to get the current auth identity, but don't require it
    const identity = await ctx.auth.getUserIdentity();
    
    // If we have an identity, use it to find/create the user
    if (identity) {
      console.log("syncCurrentUser - identity:", {
        tokenIdentifier: identity.tokenIdentifier,
        subject: identity.subject,
        workosUserId: workosUser.id,
      });

      // Use tokenIdentifier as the primary ID (this is what Convex auth uses)
      const externalId = identity.subject || identity.tokenIdentifier;
      
      const existingUser = await userByWorkOSId(ctx, externalId);
      if (existingUser) {
        console.log("User already exists, returning");
        return existingUser;
      }

      const userAttributes = {
        fullName: `${workosUser.firstName} ${workosUser.lastName}`,
        externalId: externalId, // Store the Convex auth ID
        email: workosUser.email,
        avatar: workosUser.profilePictureUrl || "",
        emailVerified: workosUser.emailVerified,
        onboardingCompleted: false,
        role: "user" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      console.log("Creating new user with externalId:", externalId);
      const userId = await ctx.db.insert("users", userAttributes);
      return await ctx.db.get(userId);
    }
    
    // If no identity yet, check if user exists by email (fallback for first sync)
    console.log("No identity yet, checking by email:", workosUser.email);
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", workosUser.email))
      .unique();
    
    if (existingUser) {
      console.log("User found by email, returning");
      return existingUser;
    }
    
    // Create user with WorkOS ID as placeholder (webhook will update it later)
    console.log("Creating user with WorkOS ID as placeholder");
    const userAttributes = {
      fullName: `${workosUser.firstName} ${workosUser.lastName}`,
      externalId: workosUser.id, // Temporary, will be updated by webhook
      email: workosUser.email,
      avatar: workosUser.profilePictureUrl || "",
      emailVerified: workosUser.emailVerified,
      onboardingCompleted: false,
      role: "user" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const userId = await ctx.db.insert("users", userAttributes);
    return await ctx.db.get(userId);
  },
});