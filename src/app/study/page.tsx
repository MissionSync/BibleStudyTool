'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllStudyPlans } from '@/data/studyPlans';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useStudyProgress } from '@/hooks/useStudyProgress';

function PlanCard({ plan }: { plan: { id: string; title: string; description: string; totalWeeks: number } }) {
  const { completedWeeks } = useStudyProgress(plan.id, plan.totalWeeks);
  const progressPercentage = Math.round((completedWeeks.length / plan.totalWeeks) * 100);

  return (
    <Link
      href={`/study/${plan.id}`}
      className="block p-6 transition-colors"
      style={{
        border: '1px solid var(--border-light)',
        borderRadius: '2px',
        textDecoration: 'none',
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2
            className="text-2xl mb-2"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            {plan.title}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {plan.description}
          </p>
        </div>
        <span style={{ color: 'var(--text-tertiary)' }}>&rarr;</span>
      </div>

      <div
        className="p-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '2px',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {completedWeeks.length} of {plan.totalWeeks} weeks completed
          </span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {progressPercentage}%
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
    </Link>
  );
}

export default function StudyPlansPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const plans = getAllStudyPlans();

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
          Study Plans
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Choose a study plan to begin or continue your journey
        </p>
      </header>

      {/* Plan Cards */}
      <main className="content-narrow pb-16">
        <div className="space-y-6">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
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
            <li>You can work through multiple plans simultaneously</li>
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
