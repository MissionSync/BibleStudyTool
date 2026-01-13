import { ID, Query, type Models } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '../appwrite';

export interface Note extends Models.Document {
  title: string;
  content: string;
  contentPlain: string;
  userId: string;
  bibleReferences: string[];
  tags: string[];
  isArchived: boolean;
}

export interface CreateNoteData {
  title: string;
  content: string;
  contentPlain: string;
  userId: string;
  bibleReferences?: string[];
  tags?: string[];
  isArchived?: boolean;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  contentPlain?: string;
  bibleReferences?: string[];
  tags?: string[];
  isArchived?: boolean;
}

/**
 * Create a new note
 */
export async function createNote(data: CreateNoteData): Promise<Note> {
  const noteData = {
    title: data.title,
    content: data.content,
    contentPlain: data.contentPlain,
    userId: data.userId,
    bibleReferences: data.bibleReferences || [],
    tags: data.tags || [],
    isArchived: data.isArchived || false,
  };

  const response = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    ID.unique(),
    noteData
  );

  return response as unknown as Note;
}

/**
 * Get a single note by ID
 */
export async function getNote(noteId: string): Promise<Note> {
  const response = await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    noteId
  );

  return response as unknown as Note;
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

  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    queries
  );

  return response.documents as unknown as Note[];
}

/**
 * Update a note
 */
export async function updateNote(noteId: string, data: UpdateNoteData): Promise<Note> {
  const response = await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    noteId,
    data
  );

  return response as unknown as Note;
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

/**
 * Search notes by content or title
 */
export async function searchNotes(userId: string, searchTerm: string): Promise<Note[]> {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    [
      Query.equal('userId', userId),
      Query.search('contentPlain', searchTerm),
      Query.orderDesc('$createdAt'),
    ]
  );

  return response.documents as unknown as Note[];
}
