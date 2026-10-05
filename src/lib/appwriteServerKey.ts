import { Client } from 'node-appwrite';

/** Ephemeral API key Appwrite Sites attaches to each request. */
export const APPWRITE_SITE_KEY_HEADER = 'x-appwrite-key';

/**
 * Prefer the Sites key on `x-appwrite-key`. Fall back to `APPWRITE_API_KEY`
 * for local `npm run dev`, where that header is absent.
 */
export function resolveAppwriteServerKey(
  siteKeyHeader: string | null | undefined,
  envKey: string | null | undefined = process.env.APPWRITE_API_KEY,
): string | undefined {
  const fromHeader = siteKeyHeader?.trim();
  if (fromHeader) return fromHeader;
  const fromEnv = envKey?.trim();
  return fromEnv || undefined;
}

/**
 * Invite sends email, so a visitor who merely hits the route is not enough.
 * The caller must present the env key or the same site key the request carries.
 */
export function isInviteAuthorized(
  authorizationHeader: string | null | undefined,
  siteKeyHeader: string | null | undefined,
  envKey: string | null | undefined = process.env.APPWRITE_API_KEY,
): boolean {
  if (!authorizationHeader) return false;
  const match = /^Bearer\s+(\S+)$/.exec(authorizationHeader.trim());
  if (!match) return false;
  const token = match[1];
  const accepted = [envKey, siteKeyHeader]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  return accepted.includes(token);
}

export function createAppwriteServerClient(apiKey: string): Client {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  if (!endpoint || !projectId) {
    throw new Error('Appwrite endpoint and project id are required');
  }

  const client = new Client();
  client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  return client;
}
