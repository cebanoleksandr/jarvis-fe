import { useMutation, useQuery } from '@tanstack/react-query';

import {
  goalsService,
  type Goal,
  type GoalCreate,
  type GoalUpdate,
} from '../services';
import { patchCache, queryClient, rollback } from './query-client';
import { queryKeys } from './keys';

/** Flat list; build the tree from `parentId`. */
export function useGoals() {
  return useQuery({ queryKey: queryKeys.goals, queryFn: goalsService.list });
}

export function useCreateGoal() {
  return useMutation({
    mutationFn: (goal: GoalCreate) => goalsService.create(goal),
    onSuccess: (goal) =>
      queryClient.setQueryData<Goal[]>(queryKeys.goals, (old) =>
        old ? [...old, goal] : old,
      ),
  });
}

export function useUpdateGoal() {
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: GoalUpdate }) =>
      goalsService.update(id, patch),
    onMutate: ({ id, patch }) =>
      patchCache<Goal[]>(queryKeys.goals, (old) =>
        old.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      ),
    onError: (_err, _vars, snapshot) => rollback(snapshot),
    onSuccess: (goal) =>
      queryClient.setQueryData<Goal[]>(queryKeys.goals, (old) =>
        old?.map((g) => (g.id === goal.id ? goal : g)),
      ),
  });
}

/** Removes the goal together with its projects and tasks, like the backend. */
export function useDeleteGoal() {
  return useMutation({
    mutationFn: (id: string) => goalsService.remove(id),
    onMutate: (id) =>
      patchCache<Goal[]>(queryKeys.goals, (old) => {
        const removed = new Set([id]);
        // Parents may come after children in the list, so repeat until stable.
        for (let grew = true; grew;) {
          grew = false;
          for (const g of old) {
            if (g.parentId && removed.has(g.parentId) && !removed.has(g.id)) {
              removed.add(g.id);
              grew = true;
            }
          }
        }
        return old.filter((g) => !removed.has(g.id));
      }),
    onError: (_err, _id, snapshot) => rollback(snapshot),
  });
}
