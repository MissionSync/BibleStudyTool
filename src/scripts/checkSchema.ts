/**
 * Check the schema of graph_edges collection
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Client, Databases } from 'node-appwrite';

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = '6966a14a0026e990c14b';

async function checkSchema() {
  try {
    console.log('📋 Checking graph_edges collection schema...\n');

    const collection = await databases.getCollection(DATABASE_ID, 'graph_edges');

    console.log(`Collection: ${collection.name}`);
    console.log(`ID: ${collection.$id}\n`);
    console.log('Attributes:');

    collection.attributes.forEach((attr: any) => {
      console.log(`  - ${attr.key} (${attr.type}${attr.array ? '[]' : ''})${attr.required ? ' [required]' : ''}`);
    });

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkSchema();
