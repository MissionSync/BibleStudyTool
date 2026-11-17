import { SiteFooter } from '@/components/ui/SiteFooter';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Databases, Query } from 'node-appwrite';
import DOMPurify from 'isomorphic-dompurify';
import {
  APPWRITE_SITE_KEY_HEADER,
  createAppwriteServerClient,
  resolveAppwriteServerKey,
} from '@/lib/appwriteServerKey';
import { fixtureSharedNote } from '@/lib/mobileReadingFixture';

interface SharedNote {
  title: string;
  content: string;
  bibleReferences: string[];
  tags: string[];
  createdAt: string;
}

async function getSharedNote(token: string): Promise<SharedNote | null> {
  const preview = fixtureSharedNote(token, process.env.NODE_ENV);
  if (preview) return preview;
  if (!token || token.length < 16) return null;
  const headerStore = await headers();
  const apiKey = resolveAppwriteServerKey(headerStore.get(APPWRITE_SITE_KEY_HEADER));
  if (!apiKey) {
    console.error('Appwrite server key not configured for sharing');
    return null;
  }

  try {
    const databases = new Databases(createAppwriteServerClient(apiKey));
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

    const response = await databases.listDocuments(databaseId, 'notes', [
      Query.equal('shareToken', token),
      Query.limit(1),
    ]);

    if (response.documents.length === 0) return null;

    const doc = response.documents[0];
    return {
      title: doc.title as string,
      content: doc.content as string,
      bibleReferences: (doc.bibleReferences as string[]) || [],
      tags: (doc.tags as string[]) || [],
      createdAt: doc.$createdAt as string,
    };
  } catch (error) {
    console.error('Failed to fetch shared note:', error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedNotePage({ params }: PageProps) {
  // The CSP nonce is created per request. Dynamic rendering is required so
  // Next can copy that nonce onto its inline scripts.
  await connection();
  const { token } = await params;
  const note = await getSharedNote(token);

  if (!note) {
    notFound();
  }

  return (
    <div className="share-page min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <nav className="mast">
        <div className="wrap mast-inner" style={{ gridTemplateColumns: '1fr' }}>
          <div className="share-brand">
            <span className="brand-mark">Bible Notes Journal</span>
            <span className="caps share-kicker">Shared Note</span>
          </div>
        </div>
      </nav>

      <main className="reading-shell">
        <h1 className="reading-title">{note.title}</h1>

        <p className="reading-meta">
          {new Date(note.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        {(note.bibleReferences.length > 0 || note.tags.length > 0) && (
          <div className="reading-chips">
            {note.bibleReferences.length > 0 && (
              <div className="chip-row">
                {note.bibleReferences.map((ref, i) => (
                  <span key={`ref-${i}`} className="verse-chip">
                    {ref}
                  </span>
                ))}
              </div>
            )}
            {note.tags.length > 0 && (
              <div className="chip-row">
                {note.tags.map((tag, i) => (
                  <span key={`tag-${i}`} className="tag-chip">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          className="reading-body"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(note.content, { FORBID_ATTR: ['style'] }),
          }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
