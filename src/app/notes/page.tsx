'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Edit, Trash2, Calendar, Tag, Loader2 } from 'lucide-react';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { createNote, getUserNotes, deleteNote, type Note } from '@/lib/appwrite/notes';
import { useAuth } from '@/contexts/AuthContext';

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Load notes when user is available
  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const fetchedNotes = await getUserNotes(user.$id);
      setNotes(fetchedNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Unable to load notes. Please ensure you are connected to Appwrite.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (noteData: {
    title: string;
    content: string;
    tags: string[];
    references: string[];
  }) => {
    try {
      setError(null);

      if (editingNote) {
        // Update existing note (implement later)
        console.log('Update note:', noteData);
      } else if (user) {
        // Create new note
        const newNote = await createNote({
          title: noteData.title,
          content: noteData.content,
          contentPlain: noteData.content.replace(/<[^>]*>/g, ''), // Strip HTML tags
          userId: user.$id,
          bibleReferences: noteData.references,
          tags: noteData.tags,
          isArchived: false,
        });

        setNotes([newNote, ...notes]);
      }

      setIsCreating(false);
      setEditingNote(null);
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Failed to save note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      setError(null);
      await deleteNote(noteId);
      setNotes(notes.filter(note => note.$id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
    }
  };

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.contentPlain.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  if (isCreating || editingNote) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingNote(null);
              }}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Notes
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingNote ? 'Edit Note' : 'Create New Note'}
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
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Study Notes
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Capture insights and track your Bible study journey
              </p>
            </div>

            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Note
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Start capturing your Bible study insights'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.$id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 line-clamp-2">
                    {note.title}
                  </h3>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => setEditingNote(note)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.$id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {note.contentPlain}
                </p>

                {note.bibleReferences.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {note.bibleReferences.slice(0, 3).map((ref, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                        >
                          {ref}
                        </span>
                      ))}
                      {note.bibleReferences.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                          +{note.bibleReferences.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {note.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Calendar className="w-3 h-3" />
                  {new Date(note.$createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-12 bg-green-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            💡 Note-Taking Tips
          </h3>
          <ul className="text-gray-700 dark:text-gray-300 space-y-1">
            <li>• Bible references are automatically detected (e.g., "John 3:16")</li>
            <li>• Use tags to organize notes by topic or theme</li>
            <li>• Notes can be linked to knowledge graph nodes</li>
            <li>• Search works across titles, content, and tags</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
