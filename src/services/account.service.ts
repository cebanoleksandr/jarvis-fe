import { api } from './api';

export const accountService = {
  /** All of the user's data as a JSON file (no OAuth tokens). */
  async export(): Promise<{ blob: Blob; filename: string }> {
    const res = await api.get<Blob>('/account/export', {
      responseType: 'blob',
    });
    const disposition = String(res.headers['content-disposition'] ?? '');
    const filename =
      /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'jarvis-export.json';
    return { blob: res.data, filename };
  },

  /**
   * Permanently deletes the account and everything in it, and ends the
   * session. `email` must repeat the account email (400 otherwise).
   */
  async remove(email: string): Promise<void> {
    await api.delete('/account', { data: { email } });
  },
};
