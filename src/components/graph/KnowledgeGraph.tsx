// components/graph/KnowledgeGraph.tsx
'use client';

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { PassageNode } from './nodes/PassageNode';
import { NoteNode } from './nodes/NoteNode';
import { ThemeNode } from './nodes/ThemeNode';
import { PersonNode } from './nodes/PersonNode';
import { BookNode } from './nodes/BookNode';
import { GraphControls } from './GraphControls';
import { GraphStats } from './GraphStats';
import { NodeDetailsPanel } from './NodeDetailsPanel';

const nodeTypes = {
  passage: PassageNode,
  note: NoteNode,
  theme: ThemeNode,
  person: PersonNode,
  book: BookNode,
};

// Muted edge styles matching the contemplative design
const getEdgeStyle = (edgeType: string) => {
  const styles: Record<string, object> = {
    contains: {
      stroke: 'var(--border-medium)',
      strokeWidth: 1,
    },
    references: {
      stroke: 'var(--node-book)',
      strokeWidth: 1,
      strokeDasharray: '4,4',
    },
    theme_connection: {
      stroke: 'var(--node-theme)',
      strokeWidth: 1,
    },
    cross_reference: {
      stroke: 'var(--node-passage)',
      strokeWidth: 1,
      strokeDasharray: '3,3',
    },
    authored: {
      stroke: 'var(--node-person)',
      strokeWidth: 1,
    },
    about: {
      stroke: 'var(--node-note)',
      strokeWidth: 1,
    },
  };

  return styles[edgeType] || { stroke: 'var(--border-light)', strokeWidth: 1 };
};

interface KnowledgeGraphProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodeClick?: (node: Node) => void;
  onNodeDoubleClick?: (node: Node) => void;
  studyPlanId?: string;
}

export function KnowledgeGraph({
  initialNodes,
  initialEdges,
  onNodeClick,
  onNodeDoubleClick,
  studyPlanId,
}: KnowledgeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges.map(edge => ({
      ...edge,
      ...getEdgeStyle(edge.type || 'default'),
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
      },
    }))
  );

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filteredNodeTypes, setFilteredNodeTypes] = useState<Set<string>>(
    new Set(['book', 'passage', 'note', 'theme', 'person', 'place'])
  );
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'force' | 'hierarchical' | 'radial'>('force');
  const [searchQuery, setSearchQuery] = useState('');

  const visibleNodes = useMemo(() => {
    return nodes.filter(node => {
      const typeMatch = filteredNodeTypes.has(node.type || 'default');
      const searchMatch = searchQuery === '' ||
        node.data.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.data.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return typeMatch && searchMatch;
    });
  }, [nodes, filteredNodeTypes, searchQuery]);

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
    onNodeDoubleClick?.(node);
  }, [onNodeDoubleClick]);

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

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
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

        <Panel position="top-left" className="m-4">
          <div
            className="p-4"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '2px',
            }}
          >
            <GraphControls
              filteredNodeTypes={filteredNodeTypes}
              onFilterChange={handleFilterChange}
              layoutAlgorithm={layoutAlgorithm}
              onLayoutChange={setLayoutAlgorithm}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </Panel>

        <Panel position="top-right" className="m-4">
          <div
            className="p-4"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '2px',
            }}
          >
            <GraphStats stats={stats} />
          </div>
        </Panel>
      </ReactFlow>

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
