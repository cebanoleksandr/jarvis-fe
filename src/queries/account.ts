import { useMutation } from '@tanstack/react-query';

import { accountService } from '../services';
import { queryClient } from './query-client';
import { queryKeys } from './keys';

/** Downloads the user's data as a JSON file. */
export function useExportAccount() {
  return useMutation({
    mutationFn: accountService.export,
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

/**
 * Deletes the account for good. On success the session is gone and
 * `useCurrentUser()` becomes null, so the route guard leads to /login.
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: (email: string) => accountService.remove(email),
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(queryKeys.me, null);
    },
  });
}
