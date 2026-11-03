'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, NotebookPen, Sparkles, Waypoints, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SiteFooter } from '@/components/ui/SiteFooter';

const features: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: 'Knowledge Graph',
    icon: Waypoints,
    body: 'Visualize how passages, themes, and people interconnect. See relationships in Scripture you may have missed.',
  },
  {
    title: 'Study Notes',
    icon: NotebookPen,
    body: 'Capture insights with automatic Bible reference detection. Your reflections, searchable and organized.',
  },
  {
    title: 'Study Plans',
    icon: BookOpen,
    body: 'Follow guided weekly readings through the New Testament. Each week builds thematic connections.',
  },
  {
    title: 'Theme Discovery',
    icon: Sparkles,
    body: 'Explore how Love, Grace, Faith, and Redemption weave through different books and passages.',
  },
];

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
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="content-wide py-4 flex items-center justify-between gap-3">
          <span className="brand-name">
            Bible Notes Journal
          </span>
          <div className="flex items-center gap-3 sm:gap-6">
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

      <section
        className="content-wide"
        style={{ paddingTop: '8rem', paddingBottom: 'var(--space-4xl)' }}
      >
        <div
          className="flex flex-col items-center gap-12"
          style={{ maxWidth: '1100px', margin: '0 auto' }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 w-full">
            <div className="flex-1 text-center lg:text-left">
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
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
              <p className="hero-note">
                Free to use. Creating an account does not require payment.
              </p>
            </div>

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

      <section
        id="features"
        className="content-wide section"
        style={{ scrollMarginTop: '5rem' }}
      >
        <h2
          className="text-center"
          style={{
            fontFamily: 'var(--font-heading)',
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
            maxWidth: '56rem',
            margin: '0 auto',
          }}
        >
          {features.map(({ title, body, icon: Icon }) => (
            <div
              key={title}
              className="card"
              style={{
                padding: 'var(--space-lg)',
                transition: 'var(--transition-smooth)',
                cursor: 'default',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div className="feature-icon">
                <Icon aria-hidden="true" size={28} strokeWidth={1.75} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-primary)',
                  fontSize: '1.25rem',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                {title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="content-wide section"
        aria-labelledby="product-previews-heading"
      >
        <h2
          id="product-previews-heading"
          className="text-center"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '1.75rem',
            letterSpacing: '-0.02em',
            marginBottom: 'var(--space-md)',
          }}
        >
          Knowledge graph and study notes
        </h2>
        <p className="preview-note">
          Placeholders. These are not screenshots from a signed-in account.
        </p>
        <div className="preview-grid">
          <figure className="preview-card">
            <div
              className="preview-frame"
              role="img"
              aria-label="Placeholder for the knowledge graph. Not a captured screenshot."
            >
              <span className="preview-badge">Placeholder</span>
              <div className="placeholder-graph">
                <span className="placeholder-node">Passage</span>
                <span className="placeholder-node placeholder-node--center">Theme</span>
                <span className="placeholder-node">Note</span>
              </div>
            </div>
            <figcaption className="preview-caption">Knowledge graph</figcaption>
          </figure>
          <figure className="preview-card">
            <div
              className="preview-frame"
              role="img"
              aria-label="Placeholder for study notes. Not a captured screenshot."
            >
              <span className="preview-badge">Placeholder</span>
              <div className="placeholder-lines" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <figcaption className="preview-caption">Study notes</figcaption>
          </figure>
        </div>
      </section>

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

      <SiteFooter />
    </div>
  );
}
