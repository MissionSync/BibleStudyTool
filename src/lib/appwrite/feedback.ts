import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '../appwrite';

export interface FeedbackAnswers {
  ease: number;
  weekView: string;
  helpMost: string;
  confusing: string;
  change: string;
}

/**
 * True when this person already submitted the in-app questionnaire.
 * Null when the collection is missing or unreadable, so the rest of the app can continue.
 * Invited records (empty answers) do not count as a response.
 */
export async function hasInAppFeedback(userId: string): Promise<boolean | null> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FEEDBACK_RESPONSES,
      [
        Query.equal('userId', userId),
        Query.equal('source', 'in_app'),
        Query.limit(1),
      ]
    );
    return response.documents.length > 0;
  } catch (error) {
    console.error('Feedback collection unavailable:', error);
    return null;
  }
}

/**
 * Store one new response. Never updates notes or graph documents.
 * Returns false when the collection is missing.
 */
export async function submitInAppFeedback(userId: string, answers: FeedbackAnswers): Promise<boolean> {
  try {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.FEEDBACK_RESPONSES,
      ID.unique(),
      {
        userId,
        answers: JSON.stringify(answers),
        createdAt: new Date().toISOString(),
        source: 'in_app',
      }
    );
    return true;
  } catch (error) {
    console.error('Could not save feedback:', error);
    return false;
  }
}
