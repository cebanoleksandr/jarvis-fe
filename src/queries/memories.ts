import { useMutation, useQuery } from '@tanstack/react-query';

import { memoriesService, type Memory } from '../services';
import { patchCache, queryClient, rollback } from './query-client';
import { queryKeys } from './keys';

export function useMemories() {
  return useQuery({
    queryKey: queryKeys.memories,
    queryFn: memoriesService.list,
  });
}

export function useCreateMemory() {
  return useMutation({
    mutationFn: (text: string) => memoriesService.create(text),
    // Order is decided by the backend, so refetch instead of guessing.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.memories }),
  });
}

export function useUpdateMemory() {
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      memoriesService.update(id, text),
    onMutate: ({ id, text }) =>
      patchCache<Memory[]>(queryKeys.memories, (old) =>
        old.map((m) => (m.id === id ? { ...m, text } : m)),
      ),
    onError: (_err, _vars, snapshot) => rollback(snapshot),
    onSuccess: (memory) =>
      queryClient.setQueryData<Memory[]>(queryKeys.memories, (old) =>
        old?.map((m) => (m.id === memory.id ? memory : m)),
      ),
  });
}

export function useDeleteMemory() {
  return useMutation({
    mutationFn: (id: string) => memoriesService.remove(id),
    onMutate: (id) =>
      patchCache<Memory[]>(queryKeys.memories, (old) =>
        old.filter((m) => m.id !== id),
      ),
    onError: (_err, _id, snapshot) => rollback(snapshot),
  });
}
