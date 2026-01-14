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
      <section className="content-narrow pt-24 pb-20 text-center">
        <h1
          className="text-4xl md:text-5xl mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
        >
          A quiet place for<br />Scripture and reflection
        </h1>
        <p
          className="text-lg mb-10 leading-relaxed"
          style={{ color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto 2.5rem' }}
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
        <hr className="divider" />
      </div>

      {/* Features - Typography Driven */}
      <section className="content-narrow py-16">
        <h2
          className="text-2xl mb-12 text-center"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
        >
          Tools for deeper study
        </h2>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
          <div>
            <h3
              className="text-lg mb-2"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              Knowledge Graph
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Visualize how passages, themes, and people interconnect.
              See relationships in Scripture you may have missed.
            </p>
          </div>

          <div>
            <h3
              className="text-lg mb-2"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              Study Notes
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Capture insights with automatic Bible reference detection.
              Your reflections, searchable and organized.
            </p>
          </div>

          <div>
            <h3
              className="text-lg mb-2"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              Study Plans
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Follow guided weekly readings through the New Testament.
              Each week builds thematic connections.
            </p>
          </div>

          <div>
            <h3
              className="text-lg mb-2"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              Theme Discovery
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Explore how Love, Grace, Faith, and Redemption
              weave through different books and passages.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 mt-8"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="content-narrow text-center">
          <p
            className="scripture text-xl md:text-2xl mb-8 italic"
            style={{ color: 'var(--text-primary)' }}
          >
            &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
          </p>
          <p
            className="scripture-reference mb-8"
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
        className="py-8 text-center text-sm"
        style={{ borderTop: '1px solid var(--border-light)', color: 'var(--text-tertiary)' }}
      >
        <div className="content-wide">
          Bible Notes Journal
        </div>
      </footer>
    </div>
  );
}
