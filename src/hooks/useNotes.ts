'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserNotesPaginated,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  unshareNote,
  type Note,
  type CreateNoteData,
  type UpdateNoteData,
} from '@/lib/appwrite/notes';
import { queryKeys } from '@/lib/queryKeys';

const PAGE_SIZE = 20;

interface UseNotesOptions {
  includeArchived?: boolean;
}

export function useNotes(userId: string | undefined, options?: UseNotesOptions) {
  const queryClient = useQueryClient();
  const includeArchived = options?.includeArchived ?? false;

  const notesQuery = useInfiniteQuery({
    queryKey: [...queryKeys.notes.list(userId ?? ''), { includeArchived }],
    queryFn: ({ pageParam }) =>
      getUserNotesPaginated(userId!, { limit: PAGE_SIZE, cursor: pageParam, includeArchived }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastId : undefined),
    enabled: !!userId,
  });

  const notes = notesQuery.data?.pages.flatMap((page) => page.notes) ?? [];

  const invalidateNotes = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notes.list(userId ?? '') });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateNoteData) => createNote(data),
    onSuccess: invalidateNotes,
  });

  const updateMutation = useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: UpdateNoteData }) =>
      updateNote(noteId, data),
    onSuccess: invalidateNotes,
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: invalidateNotes,
  });

  const archiveMutation = useMutation({
    mutationFn: (noteId: string) => updateNote(noteId, { isArchived: true }),
    onSuccess: invalidateNotes,
  });

  const unarchiveMutation = useMutation({
    mutationFn: (noteId: string) => updateNote(noteId, { isArchived: false }),
    onSuccess: invalidateNotes,
  });

  const shareMutation = useMutation({
    mutationFn: (noteId: string) => shareNote(noteId),
    onSuccess: invalidateNotes,
  });

  const unshareMutation = useMutation({
    mutationFn: (noteId: string) => unshareNote(noteId),
    onSuccess: invalidateNotes,
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
    archiveNote: archiveMutation,
    unarchiveNote: unarchiveMutation,
    shareNote: shareMutation,
    unshareNote: unshareMutation,
  };
}
