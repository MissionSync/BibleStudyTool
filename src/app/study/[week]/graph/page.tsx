'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { KnowledgeGraph } from '@/components/graph/KnowledgeGraph';
import { getStudyWeek } from '@/data/studyPlan';
import { getUserGraphNodes, parseNodeMetadata } from '@/lib/appwrite/graphNodes';
import { getUserGraphEdges } from '@/lib/appwrite/graphEdges';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '@/contexts/AuthContext';
import type { Node, Edge } from 'reactflow';

// System user ID used for seeded data
const SYSTEM_USER_ID = 'system';

// Map database edge types to UI edge types
function mapEdgeType(dbEdgeType: string): string {
  const typeMap: Record<string, string> = {
    'references': 'contains',
    'theme_connection': 'theme_connection',
    'mentions': 'authored',
    'cross_ref': 'cross_reference',
  };
  return typeMap[dbEdgeType] || dbEdgeType;
}

// Simplified node type for position calculation
interface SimpleNode {
  $id: string;
  nodeType: string;
}

// Calculate node positions using a simple radial layout
function calculateNodePositions(nodes: SimpleNode[]): Map<string, { x: number, y: number }> {
  const positions = new Map<string, { x: number, y: number }>();

  // Group nodes by type
  const nodesByType: Record<string, SimpleNode[]> = {};
  nodes.forEach(node => {
    const type = node.nodeType;
    if (!nodesByType[type]) nodesByType[type] = [];
    nodesByType[type].push(node);
  });

  // Position books at the top center
  const books = nodesByType['book'] || [];
  books.forEach((node, i) => {
    positions.set(node.$id, { x: 400 + i * 200, y: 50 });
  });

  // Position passages in the second row
  const passages = nodesByType['passage'] || [];
  const passageWidth = Math.max(800, passages.length * 150);
  passages.forEach((node, i) => {
    const x = (800 - passageWidth) / 2 + 100 + i * (passageWidth / Math.max(passages.length, 1));
    positions.set(node.$id, { x, y: 200 });
  });

  // Position themes in the third row
  const themes = nodesByType['theme'] || [];
  const themeWidth = Math.max(800, themes.length * 120);
  themes.forEach((node, i) => {
    const x = (800 - themeWidth) / 2 + 100 + i * (themeWidth / Math.max(themes.length, 1));
    positions.set(node.$id, { x, y: 380 });
  });

  // Position people at the bottom
  const people = nodesByType['person'] || [];
  people.forEach((node, i) => {
    positions.set(node.$id, { x: 200 + i * 250, y: 550 });
  });

  // Position any remaining nodes
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

// Theme node shape for internal use
interface ThemeNodeData {
  $id: string;
  nodeType: 'theme';
  label: string;
  description: string;
  metadata: string;
}

// Fetch themes to use as nodes
async function fetchThemes(): Promise<ThemeNodeData[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.THEMES,
      [Query.limit(100)]
    );

    // Transform themes to node-like objects
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

// Transform database data to ReactFlow format
async function fetchGraphData(): Promise<{ nodes: Node[], edges: Edge[] }> {
  try {
    // Fetch graph nodes for the system user
    const dbNodes = await getUserGraphNodes(SYSTEM_USER_ID);

    // Also fetch themes as nodes
    const themeNodes = await fetchThemes();

    // Combine all nodes for position calculation
    const allNodesForLayout: SimpleNode[] = [
      ...dbNodes.map(n => ({ $id: n.$id, nodeType: n.nodeType })),
      ...themeNodes.map(n => ({ $id: n.$id, nodeType: n.nodeType })),
    ];

    // Fetch edges
    const dbEdges = await getUserGraphEdges(SYSTEM_USER_ID);

    // Calculate positions
    const positions = calculateNodePositions(allNodesForLayout);

    // Transform graph nodes to ReactFlow format
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

    // Transform theme nodes to ReactFlow format
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

    // Transform edges to ReactFlow format
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

  // Redirect if not authenticated
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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  if (!week) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Week Not Found
          </h1>
          <Link
            href="/study"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Study Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/study/${weekNumber}`}
                className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Week {weekNumber}: {week.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {week.description || week.reading}
                </p>
              </div>
            </div>

            <Link
              href="/study"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              All Weeks →
            </Link>
          </div>
        </div>
      </header>

      {/* Graph Container */}
      <div className="flex-1 relative min-h-0">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Loading knowledge graph...</p>
            </div>
          </div>
        ) : !graphData || graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">No graph data available.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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

      {/* Info Footer */}
      <div className="bg-blue-50 dark:bg-gray-800 border-t border-blue-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
        <p className="text-sm text-blue-900 dark:text-blue-200 text-center">
          💡 <strong>Tip:</strong> Click nodes to see details • Double-click to expand relationships •
          Use filters to focus on specific content types
        </p>
      </div>
    </div>
  );
}
