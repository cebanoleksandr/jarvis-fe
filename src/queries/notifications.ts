import { useMutation, useQuery } from '@tanstack/react-query';

import {
  notificationsService,
  type BriefingKind,
  type NotificationSettings,
  type NotificationSettingsUpdate,
} from '../services';
import { patchCache, queryClient, rollback } from './query-client';
import { queryKeys } from './keys';

export function useNotificationSettings() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: notificationsService.get,
  });
}

export function useUpdateNotificationSettings() {
  return useMutation({
    mutationFn: (patch: NotificationSettingsUpdate) =>
      notificationsService.update(patch),
    onMutate: (patch) =>
      patchCache<NotificationSettings>(queryKeys.notifications, (old) => ({
        ...old,
        ...patch,
      })),
    onError: (_err, _patch, snapshot) => rollback(snapshot),
    onSuccess: (settings) =>
      queryClient.setQueryData(queryKeys.notifications, settings),
  });
}

/**
 * Starts a briefing now. Resolves with `{ conversationId }` right away; open it
 * with `useMessages(conversationId, { pollUntilReply: true })` to wait for the reply.
 */
export function useRunBriefing() {
  return useMutation({
    mutationFn: (kind: BriefingKind) => notificationsService.runNow(kind),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations,
        exact: true,
      }),
  });
}
