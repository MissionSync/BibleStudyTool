/**
 * Share requests authenticate with a short-lived Appwrite user JWT.
 * The session cookie is stored on the Appwrite endpoint host, so the
 * browser does not send it to this site. The cookie is accepted only
 * when the request did not send a bearer token.
 */

export const SHARE_ERRORS = {
  unauthenticated: 'Authentication required',
  unconfigured: 'Server not configured for sharing',
  forbidden: 'Not authorized',
  shareFailed: 'Failed to share note',
  unshareFailed: 'Failed to unshare note',
} as const;

const SAFE_SHARE_MESSAGES = new Set<string>(Object.values(SHARE_ERRORS));
const MAX_CREDENTIAL_LENGTH = 8192;

export type ShareCredential =
  | { type: 'jwt'; token: string }
  | { type: 'session'; token: string };

export function bearerAuthorization(jwt: string): { Authorization: string } {
  const token = jwt.trim();
  if (!token || token.length > MAX_CREDENTIAL_LENGTH) {
    throw new Error(SHARE_ERRORS.unauthenticated);
  }
  return { Authorization: `Bearer ${token}` };
}

export function shareFailureMessage(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message.trim() : '';
  return SAFE_SHARE_MESSAGES.has(message) ? message : fallback;
}

export async function errorFromShareResponse(response: Response, fallback: string): Promise<Error> {
  let serverMessage = '';
  try {
    const body: unknown = await response.json();
    if (
      body !== null &&
      typeof body === 'object' &&
      'error' in body &&
      typeof body.error === 'string'
    ) {
      serverMessage = body.error;
    }
  } catch {
    serverMessage = '';
  }
  return new Error(shareFailureMessage(new Error(serverMessage), fallback));
}

/**
 * A bearer token is explicit. An invalid one does not fall through to the
 * session cookie. Any other Authorization scheme leaves the cookie path open.
 */
export function readShareCredential(
  authorizationHeader: string | null,
  cookies: { name: string; value: string }[],
  projectId: string,
): ShareCredential | null {
  const header = authorizationHeader?.trim() ?? '';
  if (/^Bearer\b/i.test(header)) {
    const match = /^Bearer\s+(\S+)$/i.exec(header);
    const token = match?.[1];
    if (!token || token.length > MAX_CREDENTIAL_LENGTH) return null;
    return { type: 'jwt', token };
  }

  if (!projectId) return null;
  const names = [`a_session_${projectId}`, `a_session_${projectId}_legacy`];
  for (const name of names) {
    const value = cookies.find((cookie) => cookie.name === name)?.value.trim() ?? '';
    if (value && value.length <= MAX_CREDENTIAL_LENGTH) {
      return { type: 'session', token: value };
    }
  }
  return null;
}
