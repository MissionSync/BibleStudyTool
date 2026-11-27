import {
  CF_WEB_ANALYTICS_CONNECT_ORIGIN,
  CF_WEB_ANALYTICS_SCRIPT_ORIGIN,
} from './cfWebAnalytics';

/**
 * Content-Security-Policy for /share.
 *
 * script-src follows the Next.js nonce guide. default-src and style-src stay
 * as they were on the static header. worker-src 'self' keeps /sw.js allowed:
 * 'strict-dynamic' turns off the script-src host allowlist, and the service
 * worker would otherwise fall back to that blocked script-src.
 *
 * The Web Analytics beacon host is listed for browsers that ignore
 * 'strict-dynamic'. Browsers that honor it ignore that host, so the beacon
 * script on /share also carries this request's nonce.
 *
 * connect-src repeats the previous default-src fallback of 'self' and adds
 * the beacon collection host.
 */
export function createShareNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}

export function buildShareContentSecurityPolicy(
  nonce: string,
  isDev: boolean = process.env.NODE_ENV === 'development',
): string {
  const scriptSrc = [
    "script-src 'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    CF_WEB_ANALYTICS_SCRIPT_ORIGIN,
    isDev ? "'unsafe-eval'" : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' ');

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    `connect-src 'self' ${CF_WEB_ANALYTICS_CONNECT_ORIGIN}`,
    "worker-src 'self'",
  ].join('; ') + ';';
}
