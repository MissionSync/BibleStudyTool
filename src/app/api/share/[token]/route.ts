import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

function getServerClient() {
  const client = new Client();
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Databases(client);
}

interface SharedNoteDocument {
  title: string;
  content: string;
  contentPlan: string;
  bibleReferences: string[];
  tags: string[];
  shareToken: string;
  $createdAt: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length < 16) {
    return NextResponse.json({ error: 'Invalid share token' }, { status: 400 });
  }

  if (!process.env.APPWRITE_API_KEY) {
    return NextResponse.json(
      { error: 'Server not configured for sharing' },
      { status: 500 }
    );
  }

  try {
    const databases = getServerClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

    const response = await databases.listDocuments(databaseId, 'notes', [
      Query.equal('shareToken', token),
      Query.limit(1),
    ]);

    if (response.documents.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const doc = response.documents[0] as unknown as SharedNoteDocument;

    return NextResponse.json({
      title: doc.title,
      content: doc.content,
      bibleReferences: doc.bibleReferences,
      tags: doc.tags,
      createdAt: doc.$createdAt,
    });
  } catch (error) {
    console.error('Failed to fetch shared note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}
