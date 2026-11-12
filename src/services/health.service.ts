import { api } from './api';
import type { Health } from './types';

export const healthService = {
  /** Rejects with ApiError 503 when the database is down. */
  async check(): Promise<Health> {
    return (await api.get<Health>('/health')).data;
  },
};
