import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { SHARE_ERRORS } from '../shareAuth';

const auth = vi.hoisted(() => ({
  jwt: [] as string[],
  session: [] as string[],
  userId: 'user-1',
  accountError: null as Error | null,
  document: { $id: 'note-1', userId: 'user-1', shareToken: null as string | null },
  getError: null as Error | null,
  updateError: null as Error | null,
  getCount: 0,
  updateCount: 0,
  updated: null as Record<string, unknown> | null,
}));

vi.mock('node-appwrite', () => {
  class Client {
    setEndpoint() {
      return this;
    }
    setProject() {
      return this;
    }
    setKey() {
      return this;
    }
    setSession(value: string) {
      auth.session.push(value);
      return this;
    }
    setJWT(value: string) {
      auth.jwt.push(value);
      return this;
    }
  }

  class Account {
    async get() {
      if (auth.accountError) throw auth.accountError;
      return { $id: auth.userId };
    }
  }

  class Databases {
    async getDocument() {
      auth.getCount += 1;
      if (auth.getError) throw auth.getError;
      return { ...auth.document };
    }
    async updateDocument(
      _databaseId: string,
      _collectionId: string,
      id: string,
      data: Record<string, unknown>,
    ) {
      auth.updateCount += 1;
      auth.updated = data;
      if (auth.updateError) throw auth.updateError;
      return { ...auth.document, ...data, $id: id };
    }
  }

  return { Client, Account, Databases };
});

import { DELETE, POST } from '../../app/api/notes/[noteId]/share/route';

const PROJECT_ID = 'proj';
const ENV_KEYS = [
  'NEXT_PUBLIC_APPWRITE_ENDPOINT',
  'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
  'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
  'APPWRITE_API_KEY',
] as const;
const previousEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function resetAuth() {
  auth.jwt = [];
  auth.session = [];
  auth.userId = 'user-1';
  auth.accountError = null;
  auth.document = { $id: 'note-1', userId: 'user-1', shareToken: null };
  auth.getError = null;
  auth.updateError = null;
  auth.getCount = 0;
  auth.updateCount = 0;
  auth.updated = null;
}

function shareRequest(method: 'POST' | 'DELETE', headers?: HeadersInit) {
  return new NextRequest('https://biblenotesjournal.app/api/notes/note-1/share', {
    method,
    headers,
  });
}

const routeParams = { params: Promise.resolve({ noteId: 'note-1' }) };

describe('note share route auth', () => {
  beforeEach(() => {
    resetAuth();
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT = 'https://example.invalid/v1';
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID = PROJECT_ID;
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID = 'db';
    process.env.APPWRITE_API_KEY = 'local-key';
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
    vi.restoreAllMocks();
  });

  it('returns a JSON 401 when the request has no cookie and no JWT', async () => {
    const response = await POST(shareRequest('POST'), routeParams);

    expect(response.status).toBe(401);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('cache-control')).toBe('no-store');
    const text = await response.text();
    expect(text.length).toBeGreaterThan(0);
    expect(text).toBe(JSON.stringify({ error: SHARE_ERRORS.unauthenticated }));
    expect(auth.getCount).toBe(0);
    expect(auth.jwt).toEqual([]);
    expect(auth.session).toEqual([]);
  });

  it('returns the same JSON 401 for unshare without credentials', async () => {
    const response = await DELETE(shareRequest('DELETE'), routeParams);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: SHARE_ERRORS.unauthenticated });
    expect(auth.updateCount).toBe(0);
  });

  it('verifies Authorization Bearer with setJWT and shares the owned note', async () => {
    const response = await POST(
      shareRequest('POST', {
        authorization: 'Bearer jwt-1',
        cookie: `a_session_${PROJECT_ID}=cookie-secret`,
      }),
      routeParams,
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ shareToken: body.shareToken, noteId: 'note-1' });
    expect(body.shareToken).toMatch(/^[a-f0-9]{32}$/);
    expect(auth.jwt).toEqual(['jwt-1']);
    expect(auth.session).toEqual([]);
    expect(auth.updated).toEqual({ shareToken: body.shareToken });
  });

  it('verifies the same JWT on unshare and clears the token', async () => {
    const response = await DELETE(
      shareRequest('DELETE', { authorization: 'Bearer jwt-1' }),
      routeParams,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(auth.jwt).toEqual(['jwt-1']);
    expect(auth.updated).toEqual({ shareToken: null });
  });

  it('does not fall back to the session cookie when the JWT is rejected', async () => {
    auth.accountError = new Error('invalid jwt');
    const response = await POST(
      shareRequest('POST', {
        authorization: 'Bearer bad-jwt',
        cookie: `a_session_${PROJECT_ID}=cookie-secret`,
      }),
      routeParams,
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: SHARE_ERRORS.unauthenticated });
    expect(auth.jwt).toEqual(['bad-jwt']);
    expect(auth.session).toEqual([]);
    expect(auth.getCount).toBe(0);
  });

  it('accepts the session cookie when the request has no bearer token', async () => {
    const response = await DELETE(
      shareRequest('DELETE', { cookie: `a_session_${PROJECT_ID}=cookie-secret` }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(auth.session).toEqual(['cookie-secret']);
    expect(auth.jwt).toEqual([]);
  });

  it('accepts the legacy session cookie', async () => {
    const response = await POST(
      shareRequest('POST', { cookie: `a_session_${PROJECT_ID}_legacy=legacy-secret` }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(auth.session).toEqual(['legacy-secret']);
  });

  it('returns 403 and does not write when the note belongs to someone else', async () => {
    auth.document = { ...auth.document, userId: 'someone-else' };
    const response = await POST(
      shareRequest('POST', { authorization: 'Bearer jwt-1' }),
      routeParams,
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: SHARE_ERRORS.forbidden });
    expect(auth.updateCount).toBe(0);
  });

  it('returns 500 without calling Appwrite when the server key is missing', async () => {
    delete process.env.APPWRITE_API_KEY;
    const response = await POST(
      shareRequest('POST', { authorization: 'Bearer jwt-1' }),
      routeParams,
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: SHARE_ERRORS.unconfigured });
    expect(auth.jwt).toEqual([]);
    expect(auth.getCount).toBe(0);
  });

  it('accepts the Appwrite site key header', async () => {
    delete process.env.APPWRITE_API_KEY;
    const response = await POST(
      shareRequest('POST', {
        authorization: 'Bearer jwt-1',
        'x-appwrite-key': 'site-key',
      }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(auth.jwt).toEqual(['jwt-1']);
  });

  it('returns a generic share failure and does not echo a database error', async () => {
    auth.updateError = new Error('APPWRITE_API_KEY=secret session=abc');
    const response = await POST(
      shareRequest('POST', { authorization: 'Bearer jwt-1' }),
      routeParams,
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: SHARE_ERRORS.shareFailed });
    expect(JSON.stringify(body)).not.toContain('APPWRITE_API_KEY');
    expect(JSON.stringify(body)).not.toContain('session=abc');
  });

  it('returns a generic unshare failure when the document cannot be read', async () => {
    auth.getError = new Error('permission denied for secret project');
    const response = await DELETE(
      shareRequest('DELETE', { authorization: 'Bearer jwt-1' }),
      routeParams,
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: SHARE_ERRORS.unshareFailed });
    expect(auth.updateCount).toBe(0);
  });
});
