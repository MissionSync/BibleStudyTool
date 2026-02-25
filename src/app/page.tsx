'use client';

import Link from 'next/link';
import Image from 'next/image';
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
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(250, 247, 242, 0.85)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="content-wide py-4 flex items-center justify-between">
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
          >
            biblenotes
          </span>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm transition-colors hidden sm:inline"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
            >
              Features
            </a>
            <Link
              href="/auth/login"
              className="text-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="btn-primary text-sm"
              style={{ padding: '0.625rem 1.25rem' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="content-wide"
        style={{ paddingTop: '8rem', paddingBottom: 'var(--space-4xl)' }}
      >
        <div
          className="flex flex-col items-center gap-12"
          style={{ maxWidth: '1100px', margin: '0 auto' }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 w-full">
            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  marginBottom: 'var(--space-lg)',
                }}
              >
                A quiet place for<br />Scripture and reflection
              </h1>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  maxWidth: '28rem',
                  margin: '0 auto',
                  marginBottom: 'var(--space-xl)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                }}
                className="lg:mx-0"
              >
                Discover connections between passages, themes, and people through
                interactive knowledge graphs. Keep your insights organized
                in a space designed for contemplation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
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
            </div>

            {/* Right: Illustration */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="animate-float" style={{ maxWidth: '420px', width: '100%' }}>
                <Image
                  src="/images/illustration.png"
                  alt="Bible study illustration"
                  width={420}
                  height={420}
                  priority
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="content-wide section"
        style={{ scrollMarginTop: '5rem' }}
      >
        <h2
          className="text-center"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '1.75rem',
            letterSpacing: '-0.02em',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          Tools for deeper study
        </h2>

        <div
          className="feature-grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            maxWidth: '56rem',
            margin: '0 auto',
          }}
        >
          <div
            className="card"
            style={{
              padding: 'var(--space-lg)',
              transition: 'var(--transition-smooth)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-sm)' }}>
              🔗
            </div>
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
            style={{
              padding: 'var(--space-lg)',
              transition: 'var(--transition-smooth)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-sm)' }}>
              📝
            </div>
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
            style={{
              padding: 'var(--space-lg)',
              transition: 'var(--transition-smooth)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-sm)' }}>
              📖
            </div>
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
            style={{
              padding: 'var(--space-lg)',
              transition: 'var(--transition-smooth)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-sm)' }}>
              ✨
            </div>
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
          paddingTop: '3rem',
          paddingBottom: '3rem',
        }}
      >
        <div className="content-wide">
          <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
            biblenotes
          </div>
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
        </div>
      </footer>
    </div>
  );
}
