import { api } from './api';
import type { Goal, GoalCreate, GoalUpdate } from './types';

export const goalsService = {
  /** Flat list; build the goal -> project -> task tree from `parentId`. */
  async list(): Promise<Goal[]> {
    return (await api.get<Goal[]>('/goals')).data;
  },

  async create(goal: GoalCreate): Promise<Goal> {
    return (await api.post<Goal>('/goals', goal)).data;
  },

  async update(id: string, patch: GoalUpdate): Promise<Goal> {
    return (await api.patch<Goal>(`/goals/${id}`, patch)).data;
  },

  /** Children are deleted with the parent. */
  async remove(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  },
};
