import { ID, Query, type Models } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '../appwrite';

export interface Theme extends Models.Document {
  name: string;
  description?: string;
  color: string;
  isSystem: boolean;
  userId?: string;
}

export interface CreateThemeData {
  name: string;
  description?: string;
  color: string;
  isSystem?: boolean;
  userId?: string;
}

export interface UpdateThemeData {
  name?: string;
  description?: string;
  color?: string;
}

/**
 * Create a new theme
 */
export async function createTheme(data: CreateThemeData): Promise<Theme> {
  const themeData = {
    name: data.name,
    description: data.description || '',
    color: data.color,
    isSystem: data.isSystem || false,
    userId: data.userId || '',
  };

  const response = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.THEMES,
    ID.unique(),
    themeData
  );

  return response as unknown as Theme;
}

/**
 * Get a single theme by ID
 */
export async function getTheme(themeId: string): Promise<Theme> {
  const response = await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.THEMES,
    themeId
  );

  return response as unknown as Theme;
}

/**
 * Get all themes (system + user themes)
 */
export async function getAllThemes(userId?: string): Promise<Theme[]> {
  const queries = [];

  if (userId) {
    // Get system themes and user's custom themes
    queries.push(Query.equal('isSystem', true));
    queries.push(Query.equal('userId', userId));
  }

  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.THEMES,
    queries
  );

  return response.documents as unknown as Theme[];
}

/**
 * Get only system themes
 */
export async function getSystemThemes(): Promise<Theme[]> {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.THEMES,
    [Query.equal('isSystem', true)]
  );

  return response.documents as unknown as Theme[];
}

/**
 * Get user's custom themes
 */
export async function getUserThemes(userId: string): Promise<Theme[]> {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.THEMES,
    [
      Query.equal('userId', userId),
      Query.equal('isSystem', false),
    ]
  );

  return response.documents as unknown as Theme[];
}

/**
 * Update a theme
 */
export async function updateTheme(themeId: string, data: UpdateThemeData): Promise<Theme> {
  const response = await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.THEMES,
    themeId,
    data
  );

  return response as unknown as Theme;
}

/**
 * Delete a theme
 */
export async function deleteTheme(themeId: string): Promise<void> {
  await databases.deleteDocument(
    DATABASE_ID,
    COLLECTIONS.THEMES,
    themeId
  );
}

/**
 * Search themes by name
 */
export async function searchThemes(searchTerm: string, userId?: string): Promise<Theme[]> {
  const queries = [Query.search('name', searchTerm)];

  if (userId) {
    // Search in both system themes and user's themes
    queries.push(Query.equal('isSystem', true));
    queries.push(Query.equal('userId', userId));
  }

  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.THEMES,
    queries
  );

  return response.documents as unknown as Theme[];
}
