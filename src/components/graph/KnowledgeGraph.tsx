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

// Custom node types
const nodeTypes = {
  passage: PassageNode,
  note: NoteNode,
  theme: ThemeNode,
  person: PersonNode,
  book: BookNode,
};

// Edge styling by type
const getEdgeStyle = (edgeType: string) => {
  const styles: Record<string, any> = {
    contains: {
      stroke: '#94a3b8',
      strokeWidth: 2,
    },
    references: {
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDasharray: '5,5',
    },
    theme_connection: {
      stroke: '#8b5cf6',
      strokeWidth: 2,
    },
    cross_reference: {
      stroke: '#10b981',
      strokeWidth: 2,
      strokeDasharray: '3,3',
    },
    authored: {
      stroke: '#f59e0b',
      strokeWidth: 2,
    },
    about: {
      stroke: '#ef4444',
      strokeWidth: 2,
    },
  };
  
  return styles[edgeType] || { stroke: '#cbd5e1', strokeWidth: 1 };
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
        width: 20,
        height: 20,
      },
    }))
  );

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filteredNodeTypes, setFilteredNodeTypes] = useState<Set<string>>(
    new Set(['book', 'passage', 'note', 'theme', 'person', 'place'])
  );
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'force' | 'hierarchical' | 'radial'>('force');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter nodes based on selected types and search
  const visibleNodes = useMemo(() => {
    return nodes.filter(node => {
      const typeMatch = filteredNodeTypes.has(node.type || 'default');
      const searchMatch = searchQuery === '' || 
        node.data.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.data.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return typeMatch && searchMatch;
    });
  }, [nodes, filteredNodeTypes, searchQuery]);

  // Filter edges to only show connections between visible nodes
  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, visibleNodes]);

  // Handle node selection
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  }, [onNodeClick]);

  const handleNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    onNodeDoubleClick?.(node);
  }, [onNodeDoubleClick]);

  // Handle filter changes
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

  // Calculate graph statistics
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
        <Background color="#e2e8f0" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              book: '#3b82f6',
              passage: '#10b981',
              note: '#f59e0b',
              theme: '#8b5cf6',
              person: '#ef4444',
              place: '#06b6d4',
            };
            return colors[node.type || 'default'] || '#94a3b8';
          }}
          nodeBorderRadius={8}
          maskColor="rgba(0, 0, 0, 0.2)"
        />
        
        <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-4 m-4">
          <GraphControls
            filteredNodeTypes={filteredNodeTypes}
            onFilterChange={handleFilterChange}
            layoutAlgorithm={layoutAlgorithm}
            onLayoutChange={setLayoutAlgorithm}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </Panel>

        <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-4 m-4">
          <GraphStats stats={stats} />
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
