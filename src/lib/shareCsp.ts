/**
 * Content-Security-Policy for /share.
 *
 * script-src follows the Next.js nonce guide. default-src and style-src stay
 * as they were on the static header. worker-src 'self' keeps /sw.js allowed:
 * 'strict-dynamic' turns off the script-src host allowlist, and the service
 * worker would otherwise fall back to that blocked script-src.
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
    isDev ? "'unsafe-eval'" : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' ');

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "worker-src 'self'",
  ].join('; ') + ';';
}
