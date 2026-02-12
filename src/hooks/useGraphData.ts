'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllUserGraphNodes, parseNodeMetadata } from '@/lib/appwrite/graphNodes';
import { getAllUserGraphEdges } from '@/lib/appwrite/graphEdges';
import { queryKeys } from '@/lib/queryKeys';
import { mapEdgeType, calculateNodePositions, fetchThemeNodes, type SimpleNode } from '@/lib/graphTransform';
import { getSavedPositions } from '@/hooks/useGraphPositions';
import type { Node, Edge } from 'reactflow';

async function fetchFullGraphData(userId: string): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const dbNodes = await getAllUserGraphNodes(userId);
  const themeNodes = await fetchThemeNodes();

  const allNodesForLayout: SimpleNode[] = [
    ...dbNodes.map((n) => ({ $id: n.$id, nodeType: n.nodeType })),
    ...themeNodes.map((n) => ({ $id: n.$id, nodeType: n.nodeType })),
  ];

  const dbEdges = await getAllUserGraphEdges(userId);
  const positions = calculateNodePositions(allNodesForLayout);

  // Overlay saved positions from localStorage
  let savedPositions: Record<string, { x: number; y: number }> = {};
  if (typeof window !== 'undefined') {
    savedPositions = getSavedPositions(userId);
  }

  const graphNodesMapped: Node[] = dbNodes.map((dbNode) => {
    const metadata = parseNodeMetadata(dbNode) || {};
    const calculated = positions.get(dbNode.$id) || { x: Math.random() * 600, y: Math.random() * 400 };
    const position = savedPositions[dbNode.$id] || calculated;

    return {
      id: dbNode.$id,
      type: dbNode.nodeType,
      position,
      data: {
        label: dbNode.label,
        description: dbNode.description,
        ...metadata,
      },
    };
  });

  const themeNodesMapped: Node[] = themeNodes.map((themeNode) => {
    const metadata = themeNode.metadata ? JSON.parse(themeNode.metadata) : {};
    const calculated = positions.get(themeNode.$id) || { x: Math.random() * 600, y: Math.random() * 400 };
    const position = savedPositions[themeNode.$id] || calculated;

    return {
      id: themeNode.$id,
      type: 'theme',
      position,
      data: {
        label: themeNode.label,
        description: themeNode.description,
        ...metadata,
      },
    };
  });

  const edges: Edge[] = dbEdges.map((dbEdge) => ({
    id: dbEdge.$id,
    source: dbEdge.sourceNodeId,
    target: dbEdge.targetNodeId,
    type: mapEdgeType(dbEdge.edgeTyp),
  }));

  return { nodes: [...graphNodesMapped, ...themeNodesMapped], edges };
}

export function useGraphData(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.graph.full(userId ?? ''),
    queryFn: () => fetchFullGraphData(userId!),
    enabled: !!userId,
  });
}
