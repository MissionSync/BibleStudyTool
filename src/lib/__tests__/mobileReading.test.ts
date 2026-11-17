import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  fixtureSharedNote,
  isDevMobileFixture,
  MOBILE_PREVIEW_SHARE_TOKEN,
} from '../mobileReadingFixture';
import { resolveThemePreference } from '../themePreference';

const css = readFileSync(
  path.resolve(process.cwd(), 'src/app/globals.css'),
  'utf8',
);
const sharePage = readFileSync(
  path.resolve(process.cwd(), 'src/app/share/[token]/page.tsx'),
  'utf8',
);

function channel(value: number): number {
  const scaled = value / 255;
  return scaled <= 0.04045
    ? scaled / 12.92
    : ((scaled + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const normalized = hex.replace('#', '');
  const expanded = normalized.length === 3
    ? normalized.split('').map((part) => part + part).join('')
    : normalized;
  const red = parseInt(expanded.slice(0, 2), 16);
  const green = parseInt(expanded.slice(2, 4), 16);
  const blue = parseInt(expanded.slice(4, 6), 16);
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function lightDarkTokens(source: string): Map<string, { light: string; dark: string }> {
  const tokens = new Map<string, { light: string; dark: string }>();
  const pattern = /--([a-z0-9-]+):\s*light-dark\(\s*(#[0-9a-fA-F]{3,8})\s*,\s*(#[0-9a-fA-F]{3,8})\s*\)/g;
  for (const match of source.matchAll(pattern)) {
    tokens.set(match[1], { light: match[2], dark: match[3] });
  }
  return tokens;
}

describe('mobile reading contrast', () => {
  const tokens = lightDarkTokens(css);

  const pairs = [
    ['text-primary', 'bg-primary'],
    ['text-secondary', 'bg-primary'],
    ['text-tertiary', 'bg-primary'],
    ['text-tertiary', 'bg-secondary'],
    ['text-secondary', 'bg-card'],
    ['text-primary', 'bg-card'],
    ['text-secondary', 'highlight-sage'],
    ['text-secondary', 'highlight-gold'],
    ['text-tertiary', 'highlight-sage'],
    ['accent', 'bg-primary'],
    ['error', 'bg-primary'],
    ['error', 'highlight-peach'],
  ] as const;

  it('keeps body and chip colors at or above WCAG AA in both schemes', () => {
    for (const [foreground, background] of pairs) {
      const ink = tokens.get(foreground);
      const surface = tokens.get(background);
      expect(ink, foreground).toBeTruthy();
      expect(surface, background).toBeTruthy();
      expect(contrastRatio(ink!.light, surface!.light), `${foreground} on ${background} light`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(ink!.dark, surface!.dark), `${foreground} on ${background} dark`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('matches color-scheme to the colors so a phone does not force the other palette', () => {
    expect(css).toMatch(/:root\s*\{[^}]*color-scheme:\s*light/);
    expect(css).toContain('color-scheme: dark');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain(':root:not([data-theme="light"])');
    expect(css).toContain('z-index: -1');
  });

  it('uses readable type, wrapping, and a stacked phone layout', () => {
    expect(css).toMatch(/\.reading-body\s*\{[^}]*font-size:\s*1\.125rem/);
    expect(css).toMatch(/\.reading-body\s*\{[^}]*line-height:\s*1\.6/);
    expect(css).toMatch(/\.note-excerpt\s*\{[^}]*font-size:\s*1rem/);
    expect(css).toMatch(/\.note-excerpt\s*\{[^}]*line-height:\s*1\.6/);
    expect(css).toMatch(/\.reading-title\s*\{[^}]*overflow-wrap:\s*anywhere/);
    expect(css).toMatch(/\.reading-title\s*\{[^}]*word-break:\s*break-word/);
    expect(css).toMatch(/\.verse-chip,\s*\.tag-chip,\s*\.archived-chip\s*\{[^}]*overflow-wrap:\s*anywhere/);
    expect(css).toMatch(/\.verse-chip,\s*\.tag-chip,\s*\.archived-chip\s*\{[^}]*word-break:\s*break-word/);

    const phone = css.slice(css.indexOf('@media (max-width: 640px)'));
    expect(phone).toContain('flex-direction: column');
    expect(phone).toContain('.note-actions { display: none; }');
    expect(phone).toContain('.note-menu { display: block;');
    expect(phone).toMatch(/\.verse-chip,\s*\.tag-chip,\s*\.archived-chip,\s*\.chip-more,\s*\.note-date,\s*\.reading-meta\s*\{[^}]*font-size:\s*1rem/);
  });
});

describe('mobile reading fixtures', () => {
  it('serves the preview note only in development', () => {
    const preview = fixtureSharedNote(MOBILE_PREVIEW_SHARE_TOKEN, 'development');
    expect(preview?.title.length).toBeGreaterThan(40);
    expect(preview?.bibleReferences.some((ref) => !ref.includes(' '))).toBe(true);
    expect(fixtureSharedNote(MOBILE_PREVIEW_SHARE_TOKEN, 'production')).toBeNull();
    expect(fixtureSharedNote(MOBILE_PREVIEW_SHARE_TOKEN, 'test')).toBeNull();
    expect(fixtureSharedNote('some-other-real-token', 'development')).toBeNull();
  });

  it('does not treat the notes preview query as a fixture outside development', () => {
    expect(isDevMobileFixture('development', 'fixture=1')).toBe(true);
    expect(isDevMobileFixture('development', 'fixture=1&view=editor')).toBe(true);
    expect(isDevMobileFixture('development', '')).toBe(false);
    expect(isDevMobileFixture('production', 'fixture=1')).toBe(false);
  });

  it('follows the system scheme until the reader chooses one', () => {
    expect(resolveThemePreference(null, true)).toEqual({ theme: 'dark', explicit: false });
    expect(resolveThemePreference(null, false)).toEqual({ theme: 'light', explicit: false });
    expect(resolveThemePreference('light', true)).toEqual({ theme: 'light', explicit: true });
    expect(resolveThemePreference('dark', false)).toEqual({ theme: 'dark', explicit: true });
    expect(resolveThemePreference('sepia', true)).toEqual({ theme: 'dark', explicit: false });
  });

  it('does not add an inline script to the shared note page', () => {
    expect(sharePage).not.toMatch(/<script/i);
    expect(sharePage).toContain('reading-body');
    expect(sharePage).toContain('verse-chip');
    expect(sharePage).toContain("FORBID_ATTR: ['style']");
  });
});
