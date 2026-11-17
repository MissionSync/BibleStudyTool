import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import nextConfig from '../../../next.config';
import { config, proxy } from '../../proxy';
import {
  buildShareContentSecurityPolicy,
  createShareNonce,
} from '../shareCsp';

function directive(policy: string, name: string): string {
  const found = policy
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .find((part) => part === name || part.startsWith(`${name} `));
  if (!found) {
    throw new Error(`missing ${name} in ${policy}`);
  }
  return found;
}

describe('share page CSP', () => {
  it('creates a nonce Next.js can parse from script-src', () => {
    const nonce = createShareNonce();
    expect(nonce).toMatch(/^[A-Za-z0-9+/_-]+={0,2}$/);
    expect(createShareNonce()).not.toBe(nonce);
  });

  it('sets a per-request nonce on /share and does not allow unsafe-inline scripts', () => {
    const first = proxy(
      new NextRequest('https://notes.example/share/abcdefghijklmnopqrst'),
    );
    const second = proxy(
      new NextRequest('https://notes.example/share/abcdefghijklmnopqrst'),
    );

    const csp = first.headers.get('content-security-policy');
    expect(csp).toBeTruthy();

    const scriptSrc = directive(csp!, 'script-src');
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain('unsafe-inline');
    expect(scriptSrc).not.toContain('unsafe-eval');

    const nonce = scriptSrc.match(/'nonce-([^']+)'/)?.[1];
    expect(nonce).toMatch(/^[A-Za-z0-9+/_-]+={0,2}$/);
    expect(first.headers.get('x-middleware-request-x-nonce')).toBe(nonce);
    expect(
      first.headers.get('x-middleware-request-content-security-policy'),
    ).toBe(csp);
    expect(second.headers.get('content-security-policy')).not.toBe(csp);

    expect(directive(csp!, 'default-src')).toBe("default-src 'self'");
    expect(directive(csp!, 'style-src')).toBe(
      "style-src 'self' 'unsafe-inline'",
    );
    expect(directive(csp!, 'worker-src')).toBe("worker-src 'self'");
  });

  it('adds unsafe-eval for scripts only in development', () => {
    const policy = buildShareContentSecurityPolicy('abc123', true);
    const scriptSrc = directive(policy, 'script-src');
    expect(scriptSrc).toBe(
      "script-src 'self' 'nonce-abc123' 'strict-dynamic' 'unsafe-eval'",
    );
    expect(scriptSrc).not.toContain('unsafe-inline');
    expect(directive(policy, 'style-src')).toBe(
      "style-src 'self' 'unsafe-inline'",
    );
  });

  it('matches only /share paths', () => {
    expect(config.matcher).toBe('/share/:path*');
  });

  it('keeps the other security headers and does not set a static CSP', async () => {
    expect(nextConfig.headers).toBeTypeOf('function');
    const rules = await nextConfig.headers!();
    const staticCsp = rules.flatMap((rule) =>
      rule.headers.filter(
        (header) => header.key.toLowerCase() === 'content-security-policy',
      ),
    );
    expect(staticCsp).toEqual([]);

    const shared = rules.find((rule) => rule.source === '/:path*');
    expect(shared?.headers).toEqual([
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains',
      },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      {
        key: 'Permissions-Policy',
        value:
          'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
      },
    ]);
    expect(rules.some((rule) => rule.source === '/share/:path*')).toBe(false);
  });
});
