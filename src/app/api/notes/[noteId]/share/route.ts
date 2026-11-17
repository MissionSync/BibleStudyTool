import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Account } from 'node-appwrite';
import { generateShareToken } from '@/lib/sharing';
import {
  readShareCredential,
  SHARE_ERRORS,
} from '@/lib/shareAuth';
import {
  APPWRITE_SITE_KEY_HEADER,
  createAppwriteServerClient,
  resolveAppwriteServerKey,
} from '@/lib/appwriteServerKey';

function getServerDatabases(apiKey: string) {
  return new Databases(createAppwriteServerClient(apiKey));
}

function shareJson(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? '';
  const credential = readShareCredential(
    request.headers.get('authorization'),
    request.cookies.getAll(),
    projectId,
  );
  if (!credential || !endpoint || !projectId) return null;

  try {
    const client = new Client();
    client.setEndpoint(endpoint).setProject(projectId);
    if (credential.type === 'jwt') {
      client.setJWT(credential.token);
    } else {
      client.setSession(credential.token);
    }
    const account = new Account(client);
    const user = await account.get();
    return user.$id;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;

  const apiKey = resolveAppwriteServerKey(request.headers.get(APPWRITE_SITE_KEY_HEADER));
  if (!apiKey) {
    return shareJson({ error: SHARE_ERRORS.unconfigured }, 500);
  }

  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return shareJson({ error: SHARE_ERRORS.unauthenticated }, 401);
  }

  try {
    const databases = getServerDatabases(apiKey);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

    const note = await databases.getDocument(databaseId, 'notes', noteId);
    if (note.userId !== userId) {
      return shareJson({ error: SHARE_ERRORS.forbidden }, 403);
    }

    const token = generateShareToken();
    const doc = await databases.updateDocument(databaseId, 'notes', noteId, {
      shareToken: token,
    });

    return shareJson({
      shareToken: doc.shareToken,
      noteId: doc.$id,
    }, 200);
  } catch (error) {
    console.error(
      'Failed to share note:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return shareJson({ error: SHARE_ERRORS.shareFailed }, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;

  const apiKey = resolveAppwriteServerKey(request.headers.get(APPWRITE_SITE_KEY_HEADER));
  if (!apiKey) {
    return shareJson({ error: SHARE_ERRORS.unconfigured }, 500);
  }

  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return shareJson({ error: SHARE_ERRORS.unauthenticated }, 401);
  }

  try {
    const databases = getServerDatabases(apiKey);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

    const note = await databases.getDocument(databaseId, 'notes', noteId);
    if (note.userId !== userId) {
      return shareJson({ error: SHARE_ERRORS.forbidden }, 403);
    }

    await databases.updateDocument(databaseId, 'notes', noteId, {
      shareToken: null,
    });

    return shareJson({ success: true }, 200);
  } catch (error) {
    console.error(
      'Failed to unshare note:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return shareJson({ error: SHARE_ERRORS.unshareFailed }, 500);
  }
}
