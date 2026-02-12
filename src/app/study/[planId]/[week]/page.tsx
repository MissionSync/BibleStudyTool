'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { getStudyPlan } from '@/data/studyPlans';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useStudyProgress } from '@/hooks/useStudyProgress';

interface PageProps {
  params: Promise<{ planId: string; week: string }>;
}

export default function WeekDetailPage({ params }: PageProps) {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const { planId, week: weekParam } = use(params);
  const plan = getStudyPlan(planId);
  const weekNumber = parseInt(weekParam);
  const week = plan?.weeks.find((w) => w.week === weekNumber);
  const { isWeekCompleted, markWeekComplete, unmarkWeekComplete } = useStudyProgress(
    planId,
    plan?.totalWeeks ?? 1
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
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
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
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

  const prevWeek = weekNumber > 1 ? plan.weeks.find((w) => w.week === weekNumber - 1) : null;
  const nextWeek = weekNumber < plan.totalWeeks ? plan.weeks.find((w) => w.week === weekNumber + 1) : null;

  return (
    <div className="min-h-screen animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav
        className="content-wide py-6 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-light)' }}
      >
        <Link
          href="/dashboard"
          className="text-lg tracking-wide"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', textDecoration: 'none' }}
        >
          Bible Notes Journal
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/study"
            className="text-sm transition-colors"
            style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--text-primary)', paddingBottom: '2px' }}
          >
            Study Plans
          </Link>
          <Link
            href="/notes"
            className="text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Notes
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="content-narrow py-12">
        {/* Back */}
        <Link
          href={`/study/${planId}`}
          className="inline-block mb-8 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          &larr; All weeks
        </Link>

        {/* Header */}
        <header className="mb-10">
          <p
            className="text-xs uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Week {week.week} of {plan.totalWeeks}
          </p>
          <h1
            className="text-3xl md:text-4xl mb-4"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            {week.title}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {week.reading}
          </p>
        </header>

        {/* Description */}
        {week.description && (
          <section
            className="mb-10 p-6"
            style={{
              backgroundColor: 'var(--highlight-sage)',
              borderRadius: '2px',
            }}
          >
            <p className="scripture" style={{ color: 'var(--text-primary)' }}>
              {week.description}
            </p>
          </section>
        )}

        {/* Actions */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/study/${planId}/${week.week}/graph`}
              className="btn-primary text-center"
            >
              View Knowledge Graph
            </Link>
            <Link
              href="/notes"
              className="btn-secondary text-center"
            >
              Create Note
            </Link>
            {isWeekCompleted(weekNumber) ? (
              <button
                onClick={() => {
                  unmarkWeekComplete(weekNumber);
                  showToast('Week marked as incomplete.', 'info');
                }}
                className="btn-secondary text-center"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Check size={16} />
                Completed
              </button>
            ) : (
              <button
                onClick={() => {
                  markWeekComplete(weekNumber);
                  showToast('Week marked as complete!', 'success');
                }}
                className="btn-secondary text-center"
              >
                Mark as Complete
              </button>
            )}
          </div>
        </section>

        {/* Divider */}
        <hr className="divider" />

        {/* Study Guidelines */}
        <section className="mb-12">
          <h2
            className="text-xl mb-6"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            Study guidelines
          </h2>
          <ul className="space-y-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <li>Read the passage slowly and carefully each day</li>
            <li>Look for key themes and how they connect to other passages</li>
            <li>Take notes on insights, questions, and applications</li>
            <li>Use the knowledge graph to discover connections</li>
            <li>Pray and meditate on what God is teaching you</li>
          </ul>
        </section>

        {/* Navigation */}
        <nav
          className="pt-8"
          style={{ borderTop: '1px solid var(--border-light)' }}
        >
          <div className="flex justify-between">
            {prevWeek ? (
              <Link
                href={`/study/${planId}/${prevWeek.week}`}
                className="text-sm transition-colors"
                style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                <span style={{ color: 'var(--text-tertiary)' }}>&larr;</span>{' '}
                Week {prevWeek.week}
              </Link>
            ) : (
              <span />
            )}

            {nextWeek ? (
              <Link
                href={`/study/${planId}/${nextWeek.week}`}
                className="text-sm transition-colors"
                style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                Week {nextWeek.week}{' '}
                <span style={{ color: 'var(--text-tertiary)' }}>&rarr;</span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </nav>
      </main>

      {/* Footer */}
      <footer
        className="py-12 text-center text-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <div>Bible Notes Journal</div>
        <div style={{ marginTop: '0.5rem' }}>
          developed by{' '}
          <a
            href="https://missionsynclab.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            MissionSync Lab
          </a>
        </div>
      </footer>
    </div>
  );
}
