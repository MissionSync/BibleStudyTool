'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserNotesPaginated,
  createNote,
  updateNote,
  deleteNote,
  type Note,
  type CreateNoteData,
  type UpdateNoteData,
} from '@/lib/appwrite/notes';
import { queryKeys } from '@/lib/queryKeys';

const PAGE_SIZE = 20;

export function useNotes(userId: string | undefined) {
  const queryClient = useQueryClient();

  const notesQuery = useInfiniteQuery({
    queryKey: queryKeys.notes.list(userId ?? ''),
    queryFn: ({ pageParam }) =>
      getUserNotesPaginated(userId!, { limit: PAGE_SIZE, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastId : undefined),
    enabled: !!userId,
  });

  const notes = notesQuery.data?.pages.flatMap((page) => page.notes) ?? [];

  const createMutation = useMutation({
    mutationFn: (data: CreateNoteData) => createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.list(userId ?? '') });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: UpdateNoteData }) =>
      updateNote(noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.list(userId ?? '') });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.list(userId ?? '') });
    },
  });

  return {
    notes,
    isLoading: notesQuery.isLoading,
    error: notesQuery.error,
    hasNextPage: notesQuery.hasNextPage,
    fetchNextPage: notesQuery.fetchNextPage,
    isFetchingNextPage: notesQuery.isFetchingNextPage,
    createNote: createMutation,
    updateNote: updateMutation,
    deleteNote: deleteMutation,
  };
}
