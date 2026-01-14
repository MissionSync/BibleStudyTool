/**
 * Test specific database and collection access
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Client, Databases, ID } from 'node-appwrite';

const client = new Client();
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';

console.log('🔍 Testing Appwrite Database Access...\n');

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const DATABASE_ID = '6966a14a0026e990c14b';

async function testDatabaseAccess() {
  try {
    // Test 1: List all databases
    console.log('Test 1: Listing all databases...');
    const dbList = await databases.list();
    console.log(`✓ Success! Found ${dbList.total} database(s)`);
    dbList.databases.forEach(db => {
      console.log(`  - ${db.name} (ID: ${db.$id})`);
    });

    // Test 2: Get specific database
    console.log('\nTest 2: Getting bible_study database...');
    const db = await databases.get(DATABASE_ID);
    console.log(`✓ Success! Database: ${db.name}`);

    // Test 3: List collections
    console.log('\nTest 3: Listing collections in bible_study...');
    const collections = await databases.listCollections(DATABASE_ID);
    console.log(`✓ Success! Found ${collections.total} collection(s)`);
    collections.collections.forEach(col => {
      console.log(`  - ${col.name} (ID: ${col.$id})`);
    });

    // Test 4: Try to create a test document in themes collection
    console.log('\nTest 4: Creating test document in themes collection...');
    const testDoc = await databases.createDocument(
      DATABASE_ID,
      'themes',
      ID.unique(),
      {
        name: 'TEST_THEME',
        description: 'Test theme for connection verification',
        color: '#000000',
        isSystem: false,
        userId: '',
      }
    );
    console.log(`✓ Success! Created test document (ID: ${testDoc.$id})`);

    // Test 5: Delete the test document
    console.log('\nTest 5: Deleting test document...');
    await databases.deleteDocument(DATABASE_ID, 'themes', testDoc.$id);
    console.log('✓ Success! Test document deleted');

    console.log('\n✅ All tests passed! Your API key is configured correctly.');
    console.log('You can now run: npm run seed:1john');

  } catch (error: any) {
    console.error('\n❌ Test failed!');
    console.error(`Error: ${error.message}`);
    if (error.code) console.error(`Code: ${error.code}`);
    if (error.type) console.error(`Type: ${error.type}`);

    console.log('\n💡 Possible issues:');
    console.log('1. API key might be expired or invalid');
    console.log('2. API key might not have saved all the required scopes');
    console.log('3. Try creating a NEW API key with these scopes:');
    console.log('   - All Database scopes (databases.*, collections.*, documents.*)');
    console.log('4. Make sure to save the new key to .env.local');
  }
}

testDatabaseAccess();
