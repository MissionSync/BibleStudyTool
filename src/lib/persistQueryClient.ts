import { get, set, del } from 'idb-keyval';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

const IDB_KEY = 'bible-notes-query-cache';

export function createIdbPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(IDB_KEY, JSON.stringify(client));
    },
    restoreClient: async () => {
      const data = await get<string>(IDB_KEY);
      if (!data) return undefined;
      return JSON.parse(data) as PersistedClient;
    },
    removeClient: async () => {
      await del(IDB_KEY);
    },
  };
}
