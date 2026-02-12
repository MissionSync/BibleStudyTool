import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import { generateShareToken } from '@/lib/sharing';

function getServerDatabases() {
  const client = new Client();
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Databases(client);
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;

  if (!process.env.APPWRITE_API_KEY) {
    return NextResponse.json(
      { error: 'Server not configured for sharing' },
      { status: 500 }
    );
  }

  try {
    const databases = getServerDatabases();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
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
  _request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;

  if (!process.env.APPWRITE_API_KEY) {
    return NextResponse.json(
      { error: 'Server not configured for sharing' },
      { status: 500 }
    );
  }

  try {
    const databases = getServerDatabases();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

    await databases.updateDocument(databaseId, 'notes', noteId, {
      shareToken: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unshare note:', error);
    return NextResponse.json({ error: 'Failed to unshare note' }, { status: 500 });
  }
}
