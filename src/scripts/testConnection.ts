/**
 * Test Appwrite connection and API key permissions
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Client, Databases } from 'node-appwrite';

const client = new Client();
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';

console.log('🔍 Testing Appwrite Connection...\n');
console.log('Configuration:');
console.log(`  Endpoint: ${endpoint}`);
console.log(`  Project ID: ${projectId}`);
console.log(`  API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function testConnection() {
  try {
    console.log('\n📋 Testing database access...');
    const response = await databases.list();
    console.log('✓ Successfully connected!');
    console.log(`\nFound ${response.total} database(s):`);
    response.databases.forEach(db => {
      console.log(`  - ${db.name} (ID: ${db.$id})`);
    });
  } catch (error: any) {
    console.error('\n❌ Connection failed!');
    console.error(`Error: ${error.message}`);
    if (error.code) console.error(`Code: ${error.code}`);
    if (error.type) console.error(`Type: ${error.type}`);

    console.log('\n💡 Troubleshooting:');
    console.log('1. Verify your API key has Database permissions:');
    console.log(`   https://cloud.appwrite.io/console/project-${projectId}/settings/keys`);
    console.log('2. Required scopes:');
    console.log('   - databases.read');
    console.log('   - databases.write');
    console.log('   - collections.read');
    console.log('   - collections.write');
    console.log('   - documents.read');
    console.log('   - documents.write');
  }
}

testConnection();
