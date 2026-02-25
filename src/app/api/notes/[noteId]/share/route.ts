import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Account } from 'node-appwrite';
import { generateShareToken } from '@/lib/sharing';

function getServerDatabases() {
  const client = new Client();
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Databases(client);
}

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
  const sessionCookie = request.cookies.get(`a_session_${projectId}`)
    || request.cookies.get(`a_session_${projectId}_legacy`);

  if (!sessionCookie?.value) return null;

  try {
    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(projectId)
      .setSession(sessionCookie.value);
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

  if (!process.env.APPWRITE_API_KEY) {
    return NextResponse.json(
      { error: 'Server not configured for sharing' },
      { status: 500 }
    );
  }

  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const databases = getServerDatabases();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

    const note = await databases.getDocument(databaseId, 'notes', noteId);
    if (note.userId !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const token = generateShareToken();
    const doc = await databases.updateDocument(databaseId, 'notes', noteId, {
      shareToken: token,
    });

    return NextResponse.json({
      shareToken: doc.shareToken,
      noteId: doc.$id,
    });
  } catch (error) {
    console.error('Failed to share note:', error);
    return NextResponse.json({ error: 'Failed to share note' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;

  if (!process.env.APPWRITE_API_KEY) {
    return NextResponse.json(
      { error: 'Server not configured for sharing' },
      { status: 500 }
    );
  }

  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const databases = getServerDatabases();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

    const note = await databases.getDocument(databaseId, 'notes', noteId);
    if (note.userId !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await databases.updateDocument(databaseId, 'notes', noteId, {
      shareToken: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unshare note:', error);
    return NextResponse.json({ error: 'Failed to unshare note' }, { status: 500 });
  }
}
