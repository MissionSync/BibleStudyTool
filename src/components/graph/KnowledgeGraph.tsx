// components/graph/KnowledgeGraph.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeChange,
  ConnectionMode,
  Panel,
  MarkerType,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { exportGraphAsJSON, exportGraphAsCSV } from '@/lib/graphExport';
import { getEdgeStyle } from '@/lib/graphEdgeStyle';
import { applyLayoutPreservingSaved, type StudyMapLayout } from '@/lib/graphTransform';
import { selectWeekItemIds } from '@/lib/weekReading';

import { PassageNode } from './nodes/PassageNode';
import { NoteNode } from './nodes/NoteNode';
import { ThemeNode } from './nodes/ThemeNode';
import { PersonNode } from './nodes/PersonNode';
import { PlaceNode } from './nodes/PlaceNode';
import { BookNode } from './nodes/BookNode';
import { GraphControls } from './GraphControls';
import { GraphStats } from './GraphStats';
import { NodeDetailsPanel } from './NodeDetailsPanel';

const nodeTypes = {
  passage: PassageNode,
  note: NoteNode,
  theme: ThemeNode,
  person: PersonNode,
  place: PlaceNode,
  book: BookNode,
};

function styleEdge(edge: Edge): Edge {
  return {
    ...edge,
    ...getEdgeStyle(edge.type || 'default'),
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
    },
  };
}

function positionsForLayout(
  items: Node[],
  links: Edge[],
  layout: StudyMapLayout,
  savedIds: ReadonlySet<string>,
): Node[] {
  const laidOut = applyLayoutPreservingSaved(
    items.map((item) => ({
      id: item.id,
      nodeType: item.type || 'note',
      position: item.position,
    })),
    links.map((link) => ({ source: link.source, target: link.target })),
    layout,
    savedIds,
  );
  const byId = new Map(laidOut.map((item) => [item.id, item.position]));
  return items.map((item) => {
    const position = byId.get(item.id);
    return position ? { ...item, position } : item;
  });
}

interface KnowledgeGraphProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  savedPositionIds?: string[];
  weekReading?: string;
  onNodeClick?: (node: Node) => void;
  onNodeDoubleClick?: (node: Node) => void;
  onNodePositionChange?: (nodes: Node[]) => void;
  onResetLayout?: () => void;
  studyPlanId?: string;
}

export function KnowledgeGraph({
  initialNodes,
  initialEdges,
  savedPositionIds = [],
  weekReading = '',
  onNodeClick,
  onNodeDoubleClick,
  onNodePositionChange,
  onResetLayout,
  studyPlanId,
}: KnowledgeGraphProps) {
  const router = useRouter();
  const graphRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges.map(styleEdge));

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filteredNodeTypes, setFilteredNodeTypes] = useState<Set<string>>(
    new Set(['book', 'passage', 'note', 'theme', 'person', 'place'])
  );
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<StudyMapLayout>('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapScope, setMapScope] = useState<'week' | 'all'>('week');
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(savedPositionIds));

  const layoutRef = useRef(layoutAlgorithm);
  layoutRef.current = layoutAlgorithm;
  const savedRef = useRef(savedIds);
  savedRef.current = savedIds;

  useEffect(() => {
    const ids = new Set(savedPositionIds);
    setSavedIds(ids);
    setNodes(positionsForLayout(initialNodes, initialEdges, layoutRef.current, ids));
  }, [initialNodes, initialEdges, savedPositionIds, setNodes]);

  useEffect(() => {
    setEdges(initialEdges.map(styleEdge));
  }, [initialEdges, setEdges]);

  const openItem = useCallback((node: Node) => {
    setSelectedNode(node);
    if (node.type === 'note') {
      const noteId = node.data.referenceId;
      if (typeof noteId === 'string' && noteId.length > 0) {
        router.push(`/notes?note=${encodeURIComponent(noteId)}`);
      }
    }
  }, [router]);

  const weekIds = useMemo(() => {
    if (mapScope !== 'week') return null;
    return selectWeekItemIds(
      nodes.map((node) => ({
        id: node.id,
        type: node.type,
        label: typeof node.data.label === 'string' ? node.data.label : undefined,
        reference: typeof node.data.reference === 'string' ? node.data.reference : undefined,
        bibleReferences: Array.isArray(node.data.bibleReferences) ? node.data.bibleReferences : undefined,
      })),
      edges.map((edge) => ({ source: edge.source, target: edge.target })),
      weekReading,
    );
  }, [mapScope, weekReading, nodes, edges]);

  const weekHasMatches = weekIds === null || weekIds.size > 0;

  const visibleNodes = useMemo(() => {
    return nodes.filter(node => {
      if (weekIds && !weekIds.has(node.id)) return false;
      const typeMatch = filteredNodeTypes.has(node.type || 'default');
      const searchMatch = searchQuery === '' ||
        node.data.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.data.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return typeMatch && searchMatch;
    });
  }, [nodes, filteredNodeTypes, searchQuery, weekIds]);

  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return edges.filter(edge =>
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, visibleNodes]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  }, [onNodeClick]);

  const handleNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    openItem(node);
    onNodeDoubleClick?.(node);
  }, [onNodeDoubleClick, openItem]);

  const handleFilterChange = useCallback((nodeType: string, enabled: boolean) => {
    setFilteredNodeTypes(prev => {
      const next = new Set(prev);
      if (enabled) {
        next.add(nodeType);
      } else {
        next.delete(nodeType);
      }
      return next;
    });
  }, []);

  const handleLayoutChange = useCallback((layout: StudyMapLayout) => {
    setLayoutAlgorithm(layout);
    setNodes((current) => positionsForLayout(current, edges, layout, savedIds));
    window.setTimeout(() => {
      flowRef.current?.fitView({ padding: 0.2, duration: 200 });
    }, 0);
  }, [edges, savedIds, setNodes]);

  const stats = useMemo(() => {
    const nodeTypeCounts = nodes.reduce((acc, node) => {
      const type = node.type || 'default';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const edgeTypeCounts = edges.reduce((acc, edge) => {
      const type = edge.type || 'default';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodeTypeCounts,
      edgeTypeCounts,
      visibleNodes: visibleNodes.length,
      visibleEdges: visibleEdges.length,
    };
  }, [nodes, edges, visibleNodes, visibleEdges]);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    const dragEndIds = changes.flatMap((change) => (
      change.type === 'position' && change.dragging === false ? [change.id] : []
    ));
    if (dragEndIds.length > 0) {
      setSavedIds((prev) => {
        const next = new Set(prev);
        for (const id of dragEndIds) next.add(id);
        return next;
      });
      if (onNodePositionChange) {
        setTimeout(() => {
          setNodes((currentNodes) => {
            onNodePositionChange(currentNodes);
            return currentNodes;
          });
        }, 0);
      }
    }
  }, [onNodesChange, onNodePositionChange, setNodes]);

  const handleExportJSON = useCallback(() => {
    exportGraphAsJSON(visibleNodes, visibleEdges);
  }, [visibleNodes, visibleEdges]);

  const handleExportCSV = useCallback(() => {
    exportGraphAsCSV(visibleNodes, visibleEdges);
  }, [visibleNodes, visibleEdges]);

  const handleExportPNG = useCallback(async () => {
    if (!graphRef.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(graphRef.current, {
        backgroundColor: '#faf7f2',
        quality: 1,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'study-map.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to save picture:', err);
    }
  }, []);

  return (
    <div className="w-full h-full relative" ref={graphRef}>
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onInit={(instance) => {
          flowRef.current = instance;
        }}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.1}
        maxZoom={4}
      >
        <Background color="var(--border-light)" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              book: 'var(--node-book)',
              passage: 'var(--node-passage)',
              note: 'var(--node-note)',
              theme: 'var(--node-theme)',
              person: 'var(--node-person)',
              place: 'var(--node-place)',
            };
            return colors[node.type || 'default'] || 'var(--border-medium)';
          }}
          nodeBorderRadius={2}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        <Panel position="top-left" className="m-4" style={{ overflow: 'visible' }}>
          <div
            className="p-4"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 8rem)',
            }}
          >
            <GraphControls
              filteredNodeTypes={filteredNodeTypes}
              onFilterChange={handleFilterChange}
              layoutAlgorithm={layoutAlgorithm}
              onLayoutChange={handleLayoutChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              mapScope={mapScope}
              onMapScopeChange={setMapScope}
              onExportJSON={handleExportJSON}
              onExportCSV={handleExportCSV}
              onExportPNG={handleExportPNG}
              onResetLayout={onResetLayout}
            />
          </div>
        </Panel>

        <Panel position="top-right" className="m-4">
          <div
            className="p-4"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 8rem)',
            }}
          >
            <GraphStats stats={stats} />
          </div>
        </Panel>
      </ReactFlow>

      {!weekHasMatches && nodes.length > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <div
            className="text-center pointer-events-auto p-6"
            style={{
              maxWidth: '420px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Nothing in this week&apos;s reading is on your study map yet. Your other notes are still here.
            </p>
            <button
              type="button"
              onClick={() => setMapScope('all')}
              className="btn-primary text-sm"
            >
              Show everything I&apos;ve studied
            </button>
          </div>
        </div>
      )}

      {selectedNode && (
        <NodeDetailsPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          studyPlanId={studyPlanId}
        />
      )}
    </div>
  );
}
