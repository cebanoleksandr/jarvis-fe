import { useMutation, useQuery } from '@tanstack/react-query';

import { authService } from '../services';
import { queryClient } from './query-client';
import { queryKeys } from './keys';

/** `null` = not logged in; `undefined` (while loading) = not known yet. */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: authService.currentUser,
    staleTime: 5 * 60_000,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      // Drop everything that belonged to the previous user.
      queryClient.clear();
      queryClient.setQueryData(queryKeys.me, null);
    },
  });
}
