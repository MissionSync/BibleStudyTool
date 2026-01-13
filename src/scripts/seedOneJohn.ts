/**
 * Seed script to populate 1 John study data
 * Run with: npx tsx src/scripts/seedOneJohn.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Client, Databases } from 'appwrite';
import {
  ONE_JOHN_THEMES,
  ONE_JOHN_PASSAGES,
  ONE_JOHN_PEOPLE,
  ONE_JOHN_BOOK
} from '../data/oneJohnData';

// Initialize Appwrite client
const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';

if (!apiKey) {
  console.error('\n❌ Error: APPWRITE_API_KEY is required for this seed script.');
  console.log('\nTo create an API key:');
  console.log('1. Go to https://cloud.appwrite.io/console/project-' + projectId + '/settings');
  console.log('2. Navigate to "API Keys" tab');
  console.log('3. Click "Create API Key"');
  console.log('4. Name: "Seed Script"');
  console.log('5. Scopes: Select all Database permissions (documents.read, documents.write)');
  console.log('6. Copy the generated key');
  console.log('7. Add to .env.local: APPWRITE_API_KEY=your_key_here');
  console.log('\nNote: Keep this key secret and never commit it to version control.\n');
  process.exit(1);
}

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const DATABASE_ID = 'bible_study';

// Use a system user ID for seeded data
const SYSTEM_USER_ID = 'system';

interface CreatedNode {
  id: string;
  label: string;
  type: string;
}

async function seedThemes(): Promise<Map<string, CreatedNode>> {
  console.log('\n📚 Seeding themes...');
  const themeMap = new Map<string, CreatedNode>();

  for (const theme of ONE_JOHN_THEMES) {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        'themes',
        'unique()',
        {
          name: theme.name,
          description: theme.description,
          color: theme.color,
          isSystem: theme.isSystem,
          userId: '',
        }
      );

      themeMap.set(theme.name, {
        id: response.$id,
        label: theme.name,
        type: 'theme',
      });

      console.log(`  ✓ Created theme: ${theme.name}`);
    } catch (error: any) {
      console.error(`  ✗ Failed to create theme ${theme.name}:`, error.message);
    }
  }

  return themeMap;
}

async function seedGraphNodes(themeMap: Map<string, CreatedNode>): Promise<{
  bookNode: CreatedNode | null;
  passageNodes: Map<string, CreatedNode>;
  personNodes: Map<string, CreatedNode>;
}> {
  console.log('\n📖 Seeding graph nodes...');

  // Create book node
  let bookNode: CreatedNode | null = null;
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      'graph_nodes',
      'unique()',
      {
        userId: SYSTEM_USER_ID,
        nodeType: 'book',
        label: ONE_JOHN_BOOK.label,
        description: ONE_JOHN_BOOK.description,
        metadata: JSON.stringify({
          author: ONE_JOHN_BOOK.author,
          date: ONE_JOHN_BOOK.date,
          chapters: ONE_JOHN_BOOK.chapters,
        }),
      }
    );

    bookNode = {
      id: response.$id,
      label: ONE_JOHN_BOOK.label,
      type: 'book',
    };

    console.log(`  ✓ Created book node: ${ONE_JOHN_BOOK.label}`);
  } catch (error: any) {
    console.error('  ✗ Failed to create book node:', error.message);
  }

  // Create passage nodes
  const passageNodes = new Map<string, CreatedNode>();
  for (const passage of ONE_JOHN_PASSAGES) {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        'graph_nodes',
        'unique()',
        {
          userId: SYSTEM_USER_ID,
          nodeType: 'passage',
          label: passage.label,
          description: passage.description,
          metadata: JSON.stringify({
            chapter: passage.chapter,
            verses: passage.verses,
          }),
        }
      );

      passageNodes.set(passage.label, {
        id: response.$id,
        label: passage.label,
        type: 'passage',
      });

      console.log(`  ✓ Created passage node: ${passage.label}`);
    } catch (error: any) {
      console.error(`  ✗ Failed to create passage ${passage.label}:`, error.message);
    }
  }

  // Create person nodes
  const personNodes = new Map<string, CreatedNode>();
  for (const person of ONE_JOHN_PEOPLE) {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        'graph_nodes',
        'unique()',
        {
          userId: SYSTEM_USER_ID,
          nodeType: 'person',
          label: person.label,
          description: person.description,
          metadata: JSON.stringify({
            role: person.role,
          }),
        }
      );

      personNodes.set(person.label, {
        id: response.$id,
        label: person.label,
        type: 'person',
      });

      console.log(`  ✓ Created person node: ${person.label}`);
    } catch (error: any) {
      console.error(`  ✗ Failed to create person ${person.label}:`, error.message);
    }
  }

  return { bookNode, passageNodes, personNodes };
}

async function seedGraphEdges(
  bookNode: CreatedNode | null,
  passageNodes: Map<string, CreatedNode>,
  personNodes: Map<string, CreatedNode>,
  themeMap: Map<string, CreatedNode>
): Promise<void> {
  console.log('\n🔗 Seeding graph edges...');

  // Book contains passages
  if (bookNode) {
    for (const [label, node] of passageNodes) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          'graph_edges',
          'unique()',
          {
            userId: SYSTEM_USER_ID,
            sourceNodeId: bookNode.id,
            targetNodeId: node.id,
            edgeType: 'contains',
            weight: 1.0,
          }
        );
        console.log(`  ✓ Linked ${bookNode.label} → ${label}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to link ${bookNode.label} → ${label}:`, error.message);
      }
    }
  }

  // Passage to theme connections
  for (const passage of ONE_JOHN_PASSAGES) {
    const passageNode = passageNodes.get(passage.label);
    if (!passageNode) continue;

    for (const themeName of passage.themeConnections) {
      const themeNode = themeMap.get(themeName);
      if (!themeNode) continue;

      try {
        await databases.createDocument(
          DATABASE_ID,
          'graph_edges',
          'unique()',
          {
            userId: SYSTEM_USER_ID,
            sourceNodeId: passageNode.id,
            targetNodeId: themeNode.id,
            edgeType: 'theme_connection',
            weight: 1.0,
          }
        );
        console.log(`  ✓ Linked ${passage.label} → ${themeName}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to link ${passage.label} → ${themeName}:`, error.message);
      }
    }
  }

  // John authored 1 John
  const johnNode = personNodes.get('John the Apostle');
  if (bookNode && johnNode) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'graph_edges',
        'unique()',
        {
          userId: SYSTEM_USER_ID,
          sourceNodeId: johnNode.id,
          targetNodeId: bookNode.id,
          edgeType: 'authored',
          weight: 1.0,
        }
      );
      console.log(`  ✓ Linked John the Apostle → 1 John (authored)`);
    } catch (error: any) {
      console.error('  ✗ Failed to link authorship:', error.message);
    }
  }

  // Cross-references
  const passage1 = passageNodes.get('1 John 1');
  const passage4 = passageNodes.get('1 John 4');
  if (passage1 && passage4) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'graph_edges',
        'unique()',
        {
          userId: SYSTEM_USER_ID,
          sourceNodeId: passage1.id,
          targetNodeId: passage4.id,
          edgeType: 'cross_reference',
          weight: 0.8,
        }
      );
      console.log(`  ✓ Linked 1 John 1 ↔ 1 John 4 (cross-reference)`);
    } catch (error: any) {
      console.error('  ✗ Failed to create cross-reference:', error.message);
    }
  }
}

async function main() {
  console.log('🌱 Starting 1 John data seed...');
  console.log(`📍 Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
  console.log(`📍 Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);

  try {
    // Step 1: Seed themes
    const themeMap = await seedThemes();
    console.log(`✓ Created ${themeMap.size} themes`);

    // Step 2: Seed graph nodes
    const { bookNode, passageNodes, personNodes } = await seedGraphNodes(themeMap);
    console.log(`✓ Created 1 book, ${passageNodes.size} passages, ${personNodes.size} people`);

    // Step 3: Seed graph edges
    await seedGraphEdges(bookNode, passageNodes, personNodes, themeMap);
    console.log(`✓ Created all relationships`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Themes: ${themeMap.size}`);
    console.log(`  - Book: ${bookNode ? 1 : 0}`);
    console.log(`  - Passages: ${passageNodes.size}`);
    console.log(`  - People: ${personNodes.size}`);
    console.log(`  - Total nodes: ${1 + passageNodes.size + personNodes.size}`);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
