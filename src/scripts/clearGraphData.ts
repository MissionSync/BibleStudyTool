/**
 * Script to clear all graph data (themes, nodes, edges)
 * Run with: npx tsx src/scripts/clearGraphData.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Client, Databases, Query } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';

if (!apiKey) {
  console.error('\n❌ Error: APPWRITE_API_KEY is required for this script.');
  console.log('\nTo create an API key:');
  console.log('1. Go to https://cloud.appwrite.io/console/project-' + projectId + '/settings');
  console.log('2. Navigate to "API Keys" tab');
  console.log('3. Click "Create API Key"');
  console.log('4. Name: "Clear Script"');
  console.log('5. Scopes: Select all Database permissions');
  console.log('6. Copy the generated key');
  console.log('7. Add to .env.local: APPWRITE_API_KEY=your_key_here\n');
  process.exit(1);
}

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const DATABASE_ID = '6966a14a0026e990c14b';

async function deleteAllFromCollection(collectionId: string, collectionName: string): Promise<number> {
  console.log(`\n🗑️  Deleting all documents from ${collectionName}...`);
  let totalDeleted = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        [Query.limit(100)]
      );

      if (response.documents.length === 0) {
        hasMore = false;
        break;
      }

      for (const doc of response.documents) {
        try {
          await databases.deleteDocument(DATABASE_ID, collectionId, doc.$id);
          totalDeleted++;
          process.stdout.write(`\r  Deleted ${totalDeleted} documents...`);
        } catch (error: any) {
          console.error(`\n  ✗ Failed to delete document ${doc.$id}:`, error.message);
        }
      }
    } catch (error: any) {
      console.error(`\n  ✗ Failed to list documents:`, error.message);
      hasMore = false;
    }
  }

  console.log(`\n  ✓ Deleted ${totalDeleted} documents from ${collectionName}`);
  return totalDeleted;
}

async function main() {
  console.log('🧹 Starting graph data cleanup...');
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`📍 Project: ${projectId}`);

  const collections = [
    { id: 'graph_edges', name: 'Graph Edges' },
    { id: 'graph_nodes', name: 'Graph Nodes' },
    { id: 'themes', name: 'Themes' },
  ];

  let totalDeleted = 0;

  for (const collection of collections) {
    const deleted = await deleteAllFromCollection(collection.id, collection.name);
    totalDeleted += deleted;
  }

  console.log('\n✅ Cleanup completed!');
  console.log(`📊 Total documents deleted: ${totalDeleted}`);
}

main().catch((error) => {
  console.error('\n❌ Cleanup failed:', error);
  process.exit(1);
});
