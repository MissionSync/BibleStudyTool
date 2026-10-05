import { NextRequest, NextResponse } from 'next/server';
import { Databases, Query } from 'node-appwrite';
import DOMPurify from 'isomorphic-dompurify';
import {
  APPWRITE_SITE_KEY_HEADER,
  createAppwriteServerClient,
  resolveAppwriteServerKey,
} from '@/lib/appwriteServerKey';

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
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length < 16) {
    return NextResponse.json({ error: 'Invalid share token' }, { status: 400 });
  }

  const apiKey = resolveAppwriteServerKey(request.headers.get(APPWRITE_SITE_KEY_HEADER));
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server not configured for sharing' },
      { status: 500 }
    );
  }

  try {
    const databases = new Databases(createAppwriteServerClient(apiKey));
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
      content: DOMPurify.sanitize(doc.content),
      bibleReferences: doc.bibleReferences,
      tags: doc.tags,
      createdAt: doc.$createdAt,
    });
  } catch (error) {
    console.error('Failed to fetch shared note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}
