import { QueryClient, type QueryKey } from '@tanstack/react-query';

import { ApiError, setUnauthorizedHandler } from '../services';
import { queryKeys } from './keys';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // 4xx will not fix itself on retry; network errors and 5xx get two more tries.
      retry: (failureCount, error) =>
        !(
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) && failureCount < 2,
    },
    mutations: { retry: false },
  },
});

/**
 * Any 401 means the session is gone: `useCurrentUser()` turns into `null`,
 * which is the single signal for route guards to send the user to /login.
 */
setUnauthorizedHandler(() => {
  queryClient.setQueryData(queryKeys.me, null);
});

/**
 * Optimistic-update helper: cancels in-flight fetches of `key`, applies
 * `update` to the cached value and returns a snapshot for `rollback`.
 */
export async function patchCache<T>(
  key: QueryKey,
  update: (old: T) => T,
): Promise<{ key: QueryKey; prev: T | undefined }> {
  await queryClient.cancelQueries({ queryKey: key });
  const prev = queryClient.getQueryData<T>(key);
  if (prev !== undefined) queryClient.setQueryData<T>(key, update(prev));
  return { key, prev };
}

export function rollback(snapshot?: { key: QueryKey; prev: unknown }) {
  if (snapshot && snapshot.prev !== undefined) {
    queryClient.setQueryData(snapshot.key, snapshot.prev);
  }
}
