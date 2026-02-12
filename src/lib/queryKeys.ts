import { COLLECTIONS } from './appwrite';

export const queryKeys = {
  notes: {
    list: (userId: string) => ['notes', 'list', userId] as const,
  },
  graph: {
    full: (userId: string) => ['graph', 'full', userId] as const,
  },
  themes: {
    list: () => ['themes', 'list'] as const,
  },
};

const COLLECTION_KEY_MAP: Record<string, (userId: string) => readonly string[][]> = {
  [COLLECTIONS.NOTES]: (userId) => [
    [...queryKeys.notes.list(userId)],
  ],
  [COLLECTIONS.GRAPH_NODES]: (userId) => [
    [...queryKeys.graph.full(userId)],
  ],
  [COLLECTIONS.GRAPH_EDGES]: (userId) => [
    [...queryKeys.graph.full(userId)],
  ],
};

export function getQueryKeysForCollection(
  collectionId: string,
  userId: string,
): readonly string[][] {
  const fn = COLLECTION_KEY_MAP[collectionId];
  return fn ? fn(userId) : [];
}
