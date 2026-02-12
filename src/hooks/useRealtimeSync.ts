'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import client from '@/lib/appwrite';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { getQueryKeysForCollection } from '@/lib/queryKeys';

export function useRealtimeSync(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channels = [
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.NOTES}.documents`,
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.GRAPH_NODES}.documents`,
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.GRAPH_EDGES}.documents`,
    ];

    const unsubscribe = client.subscribe(channels, (response) => {
      const collectionId = (response.payload as Record<string, string>)?.$collectionId;
      if (!collectionId) return;

      const keys = getQueryKeysForCollection(collectionId, userId);
      for (const key of keys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId, queryClient]);
}
