import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getCurrentUserOrThrow } from "./users"

// Query to get all comments for a work item
export const listComments = query({
  args: {
    workItemId: v.id("workItems"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_work_item", (q) => q.eq("workItemId", args.workItemId))
      .order("desc")
      .collect()

    // Get author information for each comment
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("externalId"), comment.authorId))
          .first()

        return {
          ...comment,
          author: author
            ? {
                id: author.externalId,
                name: author.fullName || author.email,
                email: author.email,
                avatar: author.profilePictureUrl || author.avatar,
              }
            : null,
        }
      })
    )

    return commentsWithAuthors
  },
})

// Mutation to create a new comment
export const createComment = mutation({
  args: {
    workItemId: v.id("workItems"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    const commentId = await ctx.db.insert("comments", {
      workItemId: args.workItemId,
      authorId: user.externalId!,
      content: args.content,
      createdAt: Date.now(),
      isEdited: false,
    })

    return commentId
  },
})

// Mutation to update a comment
export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    const comment = await ctx.db.get(args.commentId)
    if (!comment) {
      throw new Error("Comment not found")
    }

    if (comment.authorId !== user.externalId) {
      throw new Error("Not authorized to edit this comment")
    }

    await ctx.db.patch(args.commentId, {
      content: args.content,
      updatedAt: Date.now(),
      isEdited: true,
    })

    return args.commentId
  },
})

// Mutation to delete a comment
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    const comment = await ctx.db.get(args.commentId)
    if (!comment) {
      throw new Error("Comment not found")
    }

    if (comment.authorId !== user.externalId) {
      throw new Error("Not authorized to delete this comment")
    }

    await ctx.db.delete(args.commentId)

    return args.commentId
  },
})
