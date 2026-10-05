import { describe, expect, it } from 'vitest';
import { isInviteAuthorized, resolveAppwriteServerKey } from '../appwriteServerKey';

describe('resolveAppwriteServerKey', () => {
  it('prefers the Appwrite Sites key on the request header', () => {
    expect(resolveAppwriteServerKey('site-key', 'local-key')).toBe('site-key');
  });

  it('falls back to APPWRITE_API_KEY when the header is missing', () => {
    expect(resolveAppwriteServerKey(null, 'local-key')).toBe('local-key');
    expect(resolveAppwriteServerKey('   ', 'local-key')).toBe('local-key');
  });

  it('returns undefined when neither key is set', () => {
    expect(resolveAppwriteServerKey(undefined, '')).toBeUndefined();
  });
});

describe('isInviteAuthorized', () => {
  it('accepts a bearer token that matches the local API key', () => {
    expect(isInviteAuthorized('Bearer local-key', null, 'local-key')).toBe(true);
  });

  it('accepts a bearer token that matches the site key', () => {
    expect(isInviteAuthorized('Bearer site-key', 'site-key', undefined)).toBe(true);
  });

  it('rejects a request that does not present a server key', () => {
    expect(isInviteAuthorized(null, 'site-key', 'local-key')).toBe(false);
    expect(isInviteAuthorized('Bearer other', 'site-key', 'local-key')).toBe(false);
  });
});
