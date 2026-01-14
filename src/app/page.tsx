'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav className="content-wide py-6 flex items-center justify-between">
        <span
          className="text-lg tracking-wide"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
        >
          Bible Notes Journal
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="text-sm tracking-wide transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="btn-primary text-sm"
          >
            Create Account
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="content-narrow text-center" style={{ paddingTop: 'var(--space-4xl)', paddingBottom: 'var(--space-4xl)' }}>
        <h1
          className="leading-tight"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--text-primary)',
            fontWeight: 400,
            fontSize: '2.25rem',
            marginBottom: 'var(--space-md)',
          }}
        >
          A quiet place for<br />Scripture and reflection
        </h1>
        <p
          className="leading-relaxed"
          style={{
            color: 'var(--text-secondary)',
            maxWidth: '30rem',
            margin: '0 auto',
            marginBottom: 'var(--space-xl)',
            fontSize: '1.0625rem',
            lineHeight: 1.7,
          }}
        >
          Discover connections between passages, themes, and people through
          interactive knowledge graphs. Keep your insights organized
          in a space designed for contemplation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup" className="btn-primary">
            Begin Your Study
          </Link>
          <Link
            href="/auth/login"
            className="btn-secondary"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="content-narrow">
        <hr className="divider" style={{ margin: 0 }} />
      </div>

      {/* Features - Typography Driven */}
      <section className="content-narrow section">
        <h2
          className="text-center"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--text-primary)',
            fontWeight: 400,
            fontSize: '1.5rem',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          Tools for deeper study
        </h2>

        <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div
            className="card"
            style={{ padding: 'var(--space-lg)' }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                marginBottom: 'var(--space-sm)',
              }}
            >
              Knowledge Graph
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              Visualize how passages, themes, and people interconnect.
              See relationships in Scripture you may have missed.
            </p>
          </div>

          <div
            className="card"
            style={{ padding: 'var(--space-lg)' }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                marginBottom: 'var(--space-sm)',
              }}
            >
              Study Notes
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              Capture insights with automatic Bible reference detection.
              Your reflections, searchable and organized.
            </p>
          </div>

          <div
            className="card"
            style={{ padding: 'var(--space-lg)' }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                marginBottom: 'var(--space-sm)',
              }}
            >
              Study Plans
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              Follow guided weekly readings through the New Testament.
              Each week builds thematic connections.
            </p>
          </div>

          <div
            className="card"
            style={{ padding: 'var(--space-lg)' }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                marginBottom: 'var(--space-sm)',
              }}
            >
              Theme Discovery
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              Explore how Love, Grace, Faith, and Redemption
              weave through different books and passages.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="section-lg"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          marginTop: 'var(--space-3xl)',
        }}
      >
        <div className="content-narrow text-center">
          <p
            className="scripture italic"
            style={{
              color: 'var(--text-primary)',
              fontSize: '1.375rem',
              marginBottom: 'var(--space-md)',
            }}
          >
            &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
          </p>
          <p
            className="scripture-reference"
            style={{ marginBottom: 'var(--space-xl)' }}
          >
            Psalm 119:105
          </p>
          <Link href="/auth/signup" className="btn-primary">
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-center text-sm"
        style={{
          borderTop: '1px solid var(--border-light)',
          color: 'var(--text-tertiary)',
          paddingTop: 'var(--space-xl)',
          paddingBottom: 'var(--space-xl)',
        }}
      >
        <div className="content-wide">
          Bible Notes Journal
        </div>
      </footer>
    </div>
  );
}
