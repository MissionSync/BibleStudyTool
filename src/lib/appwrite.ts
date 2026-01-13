import { Client, Databases, Account } from 'appwrite';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  throw new Error('Missing NEXT_PUBLIC_APPWRITE_ENDPOINT environment variable');
}

if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID environment variable');
}

// Initialize Appwrite Client
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

// Export service instances
export const databases = new Databases(client);
export const account = new Account(client);

// Export client for custom usage
export default client;

// Database and collection IDs
export const DATABASE_ID = 'bible_study';
export const COLLECTIONS = {
  NOTES: 'notes',
  GRAPH_NODES: 'graph_nodes',
  GRAPH_EDGES: 'graph_edges',
  THEMES: 'themes',
} as const;
