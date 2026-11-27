'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Ornament } from '@/components/ui/Ornament';

const features = [
  {
    title: 'Knowledge Graph',
    body: 'Visualize how passages, themes, and people interconnect. See relationships in Scripture you may have missed.',
  },
  {
    title: 'Study Notes',
    body: 'Capture insights with automatic Bible reference detection. Your reflections, searchable and organized.',
  },
  {
    title: 'Study Plans',
    body: 'Follow guided weekly readings through the New Testament. Each week builds thematic connections.',
  },
  {
    title: 'Theme Discovery',
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
    <div className="min-h-screen animate-fade-in">
      <header className="mast">
        <div className="wrap mast-inner">
          <div className="mast-left caps">
            <a href="#features" className="mast-link">Features</a>
          </div>
          <Link href="/" className="brand-mark">Bible Notes Journal</Link>
          <div className="mast-right caps">
            <ThemeToggle />
            <Link href="/auth/login" className="mast-link mast-signin">Sign In</Link>
            <Link href="/auth/signup" className="btn-ghost">Get Started</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <Ornament>Bible Notes Journal</Ornament>
          <h1>
            A quiet place for
            <br />
            <em>Scripture</em> and reflection
          </h1>
          <p className="lede">
            Discover connections between passages, themes, and people through
            interactive knowledge graphs. Keep your insights organized in a space
            designed for contemplation.
          </p>
          <div className="hero-actions caps">
            <Link href="/auth/signup" className="btn-primary">Begin Your Study</Link>
            <Link href="/auth/login" className="text-link">Sign In</Link>
          </div>
          <p className="hero-note">
            Free to use. Creating an account does not require payment.
          </p>
          <div className="stage">
            <div className="arch">
              <div className="arch-in">
                <Image
                  src="/images/bnj-illustration.png"
                  alt="Open book with a quill"
                  width={640}
                  height={640}
                  priority
                />
              </div>
            </div>
          </div>
          <div className="tool-band caps">
            <span>Knowledge Graph</span>
            <b>·</b>
            <span>Study Notes</span>
            <b>·</b>
            <span>Study Plans</span>
            <b>·</b>
            <span>Theme Discovery</span>
          </div>
        </div>
      </section>

      <section className="feature-section" id="features">
        <div className="wrap">
          <div className="section-intro">
            <div className="section-kicker caps">What&apos;s inside</div>
            <h2>Tools for deeper study</h2>
          </div>
          <div className="feature-split">
            <article className="feature-item">
              <span className="feature-num" aria-hidden="true">1</span>
              <h3>{features[0].title}</h3>
              <p>{features[0].body}</p>
            </article>
            <div className="feature-gutter" aria-hidden="true" />
            {features.slice(1).map((feature, index) => (
              <article className="feature-item" key={feature.title}>
                <span className="feature-num" aria-hidden="true">{index + 2}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="study-section" aria-labelledby="product-previews-heading">
        <div className="wrap">
          <div className="section-intro">
            <div className="section-kicker caps">From the study</div>
            <h2 id="product-previews-heading">Knowledge graph and study notes</h2>
          </div>
          <div className="preview-stack">
            <figure className="preview-card">
              <Image
                src="/images/study-map.webp"
                alt="Study map of 1 John centered on the note Christ our Advocate, linked to themes such as Doing and Abiding, Little Children, Do Not Love the World, and Deceivers, and to the passage 1 John 2:2–4."
                width={690}
                height={240}
                sizes="(min-width: 1024px) 56rem, 100vw"
                className="preview-shot"
              />
              <figcaption className="preview-caption">1 John study map</figcaption>
            </figure>
            <figure className="preview-card preview-card--notes">
              <Image
                src="/images/study-notes.webp"
                alt="Study notes list with How great a Love, Christ our Advocate, and Word of Life. Each note shows a reflection, Bible references, tags, and the date, with note-taking tips below."
                width={1120}
                height={1113}
                sizes="(min-width: 768px) 40rem, 100vw"
                className="preview-shot"
              />
              <figcaption className="preview-caption">Study notes</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="verse-wrap">
        <div className="wrap">
          <div className="verse-panel">
            <i className="corner corner-tl" aria-hidden="true" />
            <i className="corner corner-tr" aria-hidden="true" />
            <i className="corner corner-bl" aria-hidden="true" />
            <i className="corner corner-br" aria-hidden="true" />
            <blockquote>
              &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
            </blockquote>
            <cite className="caps">Psalm 119:105</cite>
            <Link href="/auth/signup" className="btn-gold">Start Your Journey</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
