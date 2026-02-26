'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRecentPublicPrayers,
  getUserPrayers,
  createPrayer,
  updatePrayer,
  deletePrayer,
  type CreatePrayerData,
  type UpdatePrayerData,
} from '@/lib/appwrite/prayers';
import { queryKeys } from '@/lib/queryKeys';

export function usePrayers(userId: string | undefined) {
  const queryClient = useQueryClient();

  const recentQuery = useQuery({
    queryKey: [...queryKeys.prayers.recent()],
    queryFn: getRecentPublicPrayers,
    enabled: !!userId,
  });

  const userQuery = useQuery({
    queryKey: [...queryKeys.prayers.user(userId ?? '')],
    queryFn: () => getUserPrayers(userId!),
    enabled: !!userId,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.prayers.recent() });
    queryClient.invalidateQueries({ queryKey: queryKeys.prayers.user(userId ?? '') });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreatePrayerData) => createPrayer(data),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ prayerId, data }: { prayerId: string; data: UpdatePrayerData }) =>
      updatePrayer(prayerId, data),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (prayerId: string) => deletePrayer(prayerId),
    onSuccess: invalidateAll,
  });

  return {
    recentPrayers: recentQuery.data ?? [],
    userPrayers: userQuery.data ?? [],
    isLoadingRecent: recentQuery.isLoading,
    isLoadingUser: userQuery.isLoading,
    recentError: recentQuery.error,
    userError: userQuery.error,
    createPrayer: createMutation,
    updatePrayer: updateMutation,
    deletePrayer: deleteMutation,
  };
}
