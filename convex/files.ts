import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";

// Generate a signed upload URL
export const generateUploadUrl = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        projectId: v.optional(v.id("projects")),
        taskId: v.optional(v.id("tasks")),
        contentType: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("Unauthorized");

        // Check if user is a member of the workspace
        const member = await ctx.db
            .query("workspaceMembers")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) => q.eq(q.field("userId"), user.subject))
            .first();

        if (!member) throw new Error("Not a member of workspace");

        // If projectId is provided, check if user is a project member
        if (args.projectId) {
            const projectMember = await ctx.db
                .query("projectMembers")
                .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
                .filter((q) => q.eq(q.field("userId"), user.subject))
                .first();

            if (!projectMember) throw new Error("Not a member of project");
        }

        // Generate a signed upload URL
        return await ctx.storage.generateUploadUrl();
    },
});

// Save file metadata after upload
export const saveFile = mutation({
    args: {
        storageId: v.string(),
        name: v.string(),
        size: v.number(),
        type: v.string(),
        workspaceId: v.id("workspaces"),
        projectId: v.optional(v.id("projects")),
        taskId: v.optional(v.id("tasks")),
    },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("Unauthorized");

        // Check if user is a member of the workspace
        const member = await ctx.db
            .query("workspaceMembers")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) => q.eq(q.field("userId"), user.subject))
            .first();

        if (!member) throw new Error("Not a member of workspace");

        // If projectId is provided, check if user is a project member
        if (args.projectId) {
            const projectMember = await ctx.db
                .query("projectMembers")
                .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
                .filter((q) => q.eq(q.field("userId"), user.subject))
                .first();

            if (!projectMember) throw new Error("Not a member of project");
        }

        // Save file metadata
        const file = await ctx.db.insert("files", {
            name: args.name,
            url: (await ctx.storage.getUrl(args.storageId)) || "",
            size: args.size,
            type: args.type,
            workspaceId: args.workspaceId,
            projectId: args.projectId,
            taskId: args.taskId,
            uploadedBy: member.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return file;
    },
});

// Update workspace logo
export const updateWorkspaceLogo = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        fileId: v.id("files"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("Unauthorized");

        // Check if user is a workspace admin
        const member = await ctx.db
            .query("workspaceMembers")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) => q.eq(q.field("userId"), user.subject))
            .first();

        if (!member || (member.role !== "admin" && member.role !== "owner")) {
            throw new Error("Only admins can update workspace logo");
        }

        // Get file URL
        const file = await ctx.db.get(args.fileId);
        if (!file) throw new Error("File not found");

        // Update workspace
        await ctx.db.patch(args.workspaceId, {
            logo: file.url,
            updatedAt: Date.now(),
        });
    },
});

// Update project logo
export const updateProjectLogo = mutation({
    args: {
        projectId: v.id("projects"),
        fileId: v.id("files"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("Unauthorized");

        // Get project
        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        // Check if user is a project admin
        const member = await ctx.db
            .query("projectMembers")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("userId"), user.subject))
            .first();

        if (!member || member.role !== "admin") {
            throw new Error("Only admins can update project logo");
        }

        // Get file URL
        const file = await ctx.db.get(args.fileId);
        if (!file) throw new Error("File not found");

        // Update project
        await ctx.db.patch(args.projectId, {
            logo: file.url,
            updatedAt: Date.now(),
        });
    },
});