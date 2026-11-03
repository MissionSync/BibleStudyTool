'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const LINKS = [
  { href: '/study', label: 'Study Plans', id: 'study' },
  { href: '/notes', label: 'Notes', id: 'notes' },
  { href: '/prayer', label: 'Prayer', id: 'prayer' },
] as const;

export type AppNavSection = (typeof LINKS)[number]['id'];

export function AppNav({
  active,
  onSignOut,
}: {
  active?: AppNavSection;
  onSignOut?: () => void;
}) {
  return (
    <nav className="app-nav">
      <div className="content-wide app-nav-inner">
        <Link href="/dashboard" className="brand-mark">
          Bible Notes Journal
        </Link>
        <div className="app-nav-links">
          {LINKS.map((link) =>
            active === link.id ? (
              <span key={link.id} className="app-nav-link is-active" aria-current="page">
                {link.label}
              </span>
            ) : (
              <Link key={link.id} href={link.href} className="app-nav-link">
                {link.label}
              </Link>
            ),
          )}
          <ThemeToggle />
          {onSignOut && (
            <button type="button" className="app-nav-link" onClick={onSignOut}>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
