import { describe, expect, it } from 'vitest';
import {
  SHARE_ERRORS,
  bearerAuthorization,
  errorFromShareResponse,
  readShareCredential,
  shareFailureMessage,
} from '../shareAuth';

describe('share auth credentials', () => {
  it('builds a bearer header from a trimmed JWT', () => {
    expect(bearerAuthorization('  header.payload.sig  ')).toEqual({
      Authorization: 'Bearer header.payload.sig',
    });
  });

  it('rejects an empty JWT', () => {
    expect(() => bearerAuthorization('   ')).toThrow(SHARE_ERRORS.unauthenticated);
  });

  it('prefers a bearer token over the session cookie', () => {
    expect(
      readShareCredential(
        'Bearer jwt-1',
        [{ name: 'a_session_proj', value: 'cookie-secret' }],
        'proj',
      ),
    ).toEqual({ type: 'jwt', token: 'jwt-1' });
  });

  it('accepts a bearer scheme in any case', () => {
    expect(readShareCredential('bearer jwt-1', [], 'proj')).toEqual({
      type: 'jwt',
      token: 'jwt-1',
    });
  });

  it('does not fall back to the cookie when the bearer token is unusable', () => {
    const cookies = [{ name: 'a_session_proj', value: 'cookie-secret' }];
    expect(readShareCredential('Bearer', cookies, 'proj')).toBeNull();
    expect(readShareCredential(`Bearer ${'a'.repeat(8193)}`, cookies, 'proj')).toBeNull();
  });

  it('reads the session cookie only when no bearer token was sent', () => {
    expect(
      readShareCredential(null, [{ name: 'a_session_proj', value: ' cookie-secret ' }], 'proj'),
    ).toEqual({ type: 'session', token: 'cookie-secret' });
    expect(
      readShareCredential(
        'Basic abc',
        [{ name: 'a_session_proj_legacy', value: 'legacy-secret' }],
        'proj',
      ),
    ).toEqual({ type: 'session', token: 'legacy-secret' });
  });

  it('returns null when neither credential is present', () => {
    expect(readShareCredential(null, [], 'proj')).toBeNull();
    expect(readShareCredential(null, [{ name: 'a_session_other', value: 'x' }], 'proj')).toBeNull();
  });
});

describe('share error messages', () => {
  it('keeps the server messages the toast is allowed to show', () => {
    expect(shareFailureMessage(new Error('  Authentication required  '), 'fallback')).toBe(
      SHARE_ERRORS.unauthenticated,
    );
    expect(shareFailureMessage(new Error(SHARE_ERRORS.forbidden), SHARE_ERRORS.shareFailed)).toBe(
      SHARE_ERRORS.forbidden,
    );
    expect(shareFailureMessage(new Error(SHARE_ERRORS.unconfigured), 'fallback')).toBe(
      SHARE_ERRORS.unconfigured,
    );
  });

  it('hides anything that is not one of those messages', () => {
    expect(
      shareFailureMessage(new Error('APPWRITE_API_KEY=secret'), SHARE_ERRORS.shareFailed),
    ).toBe(SHARE_ERRORS.shareFailed);
    expect(shareFailureMessage('Authentication required', SHARE_ERRORS.unshareFailed)).toBe(
      SHARE_ERRORS.unshareFailed,
    );
    expect(
      shareFailureMessage(
        new Error('Authentication required. token=abc'),
        SHARE_ERRORS.shareFailed,
      ),
    ).toBe(SHARE_ERRORS.shareFailed);
  });

  it('reads a safe JSON error and replaces an empty or unsafe body', async () => {
    const authenticated = new Response(
      JSON.stringify({ error: SHARE_ERRORS.unauthenticated }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    );
    await expect(errorFromShareResponse(authenticated, SHARE_ERRORS.shareFailed)).resolves.toEqual(
      new Error(SHARE_ERRORS.unauthenticated),
    );

    const empty = new Response('', {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
    await expect(errorFromShareResponse(empty, SHARE_ERRORS.shareFailed)).resolves.toEqual(
      new Error(SHARE_ERRORS.shareFailed),
    );

    const leaked = new Response(JSON.stringify({ error: 'session secret=abc' }), { status: 500 });
    await expect(errorFromShareResponse(leaked, SHARE_ERRORS.unshareFailed)).resolves.toEqual(
      new Error(SHARE_ERRORS.unshareFailed),
    );
  });
});
