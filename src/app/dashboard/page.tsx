'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStudyWeek, STUDY_PLAN } from '@/data/studyPlan';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useStudyProgress } from '@/hooks/useStudyProgress';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      showToast('Signed out locally, but network call failed.', 'info');
    }
    router.push('/');
  };

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

  const { currentWeek: currentWeekNumber } = useStudyProgress();
  const currentWeek = getStudyWeek(currentWeekNumber) || STUDY_PLAN[0];

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
            style={{ color: 'var(--text-secondary)' }}
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
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="text-sm transition-colors"
            style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', padding: 0 }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="content-narrow py-12">
        {/* Welcome */}
        <div className="mb-12">
          <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Welcome back, {user.name}
          </p>
          <h1
            className="text-3xl"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            Continue your study
          </h1>
        </div>

        {/* Current Week */}
        <section
          className="mb-12 p-6"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: '2px',
          }}
        >
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Week {currentWeek.week} of {STUDY_PLAN.length}
          </p>
          <h2
            className="text-2xl mb-3"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            {currentWeek.title}
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {currentWeek.reading}
          </p>
          <div className="flex gap-3">
            <Link href={`/study/nt/${currentWeek.week}`} className="btn-primary text-sm">
              Begin Reading
            </Link>
            <Link href={`/study/nt/${currentWeek.week}/graph`} className="btn-secondary text-sm">
              View Graph
            </Link>
          </div>
        </section>

        {/* Quick Access */}
        <section>
          <h3
            className="text-lg mb-6"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            Quick access
          </h3>

          <div className="space-y-4">
            <Link
              href="/study"
              className="block p-5 transition-colors"
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: '2px',
                textDecoration: 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                    Study Plans
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Multiple plans for deeper study
                  </p>
                </div>
                <span style={{ color: 'var(--text-tertiary)' }}>&rarr;</span>
              </div>
            </Link>

            <Link
              href="/notes"
              className="block p-5 transition-colors"
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: '2px',
                textDecoration: 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                    Study Notes
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Your reflections and insights
                  </p>
                </div>
                <span style={{ color: 'var(--text-tertiary)' }}>&rarr;</span>
              </div>
            </Link>

            <Link
              href="/study/nt/1/graph"
              className="block p-5 transition-colors"
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: '2px',
                textDecoration: 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                    Knowledge Graph
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Explore connections between passages and themes
                  </p>
                </div>
                <span style={{ color: 'var(--text-tertiary)' }}>&rarr;</span>
              </div>
            </Link>
          </div>
        </section>
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
