import { ID, Query, type Models } from 'appwrite';
import { account, databases, DATABASE_ID, COLLECTIONS } from '../appwrite';
import { generateGraphForNote } from '../graphGenerator';
import {
  bearerAuthorization,
  errorFromShareResponse,
  SHARE_ERRORS,
} from '../shareAuth';

export interface Note extends Models.Document {
  title: string;
  content: string;
  contentPlan: string;
  userId: string;
  bibleReferences: string[];
  tags: string[];
  isArchived: boolean;
  shareToken?: string | null;
}

export interface CreateNoteData {
  title: string;
  content: string;
  contentPlan: string;
  userId: string;
  bibleReferences?: string[];
  tags?: string[];
  isArchived?: boolean;
  shareToken?: string | null;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  contentPlan?: string;
  bibleReferences?: string[];
  tags?: string[];
  isArchived?: boolean;
  shareToken?: string | null;
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

async function shareRequestHeaders(): Promise<{ Authorization: string }> {
  try {
    const created = await account.createJWT();
    return bearerAuthorization(created.jwt);
  } catch (error) {
    if (error instanceof Error && error.message === SHARE_ERRORS.unauthenticated) {
      throw error;
    }
    throw new Error(SHARE_ERRORS.unauthenticated);
  }
}

/**
 * Share a note by generating a share token (via server API route).
 * The Appwrite session cookie is on the API host, so this sends a
 * short-lived user JWT instead.
 */
export async function shareNote(noteId: string): Promise<{ shareToken: string; noteId: string }> {
  const res = await fetch(`/api/notes/${noteId}/share`, {
    method: 'POST',
    headers: await shareRequestHeaders(),
  });
  if (!res.ok) {
    throw await errorFromShareResponse(res, SHARE_ERRORS.shareFailed);
  }
  return res.json();
}

/**
 * Unshare a note by removing the share token (via server API route).
 */
export async function unshareNote(noteId: string): Promise<void> {
  const res = await fetch(`/api/notes/${noteId}/share`, {
    method: 'DELETE',
    headers: await shareRequestHeaders(),
  });
  if (!res.ok) {
    throw await errorFromShareResponse(res, SHARE_ERRORS.unshareFailed);
  }
}
