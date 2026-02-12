'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  useRealtimeSync(user?.$id);
  return <>{children}</>;
}
