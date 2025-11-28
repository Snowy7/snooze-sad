import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";

// Type for node configuration
type NodeConfig = {
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  workItem?: { type: string; title: string; content: string };
  props?: any;
};

// Default node configurations
const personalDefaultNodes: NodeConfig[] = [
  { type: "note", position: { x: 40, y: 40 }, size: { width: 480, height: 320 }, workItem: { type: "note", title: "Welcome to Your Personal Space", content: "Your personal productivity hub!\n\nThis is completely separate from team workspaces. Track your personal tasks, notes, goals, and daily routines here.\n\n🎯 Getting Started:\nDouble-click anywhere to create new items. Drag to move, resize from corners." } },
  { type: "shortcuts", position: { x: 560, y: 40 }, size: { width: 440, height: 320 } },
  { type: "note", position: { x: 40, y: 400 }, size: { width: 380, height: 300 }, workItem: { type: "note", title: "Today's Tasks", content: "☀️ Daily Focus:\n\n• Morning routine\n• Check emails\n• Work on main project\n• Review progress\n\nUse the Daily tab for recurring tasks and routines." } },
  { type: "quick-actions", position: { x: 460, y: 400 }, size: { width: 360, height: 300 }, props: { actionType: "personal" } },
  { type: "note", position: { x: 860, y: 400 }, size: { width: 340, height: 300 }, workItem: { type: "note", title: "Personal Goals 2024", content: "🎯 My Goals:\n\n• Learn new skills\n• Improve productivity\n• Maintain work-life balance\n• Exercise regularly\n• Read 12 books\n\nTrack progress weekly!" } },
  { type: "widget", position: { x: 40, y: 740 }, size: { width: 360, height: 240 }, props: { widgetType: "stats" } },
  { type: "widget", position: { x: 440, y: 740 }, size: { width: 340, height: 240 }, props: { widgetType: "goal" } },
  { type: "note", position: { x: 820, y: 740 }, size: { width: 380, height: 240 }, workItem: { type: "note", title: "Ideas & Inspiration", content: "💡 Quick Thoughts:\n\n• Project ideas\n• Learning resources\n• Creative inspiration\n• Random thoughts\n\nCapture everything here!" } },
  { type: "widget", position: { x: 40, y: 1020 }, size: { width: 740, height: 220 }, props: { widgetType: "activity" } },
  { type: "note", position: { x: 820, y: 1020 }, size: { width: 380, height: 220 }, workItem: { type: "note", title: "Week Planning", content: "📅 This Week:\n\nMon:\nTue:\nWed:\nThu:\nFri:\n\nPlan your week ahead!" } },
];

const teamDefaultNodes: NodeConfig[] = [
  // Team stats overview
  { type: "team-stats", position: { x: 40, y: 40 }, size: { width: 520, height: 280 }, props: {} },
  
  // Project quick links
  { type: "project-list", position: { x: 600, y: 40 }, size: { width: 500, height: 280 }, props: {} },
  
  // Recent team activity
  { type: "widget", position: { x: 40, y: 360 }, size: { width: 520, height: 300 }, props: { widgetType: "activity" } },
  
  // Team members widget
  { type: "team-members", position: { x: 600, y: 360 }, size: { width: 500, height: 300 }, props: {} },
  
  // Workspace progress chart
  { type: "workspace-progress", position: { x: 40, y: 700 }, size: { width: 520, height: 280 }, props: {} },
  
  // Quick actions widget
  { type: "quick-actions", position: { x: 600, y: 700 }, size: { width: 500, height: 280 }, props: {} },
];

// Get default graph/board for a workspace
export const getDefaultGraph = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const graph = await ctx.db
      .query("graphs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("isDefault"), true))
      .first();

    return graph;
  },
});

// Create default graph for workspace
export const createDefaultGraph = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) {
      console.error("User not authenticated in createDefaultGraph");
      throw new Error("Not authenticated");
    }

    // Check if default graph already exists for this workspace
    const existing = await ctx.db
      .query("graphs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("isDefault"), true))
      .first();

    if (existing) {
      console.log("Default graph already exists:", existing._id);
      return existing._id;
    }

    // Create new default graph
    const graphId = await ctx.db.insert("graphs", {
      workspaceId: args.workspaceId,
      name: "Team Board",
      description: "Collaborative team workspace",
      ownerId: user.externalId,
      type: "dashboard",
      isDefault: true,
      settings: {
        zoom: 1,
        pan: { x: 0, y: 0 },
      },
      createdAt: Date.now(),
    });

    // Create team nodes from configuration
    for (const nodeConfig of teamDefaultNodes) {
      let workItemId = undefined;
      
      if (nodeConfig.workItem) {
        workItemId = await ctx.db.insert("workItems", {
          workspaceId: args.workspaceId,
          ownerId: user.externalId,
          type: nodeConfig.workItem.type,
          title: nodeConfig.workItem.title,
          content: nodeConfig.workItem.content,
          createdAt: Date.now(),
        });
      }
      
      await ctx.db.insert("graphNodes", {
        graphId,
        workItemId,
        type: nodeConfig.type,
        position: nodeConfig.position,
        size: nodeConfig.size,
        props: nodeConfig.props ? { ...nodeConfig.props, ownerId: user.externalId } : undefined,
        zIndex: 1,
        createdAt: Date.now(),
      });
    }

    return graphId;
  },
});

// Add project card to projects graph when a new project is created
export const addProjectCardToProjectsGraph = mutation({
  args: {
    projectId: v.id("projects"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    // Find the projects graph for this workspace
    const projectsGraph = await ctx.db
      .query("graphs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("type"), "projects"))
      .first();

    if (!projectsGraph) {
      // If no projects graph exists, create one
      return await ctx.runMutation(api.graphs.createProjectsGraph, {
        workspaceId: args.workspaceId,
        ownerId: user.externalId,
      });
    }

    // Check if project card already exists
    const existingCard = await ctx.db
      .query("graphNodes")
      .withIndex("by_graph", (q) => q.eq("graphId", projectsGraph._id))
      .filter((q) => q.eq(q.field("type"), "project-card"))
      .filter((q) => q.eq(q.field("props.projectId"), args.projectId))
      .first();

    if (existingCard) {
      return projectsGraph._id; // Card already exists
    }

    // Find the best position for the new card
    const existingCards = await ctx.db
      .query("graphNodes")
      .withIndex("by_graph", (q) => q.eq("graphId", projectsGraph._id))
      .filter((q) => q.eq(q.field("type"), "project-card"))
      .collect();

    // Calculate position (4 cards per row)
    const cardsPerRow = 4;
    const cardWidth = 360;
    const cardHeight = 280;
    const startX = 40;
    const startY = 40;

    const row = Math.floor(existingCards.length / cardsPerRow);
    const col = existingCards.length % cardsPerRow;

    const position = {
      x: startX + (col * cardWidth),
      y: startY + (row * cardHeight),
    };

    // Add the new project card
    await ctx.db.insert("graphNodes", {
      graphId: projectsGraph._id,
      workItemId: undefined,
      type: "project-card",
      position,
      size: { width: 320, height: 240 },
      props: { projectId: args.projectId },
      zIndex: 1,
      createdAt: Date.now(),
    });

    return projectsGraph._id;
  },
});

// Create personal graph (no workspace required)
export const createPersonalGraph = mutation({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    // Check if personal graph already exists
    const existing = await ctx.db
      .query("graphs")
      .withIndex("by_type", (q) => q.eq("type", "personal"))
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first();

    if (existing) return existing._id;

    // Create personal graph with a workspace
    const workspaces = await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .collect();
    
    let workspaceId: any;
    if (workspaces.length > 0) {
      workspaceId = workspaces[0]._id;
    } else {
      workspaceId = await ctx.db.insert("workspaces", {
        name: "Personal",
        ownerId: args.ownerId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    const graphId = await ctx.db.insert("graphs", {
      workspaceId,
      name: "Personal Board",
      description: "Your personal productivity space",
      ownerId: args.ownerId,
      type: "personal",
      isDefault: false,
      settings: { zoom: 1, pan: { x: 0, y: 0 } },
      createdAt: Date.now(),
    });

    // Create personal nodes from configuration
    for (const nodeConfig of personalDefaultNodes) {
      let workItemId = undefined;
      
      if (nodeConfig.workItem) {
        workItemId = await ctx.db.insert("workItems", {
          workspaceId,
          ownerId: args.ownerId,
          type: nodeConfig.workItem.type,
          title: nodeConfig.workItem.title,
          content: nodeConfig.workItem.content,
          createdAt: Date.now(),
        });
      }
      
      await ctx.db.insert("graphNodes", {
        graphId,
        workItemId,
        type: nodeConfig.type,
        position: nodeConfig.position,
        size: nodeConfig.size,
        props: nodeConfig.props ? { ...nodeConfig.props, workspaceId, graphId, ownerId: args.ownerId } : undefined,
        zIndex: 1,
        createdAt: Date.now(),
      });
    }

    return graphId;
  },
});

// Add project card to projects graph when a new project is created
export const addProjectCardToProjectsGraph = mutation({
  args: {
    projectId: v.id("projects"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    // Find the projects graph for this workspace
    const projectsGraph = await ctx.db
      .query("graphs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("type"), "projects"))
      .first();

    if (!projectsGraph) {
      // If no projects graph exists, create one
      return await ctx.runMutation(api.graphs.createProjectsGraph, {
        workspaceId: args.workspaceId,
        ownerId: user.externalId,
      });
    }

    // Check if project card already exists
    const existingCard = await ctx.db
      .query("graphNodes")
      .withIndex("by_graph", (q) => q.eq("graphId", projectsGraph._id))
      .filter((q) => q.eq(q.field("type"), "project-card"))
      .filter((q) => q.eq(q.field("props.projectId"), args.projectId))
      .first();

    if (existingCard) {
      return projectsGraph._id; // Card already exists
    }

    // Find the best position for the new card
    const existingCards = await ctx.db
      .query("graphNodes")
      .withIndex("by_graph", (q) => q.eq("graphId", projectsGraph._id))
      .filter((q) => q.eq(q.field("type"), "project-card"))
      .collect();

    // Calculate position (4 cards per row)
    const cardsPerRow = 4;
    const cardWidth = 360;
    const cardHeight = 280;
    const startX = 40;
    const startY = 40;

    const row = Math.floor(existingCards.length / cardsPerRow);
    const col = existingCards.length % cardsPerRow;

    const position = {
      x: startX + (col * cardWidth),
      y: startY + (row * cardHeight),
    };

    // Add the new project card
    await ctx.db.insert("graphNodes", {
      graphId: projectsGraph._id,
      workItemId: undefined,
      type: "project-card",
      position,
      size: { width: 320, height: 240 },
      props: { projectId: args.projectId },
      zIndex: 1,
      createdAt: Date.now(),
    });

    return projectsGraph._id;
  },
});

// Get personal graph for user
export const getPersonalGraph = query({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const graph = await ctx.db
      .query("graphs")
      .withIndex("by_type", (q) => q.eq("type", "personal"))
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first();

    return graph;
  },
});

// Get graph by ID with all nodes and edges
export const getGraph = query({
  args: {
    graphId: v.id("graphs"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const graph = await ctx.db.get(args.graphId);
    if (!graph) return null;

    // Get all nodes for this graph
    const nodes = await ctx.db
      .query("graphNodes")
      .withIndex("by_graph", (q) => q.eq("graphId", args.graphId))
      .collect();

    // Get work items for nodes that have them
    const nodesWithWorkItems = await Promise.all(
      nodes.map(async (node) => {
        if (node.workItemId) {
          const workItem = await ctx.db.get(node.workItemId);
          return { ...node, workItem };
        }
        return { ...node, workItem: null };
      })
    );

    // Get edges
    const edges = await ctx.db
      .query("graphEdges")
      .withIndex("by_graph", (q) => q.eq("graphId", args.graphId))
      .collect();

    return {
      ...graph,
      nodes: nodesWithWorkItems,
      edges,
      ownerId: graph.ownerId,
      workspaceId: graph.workspaceId,
    };
  },
});

// Create a new node on the graph
export const createNode = mutation({
  args: {
    graphId: v.id("graphs"),
    workItemId: v.optional(v.id("workItems")),
    type: v.string(),
    position: v.object({ x: v.number(), y: v.number() }),
    size: v.optional(v.object({ width: v.number(), height: v.number() })),
    props: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    const nodeId = await ctx.db.insert("graphNodes", {
      graphId: args.graphId,
      workItemId: args.workItemId,
      type: args.type,
      position: args.position,
      size: args.size,
      props: args.props,
      zIndex: 1,
      createdAt: Date.now(),
    });

    return nodeId;
  },
});

// Update node position
export const updateNodePosition = mutation({
  args: {
    nodeId: v.id("graphNodes"),
    position: v.object({ x: v.number(), y: v.number() }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.nodeId, {
      position: args.position,
      updatedAt: Date.now(),
    });
  },
});

// Update node size
export const updateNodeSize = mutation({
  args: {
    nodeId: v.id("graphNodes"),
    size: v.object({ width: v.number(), height: v.number() }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.nodeId, {
      size: args.size,
      updatedAt: Date.now(),
    });
  },
});

// Create an edge between nodes
export const createEdge = mutation({
  args: {
    graphId: v.id("graphs"),
    sourceNodeId: v.id("graphNodes"),
    targetNodeId: v.id("graphNodes"),
    type: v.string(),
    workItemLinkId: v.optional(v.id("workItemLinks")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    const edgeId = await ctx.db.insert("graphEdges", {
      graphId: args.graphId,
      sourceNodeId: args.sourceNodeId,
      targetNodeId: args.targetNodeId,
      type: args.type,
      workItemLinkId: args.workItemLinkId,
      createdAt: Date.now(),
    });

    return edgeId;
  },
});

// Delete an edge
export const deleteEdge = mutation({
  args: {
    edgeId: v.id("graphEdges"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.edgeId);
  },
});

// Delete a node from the graph
export const deleteNode = mutation({
  args: {
    nodeId: v.id("graphNodes"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    const node = await ctx.db.get(args.nodeId);
    if (!node) throw new Error("Node not found");

    // Delete the node
    await ctx.db.delete(args.nodeId);

    // Delete associated work item if it exists
    if (node.workItemId) {
      const workItem = await ctx.db.get(node.workItemId);
      if (workItem) {
        await ctx.db.delete(node.workItemId);
      }
    }

    // Delete any edges connected to this node
    const edges = await ctx.db
      .query("graphEdges")
      .withIndex("by_source", (q) => q.eq("sourceNodeId", args.nodeId))
      .collect();
    
    for (const edge of edges) {
      await ctx.db.delete(edge._id);
    }

    const targetEdges = await ctx.db
      .query("graphEdges")
      .withIndex("by_target", (q) => q.eq("targetNodeId", args.nodeId))
      .collect();
    
    for (const edge of targetEdges) {
      await ctx.db.delete(edge._id);
    }
  },
});

// Get daily graph for a user
export const getDailyGraph = query({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const graph = await ctx.db
      .query("graphs")
      .withIndex("by_type", (q) => q.eq("type", "daily"))
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first();

    return graph;
  },
});

// Get projects graph for a workspace
export const getProjectsGraph = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const graph = await ctx.db
      .query("graphs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("type"), "projects"))
      .first();

    return graph;
  },
});

// Create daily graph for a user
export const createDailyGraph = mutation({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    // Check if daily graph already exists
    const existing = await ctx.db
      .query("graphs")
      .withIndex("by_type", (q) => q.eq("type", "daily"))
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first();

    if (existing) return existing._id;

    // Create new daily graph (no workspaceId needed for personal graphs)
    const graphId = await ctx.db.insert("graphs", {
      name: "Daily Tasks",
      description: "Your daily task board",
      ownerId: args.ownerId,
      type: "daily",
      isDefault: false,
      settings: {
        zoom: 1,
        pan: { x: 0, y: 0 },
      },
      createdAt: Date.now(),
    });

    // Add default daily nodes
    const dailyNodes = [
      {
        type: "daily-checklist",
        position: { x: 40, y: 40 },
        size: { width: 340, height: 400 },
        workItem: {
          type: "note",
          title: "Daily Checklist",
          content: "[]",
        },
      },
      {
        type: "daily-focus",
        position: { x: 420, y: 40 },
        size: { width: 280, height: 240 },
      },
      {
        type: "daily-routines",
        position: { x: 740, y: 40 },
        size: { width: 360, height: 320 },
      },
      {
        type: "note",
        position: { x: 40, y: 480 },
        size: { width: 520, height: 280 },
        workItem: {
          type: "note",
          title: "Today's Priorities",
          content: "What are the 3 most important things to accomplish today?\n\n1. \n2. \n3. ",
        },
      },
      {
        type: "note",
        position: { x: 600, y: 360 },
        size: { width: 360, height: 260 },
        workItem: {
          type: "note",
          title: "🐱 Productivity Tip of the Day",
          content: "Remember: Even a cat gets tired after chasing the laser pointer for too long.\n\nTake breaks! Your brain needs rest to be productive.\n\n(Also, treats help. Always have snacks.)",
        },
      },
      {
        type: "note",
        position: { x: 1000, y: 360 },
        size: { width: 360, height: 400 },
        workItem: {
          type: "note",
          title: "Notes & Reflections",
          content: "Daily notes, thoughts, and learnings...",
        },
      },
    ];

    // Get the first workspace for the user (we need a workspace for workItems)
    const workspace = await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first();
    
    if (!workspace) {
      throw new Error("No workspace found for user");
    }

    for (const nodeConfig of dailyNodes) {
      let workItemId = undefined;
      if (nodeConfig.workItem) {
        workItemId = await ctx.db.insert("workItems", {
          workspaceId: workspace._id,
          ownerId: args.ownerId,
          type: nodeConfig.workItem.type,
          title: nodeConfig.workItem.title,
          content: nodeConfig.workItem.content,
          createdAt: Date.now(),
        });
      }

      await ctx.db.insert("graphNodes", {
        graphId,
        workItemId,
        type: nodeConfig.type,
        position: nodeConfig.position,
        size: nodeConfig.size,
        zIndex: 1,
        createdAt: Date.now(),
      });
    }

    return graphId;
  },
});

// Add project card to projects graph when a new project is created
export const addProjectCardToProjectsGraph = mutation({
  args: {
    projectId: v.id("projects"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    // Find the projects graph for this workspace
    const projectsGraph = await ctx.db
      .query("graphs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("type"), "projects"))
      .first();

    if (!projectsGraph) {
      // If no projects graph exists, create one
      return await ctx.runMutation(api.graphs.createProjectsGraph, {
        workspaceId: args.workspaceId,
        ownerId: user.externalId,
      });
    }

    // Check if project card already exists
    const existingCard = await ctx.db
      .query("graphNodes")
      .withIndex("by_graph", (q) => q.eq("graphId", projectsGraph._id))
      .filter((q) => q.eq(q.field("type"), "project-card"))
      .filter((q) => q.eq(q.field("props.projectId"), args.projectId))
      .first();

    if (existingCard) {
      return projectsGraph._id; // Card already exists
    }

    // Find the best position for the new card
    const existingCards = await ctx.db
      .query("graphNodes")
      .withIndex("by_graph", (q) => q.eq("graphId", projectsGraph._id))
      .filter((q) => q.eq(q.field("type"), "project-card"))
      .collect();

    // Calculate position (4 cards per row)
    const cardsPerRow = 4;
    const cardWidth = 360;
    const cardHeight = 280;
    const startX = 40;
    const startY = 40;

    const row = Math.floor(existingCards.length / cardsPerRow);
    const col = existingCards.length % cardsPerRow;

    const position = {
      x: startX + (col * cardWidth),
      y: startY + (row * cardHeight),
    };

    // Add the new project card
    await ctx.db.insert("graphNodes", {
      graphId: projectsGraph._id,
      workItemId: undefined,
      type: "project-card",
      position,
      size: { width: 320, height: 240 },
      props: { projectId: args.projectId },
      zIndex: 1,
      createdAt: Date.now(),
    });

    return projectsGraph._id;
  },
});

// Create projects graph for a workspace
export const createProjectsGraph = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    // Check if projects graph already exists
    const existing = await ctx.db
      .query("graphs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("type"), "projects"))
      .first();

    if (existing) return existing._id;

    // Create projects graph
    const graphId = await ctx.db.insert("graphs", {
      workspaceId: args.workspaceId,
      name: "Projects Board",
      description: "Visual project management",
      ownerId: args.ownerId,
      type: "projects",
      isDefault: false,
      settings: { zoom: 0.8, pan: { x: 0, y: 0 } },
      createdAt: Date.now(),
    });

    // Get all projects for this workspace
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Create a node for each project
    let x = 40;
    let y = 40;
    const cardsPerRow = 4;
    let cardIndex = 0;

    for (const project of projects) {
      await ctx.db.insert("graphNodes", {
        graphId,
        workItemId: undefined,
        type: "project-card",
        position: { x, y },
        size: { width: 320, height: 240 },
        props: { projectId: project._id },
        zIndex: 1,
        createdAt: Date.now(),
      });

      cardIndex++;
      if (cardIndex % cardsPerRow === 0) {
        x = 40;
        y += 280;
      } else {
        x += 360;
      }
    }

    return graphId;
  },
});

// Add project card to projects graph when a new project is created
export const addProjectCardToProjectsGraph = mutation({
  args: {
    projectId: v.id("projects"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    // Find the projects graph for this workspace
    const projectsGraph = await ctx.db
      .query("graphs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("type"), "projects"))
      .first();

    if (!projectsGraph) {
      // If no projects graph exists, create one
      return await ctx.runMutation(api.graphs.createProjectsGraph, {
        workspaceId: args.workspaceId,
        ownerId: user.externalId,
      });
    }

    // Check if project card already exists
    const existingCard = await ctx.db
      .query("graphNodes")
      .withIndex("by_graph", (q) => q.eq("graphId", projectsGraph._id))
      .filter((q) => q.eq(q.field("type"), "project-card"))
      .filter((q) => q.eq(q.field("props.projectId"), args.projectId))
      .first();

    if (existingCard) {
      return projectsGraph._id; // Card already exists
    }

    // Find the best position for the new card
    const existingCards = await ctx.db
      .query("graphNodes")
      .withIndex("by_graph", (q) => q.eq("graphId", projectsGraph._id))
      .filter((q) => q.eq(q.field("type"), "project-card"))
      .collect();

    // Calculate position (4 cards per row)
    const cardsPerRow = 4;
    const cardWidth = 360;
    const cardHeight = 280;
    const startX = 40;
    const startY = 40;

    const row = Math.floor(existingCards.length / cardsPerRow);
    const col = existingCards.length % cardsPerRow;

    const position = {
      x: startX + (col * cardWidth),
      y: startY + (row * cardHeight),
    };

    // Add the new project card
    await ctx.db.insert("graphNodes", {
      graphId: projectsGraph._id,
      workItemId: undefined,
      type: "project-card",
      position,
      size: { width: 320, height: 240 },
      props: { projectId: args.projectId },
      zIndex: 1,
      createdAt: Date.now(),
    });

    return projectsGraph._id;
  },
});

// Get project graph for a specific project
export const getProjectGraph = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const graph = await ctx.db
      .query("graphs")
      .filter((q) => q.and(
        q.eq(q.field("type"), "project"),
        q.eq(q.field("name"), `Project-${args.projectId}`)
      ))
      .first();

    return graph;
  },
});

// Create project graph with default cards
export const createProjectGraph = mutation({
  args: {
    projectId: v.id("projects"),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Check if project graph already exists
    const existing = await ctx.db
      .query("graphs")
      .filter((q) => q.and(
        q.eq(q.field("type"), "project"),
        q.eq(q.field("name"), `Project-${args.projectId}`)
      ))
      .first();

    if (existing) return existing._id;

    // Create project graph
    const graphId = await ctx.db.insert("graphs", {
      workspaceId: project.workspaceId,
      name: `Project-${args.projectId}`,
      description: project.description || "Project workspace",
      ownerId: args.ownerId,
      type: "project",
      isDefault: false,
      settings: { zoom: 1, pan: { x: 0, y: 0 } },
      createdAt: Date.now(),
    });

    // Create default project cards
    const defaultCards = [
      { type: "project-milestones", position: { x: 40, y: 40 }, size: { width: 420, height: 280 } },
      { type: "project-sprints", position: { x: 500, y: 40 }, size: { width: 420, height: 280 } },
      { type: "project-backlog", position: { x: 40, y: 360 }, size: { width: 420, height: 320 } },
      { type: "project-analytics", position: { x: 500, y: 360 }, size: { width: 420, height: 320 } },
      { type: "project-team", position: { x: 960, y: 40 }, size: { width: 360, height: 280 } },
      { type: "project-activity", position: { x: 960, y: 360 }, size: { width: 360, height: 320 } },
    ];

    for (const card of defaultCards) {
      await ctx.db.insert("graphNodes", {
        graphId,
        workItemId: undefined,
        type: card.type,
        position: card.position,
        size: card.size,
        props: { projectId: args.projectId },
        zIndex: 1,
        createdAt: Date.now(),
      });
    }

    return graphId;
  },
});

// Add project card to projects graph when a new project is created
export const addProjectCardToProjectsGraph = mutation({
  args: {
    projectId: v.id("projects"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?.externalId) throw new Error("Not authenticated");

    // Find the projects graph for this workspace
    const projectsGraph = await ctx.db
      .query("graphs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("type"), "projects"))
      .first();

    if (!projectsGraph) {
      // If no projects graph exists, create one
      return await ctx.runMutation(api.graphs.createProjectsGraph, {
        workspaceId: args.workspaceId,
        ownerId: user.externalId,
      });
    }

    // Check if project card already exists
    const existingCard = await ctx.db
      .query("graphNodes")
      .withIndex("by_graph", (q) => q.eq("graphId", projectsGraph._id))
      .filter((q) => q.eq(q.field("type"), "project-card"))
      .filter((q) => q.eq(q.field("props.projectId"), args.projectId))
      .first();

    if (existingCard) {
      return projectsGraph._id; // Card already exists
    }

    // Find the best position for the new card
    const existingCards = await ctx.db
      .query("graphNodes")
      .withIndex("by_graph", (q) => q.eq("graphId", projectsGraph._id))
      .filter((q) => q.eq(q.field("type"), "project-card"))
      .collect();

    // Calculate position (4 cards per row)
    const cardsPerRow = 4;
    const cardWidth = 360;
    const cardHeight = 280;
    const startX = 40;
    const startY = 40;

    const row = Math.floor(existingCards.length / cardsPerRow);
    const col = existingCards.length % cardsPerRow;

    const position = {
      x: startX + (col * cardWidth),
      y: startY + (row * cardHeight),
    };

    // Add the new project card
    await ctx.db.insert("graphNodes", {
      graphId: projectsGraph._id,
      workItemId: undefined,
      type: "project-card",
      position,
      size: { width: 320, height: 240 },
      props: { projectId: args.projectId },
      zIndex: 1,
      createdAt: Date.now(),
    });

    return projectsGraph._id;
  },
});
