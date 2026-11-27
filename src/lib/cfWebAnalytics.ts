/**
 * Cloudflare Web Analytics beacon.
 *
 * The site token is public by design. Next.js only exposes it to the
 * browser when the name starts with NEXT_PUBLIC_, so the configured
 * name is NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN. An unset, empty, or
 * unsafe value omits the beacon.
 */
export const CF_WEB_ANALYTICS_SCRIPT_SRC =
  'https://static.cloudflareinsights.com/beacon.min.js';

export const CF_WEB_ANALYTICS_SCRIPT_ORIGIN =
  'https://static.cloudflareinsights.com';

export const CF_WEB_ANALYTICS_CONNECT_ORIGIN = 'https://cloudflareinsights.com';

const UNSAFE_TOKEN = /[\u0000-\u001F\u007F"'<>&\\]/;

export function cfWebAnalyticsTokenFromEnv(
  value: string | undefined | null,
): string {
  const token = value?.trim() ?? '';
  if (!token || UNSAFE_TOKEN.test(token)) return '';
  return token;
}

export function cfWebAnalyticsBeaconAttribute(
  value: string | undefined | null,
): string | null {
  const token = cfWebAnalyticsTokenFromEnv(value);
  if (!token) return null;
  return JSON.stringify({ token });
}
