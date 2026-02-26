import { ID, Query, type Models } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '../appwrite';

export interface Prayer extends Models.Document {
  userId: string;
  userName: string;
  title: string;
  prayer: string;
  date: string;
  isPublic: boolean;
  prayerAnswered: string | null;
}

export interface CreatePrayerData {
  userId: string;
  userName: string;
  title: string;
  prayer: string;
  date: string;
  isPublic: boolean;
}

export interface UpdatePrayerData {
  title?: string;
  prayer?: string;
  isPublic?: boolean;
  prayerAnswered?: string | null;
}

/**
 * Create a new prayer request
 */
export async function createPrayer(data: CreatePrayerData): Promise<Prayer> {
  return databases.createDocument<Prayer>(
    DATABASE_ID,
    COLLECTIONS.PRAYERS,
    ID.unique(),
    {
      userId: data.userId,
      userName: data.userName,
      title: data.title,
      prayer: data.prayer,
      date: data.date,
      isPublic: data.isPublic,
      prayerAnswered: null,
    }
  );
}

/**
 * Update a prayer request (e.g. mark as answered)
 */
export async function updatePrayer(prayerId: string, data: UpdatePrayerData): Promise<Prayer> {
  return databases.updateDocument<Prayer>(
    DATABASE_ID,
    COLLECTIONS.PRAYERS,
    prayerId,
    data
  );
}

/**
 * Delete a prayer request
 */
export async function deletePrayer(prayerId: string): Promise<void> {
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PRAYERS, prayerId);
}

/**
 * Get the 10 most recent public prayer requests (for the community feed)
 */
export async function getRecentPublicPrayers(): Promise<Prayer[]> {
  const response = await databases.listDocuments<Prayer>(
    DATABASE_ID,
    COLLECTIONS.PRAYERS,
    [
      Query.equal('isPublic', true),
      Query.orderDesc('$createdAt'),
      Query.limit(10),
    ]
  );
  return response.documents;
}

/**
 * Get all prayer requests for a specific user (public + private)
 */
export async function getUserPrayers(userId: string): Promise<Prayer[]> {
  const response = await databases.listDocuments<Prayer>(
    DATABASE_ID,
    COLLECTIONS.PRAYERS,
    [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]
  );
  return response.documents;
}
