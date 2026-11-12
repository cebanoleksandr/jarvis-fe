import { API_URL, api, ApiError } from './api';
import type { User } from './types';

export const authService = {
  /** Full-page redirect: the backend sets the flow cookie and sends the user to Google. */
  loginWithGoogle(): void {
    window.location.assign(`${API_URL}/auth/google`);
  },

  async me(): Promise<User> {
    return (await api.get<User>('/auth/me')).data;
  },

  /** Like `me()`, but resolves to null when there is no valid session. */
  async currentUser(): Promise<User | null> {
    try {
      // Bypass the global 401 handler: "not logged in" is an expected answer here.
      const res = await api.get<User>('/auth/me', {
        validateStatus: (s) => s === 200 || s === 401,
      });
      return res.status === 200 ? res.data : null;
    } catch (err) {
      // The account behind the session no longer exists.
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
