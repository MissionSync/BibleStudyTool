'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KnowledgeGraph } from '@/components/graph/KnowledgeGraph';
import { getStudyWeek } from '@/data/studyPlan';
import { getUserGraphNodes, parseNodeMetadata } from '@/lib/appwrite/graphNodes';
import { getUserGraphEdges } from '@/lib/appwrite/graphEdges';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '@/contexts/AuthContext';
import type { Node, Edge } from 'reactflow';

const SYSTEM_USER_ID = 'system';

function mapEdgeType(dbEdgeType: string): string {
  const typeMap: Record<string, string> = {
    'references': 'contains',
    'theme_connection': 'theme_connection',
    'mentions': 'authored',
    'cross_ref': 'cross_reference',
  };
  return typeMap[dbEdgeType] || dbEdgeType;
}

interface SimpleNode {
  $id: string;
  nodeType: string;
}

function calculateNodePositions(nodes: SimpleNode[]): Map<string, { x: number, y: number }> {
  const positions = new Map<string, { x: number, y: number }>();

  const nodesByType: Record<string, SimpleNode[]> = {};
  nodes.forEach(node => {
    const type = node.nodeType;
    if (!nodesByType[type]) nodesByType[type] = [];
    nodesByType[type].push(node);
  });

  const books = nodesByType['book'] || [];
  books.forEach((node, i) => {
    positions.set(node.$id, { x: 400 + i * 200, y: 50 });
  });

  const passages = nodesByType['passage'] || [];
  const passageWidth = Math.max(800, passages.length * 150);
  passages.forEach((node, i) => {
    const x = (800 - passageWidth) / 2 + 100 + i * (passageWidth / Math.max(passages.length, 1));
    positions.set(node.$id, { x, y: 200 });
  });

  const themes = nodesByType['theme'] || [];
  const themeWidth = Math.max(800, themes.length * 120);
  themes.forEach((node, i) => {
    const x = (800 - themeWidth) / 2 + 100 + i * (themeWidth / Math.max(themes.length, 1));
    positions.set(node.$id, { x, y: 380 });
  });

  const people = nodesByType['person'] || [];
  people.forEach((node, i) => {
    positions.set(node.$id, { x: 200 + i * 250, y: 550 });
  });

  const otherTypes = Object.keys(nodesByType).filter(t => !['book', 'passage', 'theme', 'person'].includes(t));
  let otherY = 700;
  otherTypes.forEach(type => {
    const typeNodes = nodesByType[type];
    typeNodes.forEach((node, i) => {
      if (!positions.has(node.$id)) {
        positions.set(node.$id, { x: 100 + i * 150, y: otherY });
      }
    });
    otherY += 150;
  });

  return positions;
}

interface ThemeNodeData {
  $id: string;
  nodeType: 'theme';
  label: string;
  description: string;
  metadata: string;
}

async function fetchThemes(): Promise<ThemeNodeData[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.THEMES,
      [Query.limit(100)]
    );

    return response.documents.map(doc => ({
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

async function fetchGraphData(): Promise<{ nodes: Node[], edges: Edge[] }> {
  try {
    const dbNodes = await getUserGraphNodes(SYSTEM_USER_ID);
    const themeNodes = await fetchThemes();

    const allNodesForLayout: SimpleNode[] = [
      ...dbNodes.map(n => ({ $id: n.$id, nodeType: n.nodeType })),
      ...themeNodes.map(n => ({ $id: n.$id, nodeType: n.nodeType })),
    ];

    const dbEdges = await getUserGraphEdges(SYSTEM_USER_ID);
    const positions = calculateNodePositions(allNodesForLayout);

    const graphNodesMapped: Node[] = dbNodes.map(dbNode => {
      const metadata = parseNodeMetadata(dbNode) || {};
      const position = positions.get(dbNode.$id) || { x: Math.random() * 600, y: Math.random() * 400 };

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

    const themeNodesMapped: Node[] = themeNodes.map(themeNode => {
      const metadata = themeNode.metadata ? JSON.parse(themeNode.metadata) : {};
      const position = positions.get(themeNode.$id) || { x: Math.random() * 600, y: Math.random() * 400 };

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

    const edges: Edge[] = dbEdges.map(dbEdge => ({
      id: dbEdge.$id,
      source: dbEdge.sourceNodeId,
      target: dbEdge.targetNodeId,
      type: mapEdgeType(dbEdge.edgeTyp),
    }));

    return { nodes: [...graphNodesMapped, ...themeNodesMapped], edges };
  } catch (error) {
    console.error('Failed to fetch graph data:', error);
    return { nodes: [], edges: [] };
  }
}

interface PageProps {
  params: Promise<{ week: string }>;
}

export default function GraphPage({ params }: PageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const weekNumber = parseInt(resolvedParams.week);
  const week = getStudyWeek(weekNumber);

  const [graphData, setGraphData] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadGraphData() {
      setLoading(true);
      try {
        const data = await fetchGraphData();
        setGraphData(data);
      } catch (error) {
        console.error('Failed to load graph data:', error);
        setGraphData({ nodes: [], edges: [] });
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadGraphData();
    }
  }, [weekNumber, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!week) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <h1
            className="text-2xl mb-4"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            Week not found
          </h1>
          <Link href="/study" style={{ color: 'var(--accent)' }}>
            Back to Study Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header
        className="flex-shrink-0 py-4 px-6"
        style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)' }}
      >
        <div className="flex items-center justify-between" style={{ maxWidth: 'var(--content-wide)', margin: '0 auto' }}>
          <div className="flex items-center gap-6">
            <Link
              href={`/study/${weekNumber}`}
              className="text-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              &larr; Back
            </Link>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Week {weekNumber}
              </p>
              <h1
                className="text-xl"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
              >
                {week.title}
              </h1>
            </div>
          </div>

          <Link
            href="/study"
            className="text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            All Weeks &rarr;
          </Link>
        </div>
      </header>

      {/* Graph Container */}
      <div className="flex-1 relative min-h-0">
        {loading ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="text-center">
              <div className="spinner mx-auto mb-4" />
              <p style={{ color: 'var(--text-secondary)' }}>Loading knowledge graph...</p>
            </div>
          </div>
        ) : !graphData || graphData.nodes.length === 0 ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="text-center">
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>No graph data available.</p>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Run the seed script to populate the knowledge graph.
              </p>
            </div>
          </div>
        ) : (
          <KnowledgeGraph
            initialNodes={graphData.nodes}
            initialEdges={graphData.edges}
            studyPlanId={weekNumber.toString()}
            onNodeClick={(node) => {
              console.log('Node clicked:', node);
            }}
            onNodeDoubleClick={(node) => {
              console.log('Node double-clicked:', node);
            }}
          />
        )}
      </div>

      {/* Tip Footer */}
      <div
        className="flex-shrink-0 px-4 py-3 text-center text-sm"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderTop: '1px solid var(--border-light)',
          color: 'var(--text-secondary)',
        }}
      >
        Click nodes to see details. Use filters to focus on specific content types.
      </div>
    </div>
  );
}
