'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { getStudyPlan } from '@/data/studyPlans';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useGraphData } from '@/hooks/useGraphData';
import { useGraphPositions, clearPositions, getSavedPositions } from '@/hooks/useGraphPositions';
import { userHasNotes, generateGraphFromNotes } from '@/lib/graphGenerator';
import { queryKeys } from '@/lib/queryKeys';
import { GraphSkeleton } from '@/components/ui/GraphSkeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { StudyMapHint } from '@/components/graph/StudyMapHint';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';

const KnowledgeGraph = dynamic(
  () => import('@/components/graph/KnowledgeGraph').then((mod) => mod.KnowledgeGraph),
  { ssr: false, loading: () => <GraphSkeleton /> },
);

interface PageProps {
  params: Promise<{ planId: string; week: string }>;
}

export default function GraphPage({ params }: PageProps) {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { planId, week: weekParam } = use(params);
  const plan = getStudyPlan(planId);
  const weekNumber = parseInt(weekParam);
  const week = plan?.weeks.find((w) => w.week === weekNumber);

  const { data: graphData, isLoading, error: graphError } = useGraphData(user?.$id);
  const { savePositions } = useGraphPositions(user?.$id);
  const savedPositionIds = useMemo(() => {
    if (!user?.$id) return [] as string[];
    return Object.keys(getSavedPositions(user.$id));
  }, [user?.$id, graphData]);
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
      setError('Could not load your study map.');
      showToast('Could not load your study map.', 'error');
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
      showToast('Study map updated.', 'success');
    } catch (err) {
      console.error('Failed to build study map:', err);
      setError('Could not build your study map.');
      showToast('Could not build your study map.', 'error');
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

  if (!plan || !week) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <h1
            className="text-2xl mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontWeight: 500 }}
          >
            Week not found
          </h1>
          <Link href="/study" style={{ color: 'var(--accent)' }}>
            Back to Study Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header className="study-map-bar">
        <div className="study-map-bar-inner">
          <div className="flex items-center gap-6 min-w-0">
            <Link
              href={`/study/${planId}/${weekNumber}`}
              className="caps"
              style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', textDecoration: 'none' }}
            >
              &larr; Back
            </Link>
            <div className="min-w-0">
              <p className="caps study-map-kicker">
                Week {weekNumber}
              </p>
              <h1 className="study-map-title truncate">
                {week.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-5 flex-shrink-0">
            <Link
              href={`/study/${planId}`}
              className="caps"
              style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', textDecoration: 'none' }}
            >
              All Weeks &rarr;
            </Link>
            <ThemeToggle />
          </div>
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

      <div className="flex-shrink-0 px-6" style={{ maxWidth: 'var(--content-wide)', margin: '0 auto', width: '100%' }}>
        <FeedbackCard userId={user.$id} className="my-4" />
      </div>

      {graphData && graphData.nodes.length > 0 && <StudyMapHint />}

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        {isLoading ? (
          <GraphSkeleton />
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
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontWeight: 500 }}
                  >
                    Build your study map
                  </h3>
                  <p className="mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Your notes are ready. Build your study map to see how verses, themes, and notes connect.
                  </p>
                  <button
                    onClick={handleGenerateGraph}
                    disabled={generating}
                    className="btn-primary text-sm"
                    style={{ minWidth: '160px' }}
                  >
                    {generating ? 'Building...' : 'Build study map'}
                  </button>
                </>
              ) : (
                <>
                  <h3
                    className="text-xl mb-3"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontWeight: 500 }}
                  >
                    No Notes Yet
                  </h3>
                  <p className="mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Start by creating study notes with Bible references and tags. Your study map is built from those notes.
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
            savedPositionIds={savedPositionIds}
            weekReading={week.reading}
            studyPlanId={`${planId}-${weekNumber}`}
            onNodePositionChange={(nodes) => savePositions(nodes)}
            onResetLayout={() => {
              if (user) {
                clearPositions(user.$id);
                queryClient.invalidateQueries({ queryKey: queryKeys.graph.full(user.$id) });
                showToast('Layout reset.', 'info');
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
        Click an item to see details. Filters hide items without removing them.
      </div>
    </div>
  );
}
