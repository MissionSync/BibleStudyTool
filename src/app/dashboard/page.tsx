'use client';

import { SiteFooter } from '@/components/ui/SiteFooter';
import { AppNav } from '@/components/ui/AppNav';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStudyWeek, STUDY_PLAN } from '@/data/studyPlan';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import { useStudyProgress } from '@/hooks/useStudyProgress';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const { currentWeek: currentWeekNumber } = useStudyProgress();

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

  const currentWeek = getStudyWeek(currentWeekNumber) || STUDY_PLAN[0];

  return (
    <div className="min-h-screen animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AppNav onSignOut={handleLogout} />

      {/* Main Content */}
      <main className="content-narrow py-12">
        {/* Welcome */}
        <div className="mb-12">
          <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Welcome back, {user.name}
          </p>
          <h1
            className="text-3xl"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontWeight: 500 }}
          >
            Continue your study
          </h1>
        </div>

        <FeedbackCard userId={user.$id} className="mb-12" />

        {/* Current Week */}
        <section
          className="mb-12 p-6"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Week {currentWeek.week} of {STUDY_PLAN.length}
          </p>
          <h2
            className="text-2xl mb-3"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontWeight: 500 }}
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
              View study map
            </Link>
          </div>
        </section>

        {/* Quick Access */}
        <section>
          <h3
            className="text-lg mb-6"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontWeight: 500 }}
          >
            Quick access
          </h3>

          <div className="space-y-4">
            <Link
              href="/study"
              className="block p-5 transition-colors"
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
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
                borderRadius: 'var(--radius-lg)',
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
              href="/prayer"
              className="block p-5 transition-colors"
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                    Prayer Requests
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Share and support one another in prayer
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
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                    Study map
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    See how your notes and verses connect
                  </p>
                </div>
                <span style={{ color: 'var(--text-tertiary)' }}>&rarr;</span>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
