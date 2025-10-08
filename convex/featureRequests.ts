import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let requests
    
    if (args.status !== undefined) {
      requests = await ctx.db
        .query("featureRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect()
    } else {
      requests = await ctx.db
        .query("featureRequests")
        .order("desc")
        .collect()
    }
    
    // Calculate net votes for each request
    return requests.map(req => ({
      ...req,
      netVotes: req.upvotes - req.downvotes
    })).sort((a, b) => b.netVotes - a.netVotes)
  },
})

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    userEmail: v.optional(v.string()),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject

    const requestId = await ctx.db.insert("featureRequests", {
      title: args.title,
      description: args.description,
      category: args.category,
      status: "requested",
      userId: userId,
      userEmail: args.userEmail,
      userName: args.userName,
      upvotes: 0,
      downvotes: 0,
      createdAt: Date.now(),
    })

    return requestId
  },
})

export const vote = mutation({
  args: {
    featureRequestId: v.id("featureRequests"),
    vote: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject

    if (!userId) {
      throw new Error("Must be logged in to vote")
    }

    // Check if user has already voted
    const existingVote = await ctx.db
      .query("featureVotes")
      .withIndex("by_feature_and_user", (q) =>
        q.eq("featureRequestId", args.featureRequestId).eq("userId", userId)
      )
      .unique()

    const feature = await ctx.db.get(args.featureRequestId)
    if (!feature) throw new Error("Feature request not found")

    if (existingVote) {
      // If same vote, remove it
      if (existingVote.vote === args.vote) {
        await ctx.db.delete(existingVote._id)
        // Decrement the vote count
        if (args.vote === "up") {
          await ctx.db.patch(args.featureRequestId, {
            upvotes: Math.max(0, feature.upvotes - 1),
          })
        } else {
          await ctx.db.patch(args.featureRequestId, {
            downvotes: Math.max(0, feature.downvotes - 1),
          })
        }
        return
      }

      // If different vote, update it
      await ctx.db.patch(existingVote._id, {
        vote: args.vote,
      })

      // Update vote counts
      if (args.vote === "up") {
        // Changed from down to up
        await ctx.db.patch(args.featureRequestId, {
          upvotes: feature.upvotes + 1,
          downvotes: Math.max(0, feature.downvotes - 1),
        })
      } else {
        // Changed from up to down
        await ctx.db.patch(args.featureRequestId, {
          upvotes: Math.max(0, feature.upvotes - 1),
          downvotes: feature.downvotes + 1,
        })
      }
    } else {
      // Create new vote
      await ctx.db.insert("featureVotes", {
        featureRequestId: args.featureRequestId,
        userId,
        vote: args.vote,
        createdAt: Date.now(),
      })

      // Increment vote count
      if (args.vote === "up") {
        await ctx.db.patch(args.featureRequestId, {
          upvotes: feature.upvotes + 1,
        })
      } else {
        await ctx.db.patch(args.featureRequestId, {
          downvotes: feature.downvotes + 1,
        })
      }
    }
  },
})

export const getUserVote = query({
  args: {
    featureRequestId: v.id("featureRequests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject

    if (!userId) return null

    const vote = await ctx.db
      .query("featureVotes")
      .withIndex("by_feature_and_user", (q) =>
        q.eq("featureRequestId", args.featureRequestId).eq("userId", userId)
      )
      .unique()

    return vote?.vote ?? null
  },
})
