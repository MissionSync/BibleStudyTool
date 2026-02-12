'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { type Note } from '@/lib/appwrite/notes';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useNotes } from '@/hooks/useNotes';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [showArchived, setShowArchived] = useState(false);
  const { notes, isLoading, error: loadError, hasNextPage, fetchNextPage, isFetchingNextPage, createNote, updateNote, deleteNote, archiveNote, unarchiveNote } = useNotes(user?.$id, { includeArchived: showArchived });
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleSaveNote = async (noteData: {
    title: string;
    content: string;
    tags: string[];
    references: string[];
  }) => {
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

      setIsCreating(false);
      setEditingNote(null);
    } catch (err) {
      console.error('Error saving note:', err);
      setSaveError('Failed to save note. Please try again.');
      throw err;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
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
    try {
      await archiveNote.mutateAsync(noteId);
      showToast('Note archived.', 'success');
    } catch {
      showToast('Failed to archive note.', 'error');
    }
  };

  const handleUnarchiveNote = async (noteId: string) => {
    try {
      await unarchiveNote.mutateAsync(noteId);
      showToast('Note unarchived.', 'success');
    } catch {
      showToast('Failed to unarchive note.', 'error');
    }
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Editor View
  if (isCreating || editingNote) {
    return (
      <div className="min-h-screen animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Navigation */}
        <nav
          className="content-wide py-6 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-light)' }}
        >
          <Link
            href="/dashboard"
            className="text-lg tracking-wide"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            Bible Notes Journal
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/study"
              className="text-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Study Plans
            </Link>
            <span
              className="text-sm"
              style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--text-primary)', paddingBottom: '2px' }}
            >
              Notes
            </span>
            <ThemeToggle />
          </div>
        </nav>

        <main className="content-narrow py-12">
          <button
            onClick={() => {
              setIsCreating(false);
              setEditingNote(null);
            }}
            className="inline-block mb-8 text-sm transition-colors"
            style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            &larr; Back to Notes
          </button>

          <h1
            className="text-3xl mb-8"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            {editingNote ? 'Edit Note' : 'New Note'}
          </h1>

          <NoteEditor
            initialTitle={editingNote?.title}
            initialContent={editingNote?.content}
            initialTags={editingNote?.tags}
            initialReferences={editingNote?.bibleReferences}
            onSave={handleSaveNote}
            onCancel={() => {
              setIsCreating(false);
              setEditingNote(null);
            }}
            error={saveError}
          />
        </main>
      </div>
    );
  }

  const errorMessage = loadError ? 'Unable to load notes. Please ensure you are connected to Appwrite.' : null;

  // Notes List View
  return (
    <div className="min-h-screen animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav
        className="content-wide py-6 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-light)' }}
      >
        <Link
          href="/dashboard"
          className="text-lg tracking-wide"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', textDecoration: 'none' }}
        >
          Bible Notes Journal
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/study"
            className="text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Study Plans
          </Link>
          <span
            className="text-sm"
            style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--text-primary)', paddingBottom: '2px' }}
          >
            Notes
          </span>
          <ThemeToggle />
        </div>
      </nav>

      {/* Header */}
      <header className="content-narrow py-12">
        <Link
          href="/dashboard"
          className="inline-block mb-6 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          &larr; Dashboard
        </Link>

        <div className="flex items-start justify-between gap-6">
          <div>
            <h1
              className="text-3xl mb-2"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
            >
              Study Notes
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Capture insights from your Bible study
            </p>
          </div>

          <button
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
              borderRadius: '2px',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--error)' }}>{errorMessage}</p>
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
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4" />
            <p style={{ color: 'var(--text-secondary)' }}>Loading notes...</p>
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
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
            >
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className="text-lg truncate"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          color: 'var(--text-primary)',
                          fontWeight: 400,
                        }}
                      >
                        {note.title}
                      </h3>
                      {note.isArchived && (
                        <span
                          className="text-xs px-2 py-0.5 flex-shrink-0"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-tertiary)',
                            borderRadius: '2px',
                          }}
                        >
                          Archived
                        </span>
                      )}
                    </div>

                    <p
                      className="text-sm mb-3 line-clamp-2"
                      style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                    >
                      {note.contentPlan}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      {note.bibleReferences.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.bibleReferences.slice(0, 3).map((ref, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5"
                              style={{
                                backgroundColor: 'var(--highlight-sage)',
                                color: 'var(--text-secondary)',
                                borderRadius: '2px',
                              }}
                            >
                              {ref}
                            </span>
                          ))}
                          {note.bibleReferences.length > 3 && (
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              +{note.bibleReferences.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5"
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

                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(note.$createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {note.isArchived ? (
                      <button
                        onClick={() => handleUnarchiveNote(note.$id)}
                        className="text-sm transition-colors"
                        style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Unarchive
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingNote(note)}
                          className="text-sm transition-colors"
                          style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArchiveNote(note.$id)}
                          className="text-sm transition-colors"
                          style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.$id)}
                          className="text-sm transition-colors"
                          style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
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
        <div className="content-narrow" style={{ padding: '3rem 1.5rem' }}>
          <h2
            className="text-xl"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--text-primary)',
              fontWeight: 400,
              marginBottom: '1.5rem',
            }}
          >
            Note-taking tips
          </h2>
          <ul className="space-y-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <li>Bible references are automatically detected (e.g., &quot;John 3:16&quot;)</li>
            <li>Use tags to organize notes by topic or theme</li>
            <li>Notes can be linked to knowledge graph nodes</li>
            <li>Search works across titles, content, and tags</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
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
