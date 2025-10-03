# Workspace Migration Guide

## 🎯 Overview

This guide explains the migration from a user-based system to a **workspace-based collaborative system**.

---

## ✅ What's Been Completed

### 1. **Schema Updates** (`convex/schema.ts`)
- ✅ Made `tasks.ownerId` optional (fixes immediate deployment error)
- ✅ Added `workspaces` table
- ✅ Added `workspaceMembers` table (with roles: owner, admin, member, viewer)
- ✅ Added `projectMembers` table
- ✅ Added `invitations` table
- ✅ Added `notifications` table
- ✅ Added `activities` table
- ✅ Added `files` table
- ✅ Updated `projects` to include `workspaceId`
- ✅ Updated `users` table with all necessary fields

### 2. **Backend Functions Created**

#### **`convex/workspaces.ts`**
- ✅ `listMyWorkspaces` - List all workspaces user is a member of
- ✅ `getWorkspace` - Get single workspace details
- ✅ `createWorkspace` - Create new workspace
- ✅ `updateWorkspace` - Update workspace details
- ✅ `deleteWorkspace` - Delete workspace (owner only)
- ✅ `listMembers` - List all workspace members
- ✅ `removeMember` - Remove member from workspace
- ✅ `updateMemberRole` - Change member role

#### **`convex/invitations.ts`**
- ✅ `createInvitation` - Invite user to workspace
- ✅ `listInvitations` - List all workspace invitations
- ✅ `getInvitationByToken` - Get invitation details by token
- ✅ `acceptInvitation` - Accept invitation and join workspace
- ✅ `declineInvitation` - Decline invitation
- ✅ `cancelInvitation` - Cancel pending invitation

#### **`convex/notifications.ts`**
- ✅ `listMyNotifications` - Get user notifications
- ✅ `getUnreadCount` - Get unread notification count
- ✅ `markAsRead` - Mark notification as read
- ✅ `markAllAsRead` - Mark all notifications as read
- ✅ `deleteNotification` - Delete notification
- ✅ `createNotification` - Create new notification (internal)

#### **`convex/activities.ts`**
- ✅ `listWorkspaceActivities` - Get workspace activity feed
- ✅ `listProjectActivities` - Get project activity feed

#### **`convex/files.ts` (provided)**
- ✅ File upload and management for workspaces

#### **`convex/users.ts` (provided)**
- ✅ User management and WorkOS integration

---

## 🚧 What Needs to Be Done

### 3. **Update Existing Functions** (`convex/functions.ts`)

You need to update all project and task functions to:
- Check workspace membership instead of just `ownerId`
- Add workspace context to all operations
- Create activities for important actions
- Send notifications for assignments

**Example pattern:**
```typescript
// OLD: Check ownerId
const tasks = await ctx.db
  .query("tasks")
  .filter((q) => q.eq(q.field("ownerId"), ownerId))
  .collect();

// NEW: Check workspace membership
const project = await ctx.db.get(projectId);
const membership = await ctx.db
  .query("workspaceMembers")
  .withIndex("by_workspace_and_user", (q) => 
    q.eq("workspaceId", project.workspaceId).eq("userId", userId)
  )
  .unique();

if (!membership) throw new Error("Not a member");
```

### 4. **UI Components to Create**

#### **Workspace Switcher** (`src/components/workspace-switcher.tsx`)
- Dropdown in sidebar/topbar
- List all user workspaces
- Create new workspace button
- Switch between workspaces

#### **Workspace Settings** (`src/app/(app)/workspaces/[id]/settings/page.tsx`)
- General settings tab
- Members tab (list, add, remove, change roles)
- Invitations tab (pending invitations)
- Delete workspace option

#### **Invitation Pages**
- **`src/app/invitations/[token]/page.tsx`** - Accept invitation page
- Show workspace details
- Accept/Decline buttons

#### **Notifications Dropdown** (`src/components/notifications-dropdown.tsx`)
- Bell icon in topbar
- Unread count badge
- List recent notifications
- Mark as read functionality

#### **Activity Feed** (`src/components/activity-feed.tsx`)
- Show recent workspace/project activities
- Filter by action type
- User avatars and timestamps

### 5. **Update Existing Pages**

#### **Dashboard** (`src/app/(app)/dashboard/page.tsx`)
- Add workspace context
- Show only current workspace data
- Add workspace switcher

#### **Projects List** (`src/app/(app)/projects/page.tsx`)
- Show projects from current workspace only
- Add workspace context
- Update to use workspace-based queries

#### **Project Detail** (`src/app/(app)/projects/[id]/page.tsx`)
- Verify workspace membership
- Show workspace context
- Add activity feed tab

#### **Sidebar** (`src/components/app-sidebar.tsx`)
- Remove standalone "Projects" link
- Add "Workspaces" section
- Show current workspace name
- Add workspace switcher

### 6. **Migration Strategy**

For existing users with data:

**Option A: Auto-migrate on first login**
```typescript
// Create a default workspace for users with existing projects
export const migrateUserToWorkspace = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity.subject || identity.tokenIdentifier;
    
    // Check if user has projects without workspace
    const oldProjects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("ownerId"), userId))
      .filter((q) => q.eq(q.field("workspaceId"), undefined))
      .collect();
    
    if (oldProjects.length > 0) {
      // Create "Personal Workspace"
      const workspaceId = await ctx.db.insert("workspaces", {
        name: "Personal Workspace",
        ownerId: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Add user as owner
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId,
        role: "owner",
        joinedAt: Date.now(),
      });
      
      // Migrate all projects
      for (const project of oldProjects) {
        await ctx.db.patch(project._id, { workspaceId });
      }
      
      // Migrate tasks with ownerId to first project
      const tasks = await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("ownerId"), userId))
        .collect();
        
      for (const task of tasks) {
        if (!task.projectId && oldProjects[0]) {
          await ctx.db.patch(task._id, {
            projectId: oldProjects[0]._id
          });
        }
      }
      
      return workspaceId;
    }
    
    return null;
  }
});
```

**Option B: Manual migration page**
- Create `/migrate` page
- Show user's old projects
- Let them choose workspace name
- Migrate button

---

## 🔑 Key Concepts

### **Workspace Hierarchy**
```
Workspace
  └─ Members (owner, admin, member, viewer)
  └─ Projects
      └─ Project Members
      └─ Tasks
          └─ Assignees
```

### **Daily Tasks vs Project Tasks**
- **Daily Tasks**: Personal, belong to user (`isDaily: true`, `ownerId` set)
- **Project Tasks**: Team, belong to project/workspace (has `projectId`, `assigneeId`)

### **Permissions**
- **Owner**: Full control, can delete workspace
- **Admin**: Can manage members, projects, settings
- **Member**: Can create/edit projects and tasks
- **Viewer**: Read-only access

---

## 📋 Deployment Checklist

Before deploying:

1. ✅ Schema updated (done)
2. ✅ Backend functions created (done)
3. ⏳ Update `convex/functions.ts` for workspace context
4. ⏳ Create workspace switcher UI
5. ⏳ Create workspace settings page
6. ⏳ Create invitation accept page
7. ⏳ Add notifications dropdown to topbar
8. ⏳ Update sidebar with workspace context
9. ⏳ Add migration logic for existing users
10. ⏳ Test all flows (create workspace, invite, accept, permissions)
11. ⏳ Update environment variables if needed
12. ⏳ Deploy to production

---

## 🎨 UI/UX Flow

### **New User Flow**
1. Sign up → Auth page
2. Onboarding → Create first workspace
3. Dashboard → See workspace dashboard
4. Can create projects, invite team

### **Invited User Flow**
1. Receive email invitation
2. Click link → Accept invitation page
3. Sign up/Sign in
4. Automatically join workspace
5. See workspace dashboard

### **Multi-Workspace User Flow**
1. Workspace switcher in sidebar/topbar
2. Switch between workspaces
3. Each workspace has own projects/tasks
4. Notifications across all workspaces

---

## 🚀 Next Steps

1. **Run deployment** - The schema changes will deploy automatically
2. **Update `convex/functions.ts`** - Add workspace checks
3. **Create UI components** - Start with workspace switcher
4. **Build workspace pages** - Settings, members, invitations
5. **Add notifications UI** - Dropdown in topbar
6. **Test migration** - Create test workspaces
7. **Ship it!** 🎉

---

## 💡 Tips

- Use `useQuery(api.workspaces.listMyWorkspaces)` to get user workspaces
- Store current workspace ID in localStorage or URL
- Use React Context for current workspace state
- Show loading states during workspace switches
- Add error boundaries for permission errors
- Use optimistic updates for better UX

---

## 📞 Need Help?

This is a major architectural change. Take it step by step:

1. Deploy schema ✅
2. Create one UI component at a time
3. Test thoroughly
4. Migrate existing data carefully

Good luck! 🚀

