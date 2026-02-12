'use client';

import { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createIdbPersister } from '@/lib/persistQueryClient';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const persister = createIdbPersister();

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: TWENTY_FOUR_HOURS,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: TWENTY_FOUR_HOURS }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
