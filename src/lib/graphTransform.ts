import dagre from 'dagre';
import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';

export function mapEdgeType(dbEdgeType: string): string {
  const typeMap: Record<string, string> = {
    'references': 'contains',
    'theme_connection': 'theme_connection',
    'mentions': 'authored',
    'cross_ref': 'cross_reference',
  };
  return typeMap[dbEdgeType] || dbEdgeType;
}

export interface SimpleNode {
  $id: string;
  nodeType: string;
}

export interface SimpleEdge {
  source: string;
  target: string;
}

/**
 * Calculate node positions using Dagre hierarchical layout.
 * Uses edge information to produce connection-aware positioning.
 */
function calculateNodePositionsDagre(
  nodes: SimpleNode[],
  edges: SimpleEdge[],
): Map<string, { x: number; y: number }> {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 120 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.$id, { width: 180, height: 60 });
  }

  const nodeIds = new Set(nodes.map((n) => n.$id));
  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  dagre.layout(g);

  const positions = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    const dagreNode = g.node(node.$id);
    positions.set(node.$id, { x: dagreNode.x, y: dagreNode.y });
  }
  return positions;
}

/**
 * Calculate node positions using manual type-based layering.
 * Fallback when edges are not available.
 */
export function calculateNodePositionsManual(nodes: SimpleNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  const nodesByType: Record<string, SimpleNode[]> = {};
  nodes.forEach((node) => {
    const type = node.nodeType;
    if (!nodesByType[type]) nodesByType[type] = [];
    nodesByType[type].push(node);
  });

  const layers: { key: string; y: number; spacing: number }[] = [
    { key: 'note', y: 50, spacing: 200 },
    { key: 'book', y: 180, spacing: 180 },
    { key: 'passage', y: 320, spacing: 150 },
    { key: 'theme', y: 460, spacing: 120 },
    { key: 'person', y: 600, spacing: 150 },
    { key: 'place', y: 740, spacing: 150 },
  ];

  for (const layer of layers) {
    const typeNodes = nodesByType[layer.key] || [];
    const width = Math.max(800, typeNodes.length * layer.spacing);
    typeNodes.forEach((node, i) => {
      const x = (800 - width) / 2 + 100 + i * (width / Math.max(typeNodes.length, 1));
      positions.set(node.$id, { x, y: layer.y });
    });
  }

  const knownTypes = new Set(layers.map((l) => l.key));
  let otherY = 880;
  for (const type of Object.keys(nodesByType)) {
    if (knownTypes.has(type)) continue;
    const typeNodes = nodesByType[type];
    typeNodes.forEach((node, i) => {
      if (!positions.has(node.$id)) {
        positions.set(node.$id, { x: 100 + i * 150, y: otherY });
      }
    });
    otherY += 150;
  }

  return positions;
}

/**
 * Calculate node positions — uses Dagre when edges are provided, falls back to manual layering.
 */
export function calculateNodePositions(
  nodes: SimpleNode[],
  edges?: SimpleEdge[],
): Map<string, { x: number; y: number }> {
  if (edges && edges.length > 0) {
    try {
      return calculateNodePositionsDagre(nodes, edges);
    } catch {
      // Fallback to manual layout if Dagre fails
    }
  }
  return calculateNodePositionsManual(nodes);
}

export interface ThemeNodeData {
  $id: string;
  nodeType: 'theme';
  label: string;
  description: string;
  metadata: string;
}

export async function fetchThemeNodes(): Promise<ThemeNodeData[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.THEMES,
      [Query.limit(100)]
    );

    return response.documents.map((doc) => ({
      $id: doc.$id,
      nodeType: 'theme' as const,
      label: doc.name,
      description: doc.description,
      metadata: JSON.stringify({ color: doc.color }),
    }));
  } catch (error) {
    console.error('Failed to fetch themes:', error);
    return [];
  }
}
