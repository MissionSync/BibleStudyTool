import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CloudflareWebAnalytics } from '../../components/analytics/CloudflareWebAnalytics';
import {
  CF_WEB_ANALYTICS_CONNECT_ORIGIN,
  CF_WEB_ANALYTICS_SCRIPT_ORIGIN,
  CF_WEB_ANALYTICS_SCRIPT_SRC,
  cfWebAnalyticsBeaconAttribute,
  cfWebAnalyticsTokenFromEnv,
} from '../cfWebAnalytics';

describe('cfWebAnalyticsTokenFromEnv', () => {
  it('returns a trimmed token', () => {
    expect(cfWebAnalyticsTokenFromEnv('  abc123  ')).toBe('abc123');
  });

  it('returns an empty string when unset, empty, whitespace, or unsafe', () => {
    expect(cfWebAnalyticsTokenFromEnv(undefined)).toBe('');
    expect(cfWebAnalyticsTokenFromEnv(null)).toBe('');
    expect(cfWebAnalyticsTokenFromEnv('')).toBe('');
    expect(cfWebAnalyticsTokenFromEnv('   ')).toBe('');
    expect(cfWebAnalyticsTokenFromEnv('tok"en')).toBe('');
    expect(cfWebAnalyticsTokenFromEnv("tok'en")).toBe('');
    expect(cfWebAnalyticsTokenFromEnv('tok<en>')).toBe('');
    expect(cfWebAnalyticsTokenFromEnv('tok&en')).toBe('');
  });
});

describe('cfWebAnalyticsBeaconAttribute', () => {
  it('returns beacon JSON for a token', () => {
    expect(cfWebAnalyticsBeaconAttribute('site-token')).toBe(
      '{"token":"site-token"}',
    );
  });

  it('returns null when the beacon should be omitted', () => {
    expect(cfWebAnalyticsBeaconAttribute(undefined)).toBeNull();
    expect(cfWebAnalyticsBeaconAttribute('')).toBeNull();
    expect(cfWebAnalyticsBeaconAttribute('bad"token')).toBeNull();
  });
});

describe('Cloudflare Web Analytics beacon', () => {
  it('uses the Cloudflare beacon hosts', () => {
    expect(CF_WEB_ANALYTICS_SCRIPT_SRC).toBe(
      'https://static.cloudflareinsights.com/beacon.min.js',
    );
    expect(CF_WEB_ANALYTICS_SCRIPT_ORIGIN).toBe(
      'https://static.cloudflareinsights.com',
    );
    expect(CF_WEB_ANALYTICS_CONNECT_ORIGIN).toBe(
      'https://cloudflareinsights.com',
    );
  });

  it('renders the deferred beacon when a token is set', () => {
    const html = renderToStaticMarkup(
      createElement(CloudflareWebAnalytics, {
        token: 'site-token',
        nonce: 'nonce-value',
      }),
    );

    expect(html).toContain('defer=""');
    expect(html).toContain(`src="${CF_WEB_ANALYTICS_SCRIPT_SRC}"`);
    expect(html).toContain('nonce="nonce-value"');
    expect(html).toContain(
      'data-cf-beacon="{&quot;token&quot;:&quot;site-token&quot;}"',
    );
  });

  it('omits the nonce attribute when the page has no CSP nonce', () => {
    const html = renderToStaticMarkup(
      createElement(CloudflareWebAnalytics, { token: 'site-token' }),
    );

    expect(html).toContain(`src="${CF_WEB_ANALYTICS_SCRIPT_SRC}"`);
    expect(html).not.toContain('nonce');
  });

  it('renders nothing when the token is missing', () => {
    expect(
      renderToStaticMarkup(
        createElement(CloudflareWebAnalytics, { token: '' }),
      ),
    ).toBe('');
    expect(
      renderToStaticMarkup(
        createElement(CloudflareWebAnalytics, { token: '   ' }),
      ),
    ).toBe('');
  });
});
