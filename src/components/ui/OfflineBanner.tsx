'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--highlight-peach)',
        borderBottom: '1px solid var(--border-light)',
        padding: '0.5rem 1rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
      }}
    >
      You&apos;re offline &mdash; showing cached data
    </div>
  );
}
