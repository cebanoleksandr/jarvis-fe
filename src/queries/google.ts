import { useMutation, useQuery } from '@tanstack/react-query';

import {
  googleService,
  type DateRange,
  type GoogleConnection,
} from '../services';
import { queryClient } from './query-client';
import { queryKeys } from './keys';

/**
 * Calendar events for a day range; today when `range` is omitted. On
 * `error.isGoogleReauthRequired` offer "Sign in with Google" again.
 */
export function useCalendarEvents(range?: DateRange) {
  return useQuery({
    queryKey: queryKeys.calendarEvents(range?.from, range?.to),
    queryFn: () => googleService.events(range),
    staleTime: 60_000,
  });
}

export function useTasks(options: { includeCompleted?: boolean } = {}) {
  const includeCompleted = options.includeCompleted ?? false;
  return useQuery({
    queryKey: queryKeys.tasks(includeCompleted),
    queryFn: () => googleService.tasks(includeCompleted),
    staleTime: 60_000,
  });
}

export function useGoogleConnection() {
  return useQuery({
    queryKey: queryKeys.googleConnection,
    queryFn: googleService.connection,
  });
}

export function useDisconnectGoogle() {
  return useMutation({
    mutationFn: googleService.disconnect,
    onSuccess: () => {
      queryClient.setQueryData<GoogleConnection>(queryKeys.googleConnection, {
        connected: false,
        services: { calendar: false, tasks: false },
        connectedAt: null,
      });
      // Cached events and tasks belong to the revoked account.
      queryClient.removeQueries({ queryKey: queryKeys.calendar });
      queryClient.removeQueries({ queryKey: ['tasks'] });
    },
  });
}
