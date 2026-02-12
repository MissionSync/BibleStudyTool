'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { STUDY_PLAN } from '@/data/studyPlan';
import { Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useStudyProgress } from '@/hooks/useStudyProgress';

export default function StudyPlanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { currentWeek, isWeekCompleted, completedWeeks } = useStudyProgress();
  const progressPercentage = Math.round((completedWeeks.length / 38) * 100);

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
          <span
            className="text-sm"
            style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--text-primary)', paddingBottom: '2px' }}
          >
            Study Plans
          </span>
          <Link
            href="/notes"
            className="text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Notes
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Header */}
      <header className="content-narrow py-12">
        <Link
          href="/dashboard"
          className="inline-block mb-6 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          &larr; Dashboard
        </Link>

        <h1
          className="text-3xl mb-3"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
        >
          New Testament Study Plan
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          38 weeks through the entire New Testament
        </p>

        {/* Progress */}
        <div
          className="p-5"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: '2px',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {completedWeeks.length} of 38 weeks completed
            </span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {progressPercentage}% complete
            </span>
          </div>
          <div
            className="h-1 w-full"
            style={{ backgroundColor: 'var(--border-light)', borderRadius: '2px' }}
          >
            <div
              className="h-1 transition-all"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: 'var(--accent)',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      </header>

      {/* Study Plan List */}
      <main className="content-narrow pb-16">
        <div className="space-y-1">
          {STUDY_PLAN.map((week) => {
            const isCurrent = week.week === currentWeek;
            const isCompleted = isWeekCompleted(week.week);

            return (
              <Link
                key={week.week}
                href={`/study/${week.week}`}
                className="block py-5 transition-colors"
                style={{
                  borderBottom: '1px solid var(--border-light)',
                  textDecoration: 'none',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {isCompleted && (
                        <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      )}
                      <span
                        className="text-xs uppercase tracking-wider"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Week {week.week}
                      </span>
                      {isCurrent && !isCompleted && (
                        <span
                          className="text-xs px-2 py-0.5"
                          style={{
                            backgroundColor: 'var(--highlight-gold)',
                            color: 'var(--text-primary)',
                            borderRadius: '2px',
                          }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    <h3
                      className="text-lg mb-1"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--text-primary)',
                        fontWeight: 400,
                      }}
                    >
                      {week.title}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {week.reading}
                    </p>
                  </div>
                  <span style={{ color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>&rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Guidelines */}
      <section
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-light)',
          marginTop: '2rem',
        }}
      >
        <div className="content-narrow" style={{ padding: '3rem 1.5rem' }}>
          <h2
            className="text-xl"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--text-primary)',
              fontWeight: 400,
              marginBottom: '1.5rem',
            }}
          >
            Study guidelines
          </h2>
          <ul className="space-y-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <li>Each reading is designed to be studied over 7 days</li>
            <li>Take time to reflect, take notes, and explore connections</li>
            <li>Use the knowledge graph to visualize relationships</li>
            <li>After completing all 38 weeks, revisit sections as needed</li>
          </ul>
        </div>
      </section>

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
