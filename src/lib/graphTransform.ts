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

export function calculateNodePositions(nodes: SimpleNode[]): Map<string, { x: number; y: number }> {
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
