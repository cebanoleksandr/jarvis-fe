import { api } from './api';
import type { Memory } from './types';

export const memoriesService = {
  async list(): Promise<Memory[]> {
    return (await api.get<Memory[]>('/memories')).data;
  },

  async create(text: string): Promise<Memory> {
    return (await api.post<Memory>('/memories', { text })).data;
  },

  async update(id: string, text: string): Promise<Memory> {
    return (await api.patch<Memory>(`/memories/${id}`, { text })).data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/memories/${id}`);
  },
};
