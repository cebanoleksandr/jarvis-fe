import { api } from './api';
import type { Profile, ProfileUpdate } from './types';

export const profileService = {
  async get(): Promise<Profile> {
    return (await api.get<Profile>('/profile')).data;
  },

  /** Partial update; `preferences` is replaced as a whole, not merged. */
  async update(patch: ProfileUpdate): Promise<Profile> {
    return (await api.patch<Profile>('/profile', patch)).data;
  },
};
