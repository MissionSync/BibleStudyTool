import { notFound } from 'next/navigation';
import { Client, Databases, Query } from 'node-appwrite';

interface SharedNote {
  title: string;
  content: string;
  bibleReferences: string[];
  tags: string[];
  createdAt: string;
}

function getServerDatabases() {
  const client = new Client();
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Databases(client);
}

async function getSharedNote(token: string): Promise<SharedNote | null> {
  if (!token || token.length < 16) return null;
  if (!process.env.APPWRITE_API_KEY) {
    console.error('APPWRITE_API_KEY not configured for sharing');
    return null;
  }

  try {
    const databases = getServerDatabases();
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
  const { token } = await params;
  const note = await getSharedNote(token);

  if (!note) {
    notFound();
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <nav
        style={{
          maxWidth: 'var(--content-narrow)',
          margin: '0 auto',
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <span
          className="text-lg tracking-wide"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--text-primary)',
          }}
        >
          Bible Notes Journal
        </span>
        <span
          className="ml-3 text-xs px-2 py-0.5"
          style={{
            backgroundColor: 'var(--highlight-sage)',
            color: 'var(--text-secondary)',
            borderRadius: '2px',
          }}
        >
          Shared Note
        </span>
      </nav>

      <main
        style={{
          maxWidth: 'var(--content-narrow)',
          margin: '0 auto',
          padding: '3rem 1.5rem',
        }}
      >
        <h1
          className="text-3xl mb-4"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--text-primary)',
            fontWeight: 400,
          }}
        >
          {note.title}
        </h1>

        <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
          {new Date(note.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        {(note.bibleReferences.length > 0 || note.tags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-8">
            {note.bibleReferences.map((ref, i) => (
              <span
                key={`ref-${i}`}
                className="text-xs px-2 py-1"
                style={{
                  backgroundColor: 'var(--highlight-sage)',
                  color: 'var(--text-secondary)',
                  borderRadius: '2px',
                }}
              >
                {ref}
              </span>
            ))}
            {note.tags.map((tag, i) => (
              <span
                key={`tag-${i}`}
                className="text-xs px-2 py-1"
                style={{
                  backgroundColor: 'var(--highlight-gold)',
                  color: 'var(--text-secondary)',
                  borderRadius: '2px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          className="scripture"
          style={{ color: 'var(--text-primary)', lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </main>

      <footer
        className="py-12 text-center text-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <div>Bible Notes Journal</div>
        <div style={{ marginTop: '0.5rem' }}>
          developed by{' '}
          <a
            href="https://missionsynclab.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            MissionSync Lab
          </a>
        </div>
      </footer>
    </div>
  );
}
