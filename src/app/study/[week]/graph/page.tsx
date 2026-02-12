'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { KnowledgeGraph } from '@/components/graph/KnowledgeGraph';
import { getStudyWeek } from '@/data/studyPlan';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useGraphData } from '@/hooks/useGraphData';
import { useGraphPositions, clearPositions } from '@/hooks/useGraphPositions';
import { userHasNotes, generateGraphFromNotes } from '@/lib/graphGenerator';
import { queryKeys } from '@/lib/queryKeys';

interface PageProps {
  params: Promise<{ week: string }>;
}

export default function GraphPage({ params }: PageProps) {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const weekNumber = parseInt(resolvedParams.week);
  const week = getStudyWeek(weekNumber);

  const { data: graphData, isLoading, error: graphError } = useGraphData(user?.$id);
  const { savePositions } = useGraphPositions(user?.$id);
  const [hasNotes, setHasNotes] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (graphError) {
      setError('Failed to load graph data.');
      showToast('Failed to load graph data.', 'error');
    }
  }, [graphError, showToast]);

  useEffect(() => {
    async function checkNotes() {
      if (!user) return;
      try {
        const notesExist = await userHasNotes(user.$id);
        setHasNotes(notesExist);
      } catch {
        // Ignore - just affects empty state messaging
      }
    }
    if (user) {
      checkNotes();
    }
  }, [user]);

  const handleGenerateGraph = async () => {
    if (!user || generating) return;

    setGenerating(true);
    setError(null);
    try {
      await generateGraphFromNotes(user.$id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.graph.full(user.$id) });
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
        {isLoading ? (
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
            onNodePositionChange={(nodes) => savePositions(nodes)}
            onResetLayout={() => {
              if (user) {
                clearPositions(user.$id);
                queryClient.invalidateQueries({ queryKey: queryKeys.graph.full(user.$id) });
                showToast('Layout reset to default.', 'info');
              }
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
