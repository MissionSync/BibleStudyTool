/**
 * Read-only export of study collections to a timestamped JSON archive.
 *
 * Lists documents and writes a local file. Does not create, update, or delete
 * Appwrite documents, collections, or users. A collection that does not exist
 * yet is recorded as missing; the archive of the other collections is still written.
 *
 * Usage: npm run export:collections
 * Requires .env.local (endpoint, project id, database id, API key).
 * Do not run this against production unless you intend to download a copy.
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Client, Databases } from 'node-appwrite';
import {
  archiveFileName,
  exportCollections,
  type DocumentLister,
  type ExportDocument,
} from '../lib/collectionExport';

async function main() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !databaseId || !apiKey) {
    console.error('Missing Appwrite env. Set endpoint, project id, database id, and API key in .env.local.');
    process.exitCode = 1;
    return;
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);
  const exportedAt = new Date();
  const lister: DocumentLister = {
    async listDocuments(targetDatabaseId, collectionId, queries) {
      const page = await databases.listDocuments(targetDatabaseId, collectionId, queries);
      const documents = page.documents.map((doc) => ({ ...doc }) as ExportDocument);
      return { documents };
    },
  };

  const archive = await exportCollections({
    databases: lister,
    databaseId,
    exportedAt: exportedAt.toISOString(),
  });

  const directory = path.resolve(process.cwd(), 'backups');
  fs.mkdirSync(directory, { recursive: true });
  const filePath = path.join(directory, archiveFileName(exportedAt));
  fs.writeFileSync(filePath, `${JSON.stringify(archive, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${filePath}`);
  for (const [collectionId, count] of Object.entries(archive.counts)) {
    console.log(`  ${collectionId}: ${count}`);
  }
  for (const collectionId of archive.missing) {
    console.error(`  ${collectionId}: collection not found, skipped`);
  }
  if (archive.missing.includes('notes')) {
    console.error('Notes were not listed, so this archive is not a backup of current notes.');
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Export failed: ${message}`);
  process.exitCode = 1;
});
