'use client';

import { SiteFooter } from '@/components/ui/SiteFooter';
import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { getNote, type Note } from '@/lib/appwrite/notes';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useNotes } from '@/hooks/useNotes';
import { AppNav } from '@/components/ui/AppNav';
import { NoteCardSkeleton } from '@/components/ui/NoteCardSkeleton';
import { getShareUrl } from '@/lib/sharing';
import { shareFailureMessage, SHARE_ERRORS } from '@/lib/shareAuth';
import { isDevMobileFixture, mobilePreviewNotes } from '@/lib/mobileReadingFixture';

const NoteEditor = dynamic(
  () => import('@/components/notes/NoteEditor').then((mod) => mod.NoteEditor),
  { ssr: false },
);

function NoteActions({
  note,
  onEdit,
  onArchive,
  onUnarchive,
  onShare,
  onUnshare,
  onCopy,
  onDelete,
}: {
  note: Note;
  onEdit: (note: Note) => void;
  onArchive: (noteId: string) => void;
  onUnarchive: (noteId: string) => void;
  onShare: (noteId: string) => void;
  onUnshare: (noteId: string) => void;
  onCopy: (shareToken: string) => void;
  onDelete: (noteId: string) => void;
}) {
  if (note.isArchived) {
    return (
      <button type="button" className="note-action is-accent" onClick={() => onUnarchive(note.$id)}>
        Unarchive
      </button>
    );
  }

  return (
    <>
      <button type="button" className="note-action is-accent" onClick={() => onEdit(note)}>
        Edit
      </button>
      {note.shareToken ? (
        <>
          <button type="button" className="note-action is-accent" onClick={() => onCopy(note.shareToken!)}>
            Copy Link
          </button>
          <button type="button" className="note-action" onClick={() => onUnshare(note.$id)}>
            Unshare
          </button>
        </>
      ) : (
        <button type="button" className="note-action" onClick={() => onShare(note.$id)}>
          Share
        </button>
      )}
      <button type="button" className="note-action" onClick={() => onArchive(note.$id)}>
        Archive
      </button>
      <button type="button" className="note-action is-quiet" onClick={() => onDelete(note.$id)}>
        Delete
      </button>
    </>
  );
}

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [showArchived, setShowArchived] = useState(false);
  const liveNotes = useNotes(user?.$id, { includeArchived: showArchived });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [fetchedNote, setFetchedNote] = useState<Note | null>(null);
  const [editorClosed, setEditorClosed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const search = useSyncExternalStore(
    (onChange) => {
      window.addEventListener('popstate', onChange);
      return () => window.removeEventListener('popstate', onChange);
    },
    () => window.location.search,
    () => '',
  );
  const fixtureMode = isDevMobileFixture(process.env.NODE_ENV, search);
  const noteId = new URLSearchParams(search).get('note');

  useEffect(() => {
    if (typeof window !== 'undefined' && isDevMobileFixture(process.env.NODE_ENV, window.location.search)) {
      return;
    }
    if (fixtureMode) return;
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [fixtureMode, user, authLoading, router]);

  const notes = fixtureMode ? mobilePreviewNotes : liveNotes.notes;
  const isLoading = fixtureMode ? false : liveNotes.isLoading;
  const loadError = fixtureMode ? null : liveNotes.error;
  const hasNextPage = fixtureMode ? false : liveNotes.hasNextPage;
  const fetchNextPage = liveNotes.fetchNextPage;
  const isFetchingNextPage = liveNotes.isFetchingNextPage;
  const { createNote, updateNote, deleteNote, archiveNote, unarchiveNote, shareNote, unshareNote } = liveNotes;

  const noteIsListed = Boolean(noteId && notes.some((note) => note.$id === noteId));
  useEffect(() => {
    if (!user || !noteId || editorClosed || noteIsListed) return;
    let active = true;
    getNote(noteId)
      .then((note) => {
        if (active && note.userId === user.$id) setFetchedNote(note);
      })
      .catch(() => {
        // Leave the list in place if this note cannot be opened.
      });
    return () => {
      active = false;
    };
  }, [user, noteId, editorClosed, noteIsListed]);

  const listedUrlNote = !editorClosed && noteId
    ? notes.find((note) => note.$id === noteId) ?? null
    : null;
  const fetchedUrlNote = !editorClosed && fetchedNote?.$id === noteId ? fetchedNote : null;
  const previewNote = !editorClosed && fixtureMode && new URLSearchParams(search).get('view') === 'editor'
    ? mobilePreviewNotes[0]
    : null;
  const editingNote = selectedNote ?? listedUrlNote ?? fetchedUrlNote ?? previewNote;

  const closeEditor = () => {
    setIsCreating(false);
    setSelectedNote(null);
    setEditorClosed(true);
  };

  const handleSaveNote = async (noteData: {
    title: string;
    content: string;
    tags: string[];
    references: string[];
  }) => {
    if (fixtureMode) {
      showToast('This preview does not save.', 'info');
      closeEditor();
      return;
    }
    try {
      setSaveError(null);

      if (editingNote) {
        await updateNote.mutateAsync({
          noteId: editingNote.$id,
          data: {
            title: noteData.title,
            content: noteData.content,
            contentPlan: noteData.content.replace(/<[^>]*>/g, ''),
            bibleReferences: noteData.references,
            tags: noteData.tags,
          },
        });
        showToast('Note updated.', 'success');
      } else if (user) {
        await createNote.mutateAsync({
          title: noteData.title,
          content: noteData.content,
          contentPlan: noteData.content.replace(/<[^>]*>/g, ''),
          userId: user.$id,
          bibleReferences: noteData.references,
          tags: noteData.tags,
          isArchived: false,
        });
        showToast('Note created.', 'success');
      }

      closeEditor();
    } catch (err) {
      console.error('Error saving note:', err);
      setSaveError('Failed to save note. Please try again.');
      throw err;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (fixtureMode) return;
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await deleteNote.mutateAsync(noteId);
      showToast('Note deleted.', 'success');
    } catch (err) {
      console.error('Error deleting note:', err);
      showToast('Failed to delete note.', 'error');
    }
  };

  const handleArchiveNote = async (noteId: string) => {
    if (fixtureMode) return;
    try {
      await archiveNote.mutateAsync(noteId);
      showToast('Note archived.', 'success');
    } catch {
      showToast('Failed to archive note.', 'error');
    }
  };

  const handleUnarchiveNote = async (noteId: string) => {
    if (fixtureMode) return;
    try {
      await unarchiveNote.mutateAsync(noteId);
      showToast('Note unarchived.', 'success');
    } catch {
      showToast('Failed to unarchive note.', 'error');
    }
  };

  const handleShareNote = async (noteId: string) => {
    if (fixtureMode) return;
    try {
      const result = await shareNote.mutateAsync(noteId);
      const url = getShareUrl(result.shareToken);
      await navigator.clipboard.writeText(url);
      showToast('Share link copied to clipboard.', 'success');
    } catch (err) {
      console.error('Share note error:', err);
      showToast(shareFailureMessage(err, SHARE_ERRORS.shareFailed), 'error');
    }
  };

  const handleUnshareNote = async (noteId: string) => {
    if (fixtureMode) return;
    try {
      await unshareNote.mutateAsync(noteId);
      showToast('Note is no longer shared.', 'info');
    } catch (err) {
      console.error('Unshare note error:', err);
      showToast(shareFailureMessage(err, SHARE_ERRORS.unshareFailed), 'error');
    }
  };

  const handleCopyShareLink = async (shareToken: string) => {
    const url = getShareUrl(shareToken);
    await navigator.clipboard.writeText(url);
    showToast('Share link copied.', 'success');
  };

  const displayedNotes = showArchived
    ? notes.filter(note => note.isArchived)
    : notes.filter(note => !note.isArchived);

  const filteredNotes = displayedNotes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.contentPlan.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  if (!fixtureMode && authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!fixtureMode && !user) {
    return null;
  }

  // Editor View
  if (isCreating || editingNote) {
    return (
      <div className="notes-page min-h-screen animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <AppNav active="notes" />

        <main className="content-narrow notes-editor-main py-12">
          <button
            type="button"
            onClick={closeEditor}
            className="back-link"
          >
            &larr; Back to Notes
          </button>

          <h1 className="reading-title">
            {editingNote ? 'Edit Note' : 'New Note'}
          </h1>

          <NoteEditor
            initialTitle={editingNote?.title}
            initialContent={editingNote?.content}
            initialTags={editingNote?.tags}
            initialReferences={editingNote?.bibleReferences}
            onSave={handleSaveNote}
            onCancel={closeEditor}
            error={saveError}
          />
        </main>
      </div>
    );
  }

  const errorMessage = loadError ? 'Unable to load notes. Please ensure you are connected to Appwrite.' : null;

  // Notes List View
  return (
    <div className="notes-page min-h-screen animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AppNav active="notes" />

      <header className="content-narrow notes-page-header py-12">
        <Link href="/dashboard" className="back-link">
          &larr; Dashboard
        </Link>

        <div className="notes-header">
          <div>
            <h1 className="reading-title">Study Notes</h1>
            <p className="reading-lede">Capture insights from your Bible study</p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="btn-primary text-sm"
          >
            New Note
          </button>
        </div>
      </header>

      <main className="content-narrow pb-16">
        {/* Error */}
        {errorMessage && (
          <div
            className="mb-6 p-4"
            style={{
              backgroundColor: 'var(--highlight-peach)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <p style={{ color: 'var(--error)', fontSize: '1rem', lineHeight: 1.5 }}>{errorMessage}</p>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            style={{ height: '3rem' }}
          />
        </div>

        {/* Archive Tabs */}
        <div className="flex gap-6 mb-8" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <button
            onClick={() => setShowArchived(false)}
            className="pb-3 text-sm transition-colors"
            style={{
              background: 'none',
              border: 'none',
              borderBottom: !showArchived ? '2px solid var(--text-primary)' : '2px solid transparent',
              color: !showArchived ? 'var(--text-primary)' : 'var(--text-tertiary)',
              cursor: 'pointer',
              fontWeight: !showArchived ? 500 : 400,
            }}
          >
            Active
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className="pb-3 text-sm transition-colors"
            style={{
              background: 'none',
              border: 'none',
              borderBottom: showArchived ? '2px solid var(--text-primary)' : '2px solid transparent',
              color: showArchived ? 'var(--text-primary)' : 'var(--text-tertiary)',
              cursor: 'pointer',
              fontWeight: showArchived ? 500 : 400,
            }}
          >
            Archived
          </button>
        </div>

        {/* Notes List */}
        {isLoading ? (
          <div className="space-y-1">
            <NoteCardSkeleton />
            <NoteCardSkeleton />
            <NoteCardSkeleton />
            <NoteCardSkeleton />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div
            className="text-center"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '4px',
              padding: '3rem 2rem',
              marginBottom: '3rem',
            }}
          >
            <h3
              className="text-xl mb-3"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontWeight: 500 }}
            >
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="reading-lede" style={{ marginBottom: '1.5rem' }}>
              {searchQuery
                ? 'Try a different search term'
                : 'Start capturing your Bible study insights'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreating(true)}
                className="btn-primary text-sm"
              >
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredNotes.map((note) => (
              <div
                key={note.$id}
                className="py-5"
                style={{ borderBottom: '1px solid var(--border-light)' }}
              >
                <div className="note-row">
                  <div className="note-main">
                    <div className="note-title-row">
                      <h3 className="note-card-title">{note.title}</h3>
                      {note.isArchived && <span className="archived-chip">Archived</span>}
                    </div>

                    <p className="note-excerpt line-clamp-2">{note.contentPlan}</p>

                    <div className="note-meta">
                      {note.bibleReferences.length > 0 && (
                        <div className="chip-row">
                          {note.bibleReferences.slice(0, 3).map((ref, idx) => (
                            <span key={idx} className="verse-chip">{ref}</span>
                          ))}
                          {note.bibleReferences.length > 3 && (
                            <span className="chip-more">+{note.bibleReferences.length - 3}</span>
                          )}
                        </div>
                      )}

                      {note.tags.length > 0 && (
                        <div className="chip-row">
                          {note.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="tag-chip">{tag}</span>
                          ))}
                        </div>
                      )}

                      <span className="note-date">
                        {new Date(note.$createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="note-actions">
                    <NoteActions
                      note={note}
                      onEdit={setSelectedNote}
                      onArchive={handleArchiveNote}
                      onUnarchive={handleUnarchiveNote}
                      onShare={handleShareNote}
                      onUnshare={handleUnshareNote}
                      onCopy={handleCopyShareLink}
                      onDelete={handleDeleteNote}
                    />
                  </div>

                  <details className="note-menu">
                    <summary>Actions</summary>
                    <div className="note-menu-panel">
                      <NoteActions
                        note={note}
                        onEdit={setSelectedNote}
                        onArchive={handleArchiveNote}
                        onUnarchive={handleUnarchiveNote}
                        onShare={handleShareNote}
                        onUnshare={handleUnshareNote}
                        onCopy={handleCopyShareLink}
                        onDelete={handleDeleteNote}
                      />
                    </div>
                  </details>
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasNextPage && !searchQuery && (
              <div className="text-center py-8">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="btn-secondary text-sm"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Tips */}
      <section
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-light)',
          marginTop: '2rem',
        }}
      >
        <div className="content-narrow notes-tips" style={{ padding: '3rem 1.5rem' }}>
          <h2
            className="text-xl"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
              fontWeight: 500,
              marginBottom: '1.5rem',
            }}
          >
            Note-taking tips
          </h2>
          <ul className="space-y-3" style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
            <li>Bible references are automatically detected (e.g., &quot;John 3:16&quot;)</li>
            <li>Use tags to organize notes by topic or theme</li>
            <li>Notes can be linked to knowledge graph nodes</li>
            <li>Search works across titles, content, and tags</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
