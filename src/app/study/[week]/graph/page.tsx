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
import { useToast } from '@/contexts/ToastContext';
import { userHasNotes, generateGraphFromNotes } from '@/lib/graphGenerator';
import type { Node, Edge } from 'reactflow';

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

  // Notes at the top
  const notes = nodesByType['note'] || [];
  const noteWidth = Math.max(800, notes.length * 200);
  notes.forEach((node, i) => {
    const x = (800 - noteWidth) / 2 + 100 + i * (noteWidth / Math.max(notes.length, 1));
    positions.set(node.$id, { x, y: 50 });
  });

  // Books below notes
  const books = nodesByType['book'] || [];
  const bookWidth = Math.max(800, books.length * 180);
  books.forEach((node, i) => {
    const x = (800 - bookWidth) / 2 + 100 + i * (bookWidth / Math.max(books.length, 1));
    positions.set(node.$id, { x, y: 180 });
  });

  // Passages below books
  const passages = nodesByType['passage'] || [];
  const passageWidth = Math.max(800, passages.length * 150);
  passages.forEach((node, i) => {
    const x = (800 - passageWidth) / 2 + 100 + i * (passageWidth / Math.max(passages.length, 1));
    positions.set(node.$id, { x, y: 320 });
  });

  // Themes below passages
  const themes = nodesByType['theme'] || [];
  const themeWidth = Math.max(800, themes.length * 120);
  themes.forEach((node, i) => {
    const x = (800 - themeWidth) / 2 + 100 + i * (themeWidth / Math.max(themes.length, 1));
    positions.set(node.$id, { x, y: 460 });
  });

  // People below themes
  const people = nodesByType['person'] || [];
  const peopleWidth = Math.max(800, people.length * 150);
  people.forEach((node, i) => {
    const x = (800 - peopleWidth) / 2 + 100 + i * (peopleWidth / Math.max(people.length, 1));
    positions.set(node.$id, { x, y: 600 });
  });

  // Places below people
  const places = nodesByType['place'] || [];
  const placeWidth = Math.max(800, places.length * 150);
  places.forEach((node, i) => {
    const x = (800 - placeWidth) / 2 + 100 + i * (placeWidth / Math.max(places.length, 1));
    positions.set(node.$id, { x, y: 740 });
  });

  // Other types at the bottom
  const otherTypes = Object.keys(nodesByType).filter(t => !['note', 'book', 'passage', 'theme', 'person', 'place'].includes(t));
  let otherY = 880;
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

async function fetchGraphData(userId: string): Promise<{ nodes: Node[], edges: Edge[] }> {
  try {
    const dbNodes = await getUserGraphNodes(userId);
    const themeNodes = await fetchThemes();

    const allNodesForLayout: SimpleNode[] = [
      ...dbNodes.map(n => ({ $id: n.$id, nodeType: n.nodeType })),
      ...themeNodes.map(n => ({ $id: n.$id, nodeType: n.nodeType })),
    ];

    const dbEdges = await getUserGraphEdges(userId);
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
  const { showToast } = useToast();
  const router = useRouter();
  const resolvedParams = use(params);
  const weekNumber = parseInt(resolvedParams.week);
  const week = getStudyWeek(weekNumber);

  const [graphData, setGraphData] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNotes, setHasNotes] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadGraphData() {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        const data = await fetchGraphData(user.$id);
        setGraphData(data);

        // Check if user has notes (for empty state messaging)
        const notesExist = await userHasNotes(user.$id);
        setHasNotes(notesExist);
      } catch (err) {
        console.error('Failed to load graph data:', err);
        setGraphData({ nodes: [], edges: [] });
        setError('Failed to load graph data.');
        showToast('Failed to load graph data.', 'error');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadGraphData();
    }
  }, [weekNumber, user]);

  const handleGenerateGraph = async () => {
    if (!user || generating) return;

    setGenerating(true);
    setError(null);
    try {
      await generateGraphFromNotes(user.$id);
      // Reload graph data after generation
      const data = await fetchGraphData(user.$id);
      setGraphData(data);
      showToast('Knowledge graph generated.', 'success');
    } catch (err) {
      console.error('Failed to generate graph:', err);
      setError('Failed to generate graph.');
      showToast('Failed to generate graph.', 'error');
    } finally {
      setGenerating(false);
    }
  };

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

      {/* Error Banner */}
      {error && (
        <div
          className="flex-shrink-0 px-6 py-3"
          style={{
            backgroundColor: 'var(--highlight-peach)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <p className="text-sm text-center" style={{ color: 'var(--error)' }}>{error}</p>
        </div>
      )}

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
            <div className="text-center" style={{ maxWidth: '400px', padding: '2rem' }}>
              {hasNotes ? (
                <>
                  <h3
                    className="text-xl mb-3"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
                  >
                    Generate Your Knowledge Graph
                  </h3>
                  <p className="mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Your notes are ready to be visualized. Generate the knowledge graph to see connections between Bible passages, themes, and your study notes.
                  </p>
                  <button
                    onClick={handleGenerateGraph}
                    disabled={generating}
                    className="btn-primary text-sm"
                    style={{ minWidth: '160px' }}
                  >
                    {generating ? 'Generating...' : 'Generate Graph'}
                  </button>
                </>
              ) : (
                <>
                  <h3
                    className="text-xl mb-3"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
                  >
                    No Notes Yet
                  </h3>
                  <p className="mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Start by creating study notes with Bible references and tags. Your knowledge graph will be generated automatically from your notes.
                  </p>
                  <Link
                    href="/notes"
                    className="btn-primary text-sm inline-block"
                    style={{ minWidth: '160px', textDecoration: 'none' }}
                  >
                    Create Your First Note
                  </Link>
                </>
              )}
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
