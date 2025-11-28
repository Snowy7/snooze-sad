"use client"

import * as React from "react"
import {
  ReactFlow,
  Background,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  OnNodesChange,
  NodeChange,
} from "@xyflow/react"
// @ts-ignore
import "@xyflow/react/dist/style.css"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import { Plus, Minus, Maximize2, RefreshCw, LayoutGrid, CheckCircle2, FileText, TrendingUp, Target, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskNode } from "./nodes/task-node"
import { NoteNode } from "./nodes/note-node"
import { WidgetNode } from "./nodes/widget-node"
import { ProjectShortcutNode } from "./nodes/project-shortcut-node"
import { ShortcutsNode } from "./nodes/shortcuts-node"
import { QuickActionsNode } from "./nodes/quick-actions-node"
import { DailyChecklistNode } from "./nodes/daily-checklist-node"
import { DailyFocusNode } from "./nodes/daily-focus-node"
import { DailyRoutinesNode } from "./nodes/daily-routines-node"
import { CalendarWidgetNode } from "./nodes/calendar-widget-node"
import { UpcomingTasksNode } from "./nodes/upcoming-tasks-node"
import { ProductivityChartNode } from "./nodes/productivity-chart-node"
import { TimeDistributionNode } from "./nodes/time-distribution-node"
import { TeamStatsNode } from "./nodes/team-stats-node"
import { ProjectListNode } from "./nodes/project-list-node"
import { TeamMembersNode } from "./nodes/team-members-node"
import { WorkspaceProgressNode } from "./nodes/workspace-progress-node"
import { ProjectCardNode } from "./nodes/project-card-node"
import { ProjectMilestonesNode } from "./nodes/project-milestones-node"
import { ProjectSprintsNode } from "./nodes/project-sprints-node"
import { ProjectBacklogNode } from "./nodes/project-backlog-node"
import { ProjectAnalyticsNode } from "./nodes/project-analytics-node"
import { ProjectTeamNode } from "./nodes/project-team-node"
import { ProjectActivityNode } from "./nodes/project-activity-node"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { getNodesForCategory, type NodeCategory } from "@/lib/node-registry"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Define custom node types
const nodeTypes: NodeTypes = {
  "task-card": TaskNode,
  "note": NoteNode,
  "widget": WidgetNode,
  "project-shortcut": ProjectShortcutNode,
  "shortcuts": ShortcutsNode,
  "quick-actions": QuickActionsNode,
  "daily-checklist": DailyChecklistNode,
  "daily-focus": DailyFocusNode,
  "daily-routines": DailyRoutinesNode,
  "calendar-widget": CalendarWidgetNode,
  "upcoming-tasks": UpcomingTasksNode,
  "productivity-chart": ProductivityChartNode,
  "time-distribution": TimeDistributionNode,
  "team-stats": TeamStatsNode,
  "project-list": ProjectListNode,
  "team-members": TeamMembersNode,
  "workspace-progress": WorkspaceProgressNode,
  "project-card": ProjectCardNode,
  "project-milestones": ProjectMilestonesNode,
  "project-sprints": ProjectSprintsNode,
  "project-backlog": ProjectBacklogNode,
  "project-analytics": ProjectAnalyticsNode,
  "project-team": ProjectTeamNode,
  "project-activity": ProjectActivityNode,
}

interface GraphCanvasProps {
  graphId: string
  className?: string
  onNodeSelect?: (nodeId: string | null) => void
  mode?: "personal" | "team"
  category?: NodeCategory // Determines which nodes are available
}

export function GraphCanvas({ graphId, className, onNodeSelect, mode = "team", category }: GraphCanvasProps) {
  const graphData = useQuery(api.graphs.getGraph, { graphId: graphId as any })
  const updateNodePosition = useMutation(api.graphs.updateNodePosition)
  const updateNodeSize = useMutation(api.graphs.updateNodeSize)
  const createNode = useMutation(api.graphs.createNode)
  const createWorkItem = useMutation(api.workItems.createWorkItem)
  const createDefaultGraph = useMutation(api.graphs.createDefaultGraph)
  const createPersonalGraph = useMutation(api.graphs.createPersonalGraph)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [showCreateMenu, setShowCreateMenu] = React.useState(false)
  const [createPosition, setCreatePosition] = React.useState({ x: 0, y: 0 })
  const [showResetDialog, setShowResetDialog] = React.useState(false)
  const { fitView, screenToFlowPosition, zoomIn, zoomOut } = useReactFlow()
  const [isOverScrollableNode, setIsOverScrollableNode] = React.useState(false)
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null)

  const GRID_SIZE = 20
  const resizeTimeoutRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Transform graph data to React Flow format with proper sizing
  React.useEffect(() => {
    if (!graphData) return

    const flowNodes: Node[] = graphData.nodes.map((node) => ({
      id: node._id,
      type: node.type,
      position: node.position,
      data: {
        ...node.props,
        workItem: node.workItem,
        nodeId: node._id,
        ownerId: graphData.ownerId,
      },
      // IMPORTANT: Set measured dimensions for proper resizing
      measured: node.size ? {
        width: node.size.width,
        height: node.size.height,
      } : undefined,
      style: node.size ? {
        width: node.size.width,
        height: node.size.height,
      } : undefined,
      draggable: true,
      selectable: true,
    }))

    const flowEdges: Edge[] = graphData.edges.map((edge) => ({
      id: edge._id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      type: edge.type === "dependency" ? "smoothstep" : "default",
      animated: edge.type === "flow",
      style: edge.style,
    }))

    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [graphData, setNodes, setEdges])

  // Custom nodes change handler to capture dimension changes
  const handleNodesChange: OnNodesChange = React.useCallback(
    (changes: NodeChange[]) => {
      // Apply changes to React Flow
      onNodesChange(changes)

      // Track selected nodes
      changes.forEach((change) => {
        if (change.type === 'select') {
          if (change.selected) {
            setSelectedNodeId(change.id)
            onNodeSelect?.(change.id)
          } else if (selectedNodeId === change.id) {
            setSelectedNodeId(null)
            onNodeSelect?.(null)
          }
        }
      })

      // Handle dimension changes for saving
      changes.forEach((change) => {
        if (change.type === 'dimensions' && change.dimensions && change.resizing) {
          const nodeId = change.id
          
          // Clear existing timeout for this node
          const existingTimeout = resizeTimeoutRef.current.get(nodeId)
          if (existingTimeout) {
            clearTimeout(existingTimeout)
          }

          // Set new timeout to save after user stops resizing
          const timeout = setTimeout(() => {
            console.log('Saving node size:', nodeId, change.dimensions)
            updateNodeSize({
              nodeId: nodeId as any,
              size: {
                width: Math.round(change.dimensions!.width),
                height: Math.round(change.dimensions!.height),
              },
            })
            resizeTimeoutRef.current.delete(nodeId)
          }, 800)

          resizeTimeoutRef.current.set(nodeId, timeout)
        }
      })
    },
    [onNodesChange, updateNodeSize, selectedNodeId, onNodeSelect]
  )

  // Handle node drag stop - save position
  const handleNodeDragStop = React.useCallback(
    (_: any, node: Node) => {
      const snappedPosition = {
        x: Math.round(node.position.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(node.position.y / GRID_SIZE) * GRID_SIZE,
      }

      updateNodePosition({
        nodeId: node.id as any,
        position: snappedPosition,
      })
    },
    [updateNodePosition]
  )

  // Double-click to create node
  const handleDoubleClick = React.useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.classList.contains('react-flow__pane') || target.classList.contains('react-flow__renderer')) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })
        const snappedPosition = {
          x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
          y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
        }
        setCreatePosition(snappedPosition)
        setShowCreateMenu(true)
      }
    },
    [screenToFlowPosition]
  )

  // Create node
  const handleCreateNode = React.useCallback(
    async (
      type: "task" | "note" | "widget" | string, 
      widgetType?: string,
      nodeType?: string,
      size?: { width: number; height: number },
      props?: any
    ) => {
      if (!graphData) return

      setShowCreateMenu(false)

      try {
        let workItemId = undefined

        if (type === "task" || type === "note" || nodeType?.includes("daily-")) {
          workItemId = await createWorkItem({
            workspaceId: graphData.workspaceId as any,
            type: type === "task" ? "task" : "note",
            title: type === "task" ? "New Task" : nodeType?.includes("daily-") ? `New ${nodeType}` : "New Note",
            status: type === "task" ? "backlog" : undefined,
            content: type === "note" || nodeType?.includes("daily-") ? "Start writing..." : undefined,
          })
        }

        await createNode({
          graphId: graphId as any,
          workItemId: workItemId as any,
          type: nodeType || (type === "task" ? "task-card" : type),
          position: createPosition,
          size: size || { width: type === "widget" ? 280 : 320, height: 200 },
          props: props || (widgetType ? { widgetType, ownerId: graphData.ownerId } : undefined),
        })
      } catch (error) {
        console.error("Failed to create node:", error)
      }
    },
    [graphId, graphData, createPosition, createNode, createWorkItem]
  )

  // Reset board
  const handleResetBoard = React.useCallback(
    async () => {
      if (!graphData) return

      try {
        if (mode === "personal") {
          await createPersonalGraph({ ownerId: graphData.ownerId })
        } else {
          await createDefaultGraph({ workspaceId: graphData.workspaceId as any })
        }
        setShowResetDialog(false)
      } catch (error) {
        console.error("Failed to reset board:", error)
      }
    },
    [graphData, mode, createPersonalGraph, createDefaultGraph]
  )

  // Smart auto layout that respects node sizes
  const handleAutoLayout = React.useCallback(
    () => {
      const PADDING = 40 // Space between nodes
      const START_X = 40
      const START_Y = 40
      const COLUMNS = 3

      let currentX = START_X
      let currentY = START_Y
      let rowHeight = 0
      let columnIndex = 0

      const layouted = nodes.map((node, idx) => {
        // Get node size
        const width = node.measured?.width || (node.style?.width as number) || 320
        const height = node.measured?.height || (node.style?.height as number) || 200

        // Calculate position
        const position = {
          x: currentX,
          y: currentY,
        }

        // Update for next node
        rowHeight = Math.max(rowHeight, height)
        columnIndex++

        if (columnIndex >= COLUMNS) {
          // Move to next row
          currentX = START_X
          currentY += rowHeight + PADDING
          rowHeight = 0
          columnIndex = 0
        } else {
          // Move to next column
          currentX += width + PADDING
        }

        return {
          ...node,
          position,
        }
      })

      setNodes(layouted)

      // Save all positions
      layouted.forEach((node) => {
        updateNodePosition({
          nodeId: node.id as any,
          position: node.position,
        })
      })

      setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100)
    },
    [nodes, setNodes, updateNodePosition, fitView]
  )

  if (!graphData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Loading board...</div>
      </div>
    )
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onDoubleClick={handleDoubleClick}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView
        minZoom={0.2}
        maxZoom={2}
        zoomOnScroll={!selectedNodeId && !isOverScrollableNode}
        zoomOnPinch={true}
        panOnScroll={false}
        snapToGrid={true}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        className="bg-background"
        nodeOrigin={[0, 0]}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="bg-muted/30"
        />
        
        <MiniMap
          nodeStrokeWidth={0}
          pannable
          zoomable
          nodeBorderRadius={8}
          nodeColor={(node) => {
            if (node.selected) return 'hsl(var(--primary) / 0.9)'
            return 'hsl(var(--primary) / 0.6)'
          }}
          maskColor="hsl(var(--background) / 0.9)"
          maskStrokeColor="hsl(var(--primary))"
          maskStrokeWidth={2}
          className="!border-0 !rounded-xl !shadow-lg !overflow-hidden"
          style={{
            backgroundColor: 'hsl(var(--card) / 0.95)',
            backdropFilter: 'blur(8px)',
          }}
        />

        {/* Custom Controls */}
        <Panel position="bottom-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong border-2 border-primary/20 rounded-xl shadow-lg p-2 flex items-center gap-2"
          >
            {/* Zoom controls */}
            <div className="flex items-center gap-1 pr-2 border-r border-border">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => zoomIn()}
                title="Zoom In"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => zoomOut()}
                title="Zoom Out"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>

            {/* Fit View */}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3"
              onClick={() => fitView({ duration: 800, padding: 0.2 })}
              title="Fit View"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>

            {/* Auto Layout */}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3"
              onClick={handleAutoLayout}
              title="Auto Layout"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>

            {/* Reset */}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3"
              onClick={() => setShowResetDialog(true)}
              title="Reset Board"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* Add Node */}
            <Button
              size="sm"
              className="h-8 px-3 gap-2"
              onClick={() => {
                setCreatePosition({ x: 100, y: 100 })
                setShowCreateMenu(true)
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs font-medium">Add</span>
            </Button>
          </motion.div>
        </Panel>
      </ReactFlow>

      {/* Create Node Menu */}
      <AnimatePresence>
        {showCreateMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setShowCreateMenu(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="glass-strong border-2 border-primary/20 rounded-2xl shadow-2xl p-6 min-w-[360px] pointer-events-auto"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Add to Board
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {getNodesForCategory(category || (mode === "personal" ? "personal" : "team")).map((nodeDef) => {
                    const Icon = require("lucide-react")[nodeDef.icon]
                    return (
                      <Button
                        key={nodeDef.id}
                        variant="outline"
                        className="w-full justify-start gap-3 h-12"
                        onClick={() => {
                          const nodeType = nodeDef.type
                          const props = nodeDef.createProps?.({ ownerId: graphData?.ownerId, workspaceId: graphData?.workspaceId, graphId })
                          
                          handleCreateNode(
                            nodeType === "task-card" ? "task" : nodeType === "widget" ? "widget" : "note",
                            props?.widgetType,
                            nodeType,
                            nodeDef.defaultSize,
                            props
                          )
                        }}
                      >
                        {Icon && <Icon className="h-5 w-5 text-primary" />}
                        <div className="text-left">
                          <div className="font-medium">{nodeDef.label}</div>
                          <div className="text-xs text-muted-foreground">{nodeDef.description}</div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Board?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all current nodes and restore the default board layout.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetBoard} className="bg-destructive hover:bg-destructive/90">
              Reset Board
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
