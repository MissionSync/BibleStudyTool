import { NextRequest, NextResponse } from 'next/server';
import { Databases, ID, Messaging, Query, Users } from 'node-appwrite';
import {
  APPWRITE_SITE_KEY_HEADER,
  createAppwriteServerClient,
  isInviteAuthorized,
  resolveAppwriteServerKey,
} from '@/lib/appwriteServerKey';

const PAGE_SIZE = 100;
const COLLECTION_ID = 'feedback_responses';

/**
 * Email each account once, through Appwrite Messaging, when a provider is already configured.
 * Records an empty invited response so the same person is not emailed again.
 * If Messaging is not configured, nobody is emailed and the in-app card is the prompt.
 */
export async function POST(request: NextRequest) {
  const siteKey = request.headers.get(APPWRITE_SITE_KEY_HEADER);
  const apiKey = resolveAppwriteServerKey(siteKey);
  if (!apiKey || !process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
    return NextResponse.json({ emailed: 0, reason: 'not_configured' });
  }

  if (!isInviteAuthorized(request.headers.get('authorization'), siteKey)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const client = createAppwriteServerClient(apiKey);
  const messaging = new Messaging(client);
  const usersApi = new Users(client);
  const databases = new Databases(client);
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  let emailReady = false;
  try {
    const providers = await messaging.listProviders({
      queries: [Query.equal('type', 'email'), Query.equal('enabled', true), Query.limit(1)],
    });
    emailReady = providers.providers.some((provider) => provider.type === 'email' && provider.enabled);
  } catch (error) {
    console.error('Messaging is not available:', error);
    return NextResponse.json({ emailed: 0, reason: 'messaging_not_configured' });
  }

  if (!emailReady) {
    return NextResponse.json({ emailed: 0, reason: 'messaging_not_configured' });
  }

  let emailed = 0;
  let skipped = 0;
  let cursor: string | undefined;

  try {
    while (true) {
      const queries = [Query.limit(PAGE_SIZE)];
      if (cursor) queries.push(Query.cursorAfter(cursor));

      const page = await usersApi.list({ queries });
      for (const user of page.users) {
        if (!user.email) {
          skipped += 1;
          continue;
        }

        const already = await databases.listDocuments(databaseId, COLLECTION_ID, [
          Query.equal('userId', user.$id),
          Query.limit(1),
        ]);
        if (already.documents.length > 0) {
          skipped += 1;
          continue;
        }

        await messaging.createEmail({
          messageId: ID.unique(),
          subject: 'A few questions about your study map',
          content: 'Open Bible Notes and answer five short questions about your study map. It only takes a minute.',
          users: [user.$id],
        });

        await databases.createDocument(databaseId, COLLECTION_ID, ID.unique(), {
          userId: user.$id,
          answers: '',
          createdAt: new Date().toISOString(),
          source: 'invited',
        });
        emailed += 1;
      }

      if (page.users.length < PAGE_SIZE) break;
      cursor = page.users[page.users.length - 1].$id;
    }
  } catch (error) {
    console.error('Feedback invite stopped:', error);
    return NextResponse.json({ emailed, skipped, reason: 'invite_failed' });
  }

  return NextResponse.json({ emailed, skipped });
}
