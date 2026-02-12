import { ID, Query, type Models } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '../appwrite';
import { generateGraphForNote } from '../graphGenerator';

export interface Note extends Models.Document {
  title: string;
  content: string;
  contentPlan: string;
  userId: string;
  bibleReferences: string[];
  tags: string[];
  isArchived: boolean;
}

export interface CreateNoteData {
  title: string;
  content: string;
  contentPlan: string;
  userId: string;
  bibleReferences?: string[];
  tags?: string[];
  isArchived?: boolean;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  contentPlan?: string;
  bibleReferences?: string[];
  tags?: string[];
  isArchived?: boolean;
}

/**
 * Create a new note and generate graph nodes
 */
export async function createNote(data: CreateNoteData): Promise<Note> {
  const noteData = {
    title: data.title,
    content: data.content,
    contentPlan: data.contentPlan,
    userId: data.userId,
    bibleReferences: data.bibleReferences || [],
    tags: data.tags || [],
    isArchived: data.isArchived || false,
  };

  const note = await databases.createDocument<Note>(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    ID.unique(),
    noteData
  );

  // Generate graph nodes for this note (async, don't block)
  try {
    await generateGraphForNote(note);
  } catch (error) {
    console.error('Failed to generate graph for note:', error);
    // Don't throw - note creation succeeded
  }

  return note;
}

/**
 * Get a single note by ID
 */
export async function getNote(noteId: string): Promise<Note> {
  return databases.getDocument<Note>(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    noteId
  );
}

/**
 * Get all notes for a user
 */
export async function getUserNotes(userId: string, includeArchived = false): Promise<Note[]> {
  const queries = [
    Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
  ];

  if (!includeArchived) {
    queries.push(Query.equal('isArchived', false));
  }

  const response = await databases.listDocuments<Note>(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    queries
  );

  return response.documents;
}

/**
 * Update a note and regenerate graph nodes
 */
export async function updateNote(noteId: string, data: UpdateNoteData): Promise<Note> {
  const note = await databases.updateDocument<Note>(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    noteId,
    data
  );

  // Regenerate graph nodes for this note (async, don't block)
  try {
    await generateGraphForNote(note);
  } catch (error) {
    console.error('Failed to regenerate graph for note:', error);
    // Don't throw - note update succeeded
  }

  return note;
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: string): Promise<void> {
  await databases.deleteDocument(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    noteId
  );
}

export interface PaginatedNotesResult {
  notes: Note[];
  hasMore: boolean;
  lastId: string | undefined;
  total: number;
}

/**
 * Get paginated notes for a user
 */
export async function getUserNotesPaginated(
  userId: string,
  options: { limit?: number; cursor?: string; includeArchived?: boolean } = {}
): Promise<PaginatedNotesResult> {
  const { limit = 20, cursor, includeArchived = false } = options;

  const queries = [
    Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
    Query.limit(limit),
  ];

  if (!includeArchived) {
    queries.push(Query.equal('isArchived', false));
  }

  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

  const response = await databases.listDocuments<Note>(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    queries
  );

  const notes = response.documents;
  return {
    notes,
    hasMore: notes.length === limit,
    lastId: notes.length > 0 ? notes[notes.length - 1].$id : undefined,
    total: response.total,
  };
}

/**
 * Search notes by content or title
 */
export async function searchNotes(userId: string, searchTerm: string): Promise<Note[]> {
  const response = await databases.listDocuments<Note>(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    [
      Query.equal('userId', userId),
      Query.search('contentPlan', searchTerm),
      Query.orderDesc('$createdAt'),
    ]
  );

  return response.documents;
}
