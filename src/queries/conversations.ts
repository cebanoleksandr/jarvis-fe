import { useMutation, useQuery } from '@tanstack/react-query';

import {
  chatService,
  pendingActionsService,
  type Conversation,
  type PendingAction,
} from '../services';
import { patchCache, queryClient, rollback } from './query-client';
import { queryKeys } from './keys';

/** Most recently updated first. */
export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: chatService.listConversations,
  });
}

export function useCreateConversation() {
  return useMutation({
    mutationFn: chatService.createConversation,
    onSuccess: (conversation) => {
      queryClient.setQueryData<Conversation[]>(
        queryKeys.conversations,
        (old) => (old ? [conversation, ...old] : old),
      );
      queryClient.setQueryData(queryKeys.messages(conversation.id), []);
      queryClient.setQueryData(queryKeys.pendingActions(conversation.id), []);
    },
  });
}

export function useDeleteConversation() {
  return useMutation({
    mutationFn: (id: string) => chatService.deleteConversation(id),
    onMutate: (id) =>
      patchCache<Conversation[]>(queryKeys.conversations, (old) =>
        old.filter((c) => c.id !== id),
      ),
    onError: (_err, _id, snapshot) => rollback(snapshot),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.messages(id) });
      queryClient.removeQueries({ queryKey: queryKeys.pendingActions(id) });
    },
  });
}

/**
 * Message history. `pollUntilReply` refetches every 2s until the last message
 * is from the assistant: use it for a briefing started with `useRunBriefing`
 * (a 404 then means generation failed and polling stops).
 */
export function useMessages(
  conversationId: string | undefined,
  options: { pollUntilReply?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.messages(conversationId ?? ''),
    queryFn: () => chatService.listMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: options.pollUntilReply
      ? (query) => {
          if (query.state.status === 'error') return false;
          const last = query.state.data?.at(-1);
          return last?.role === 'assistant' ? false : 2000;
        }
      : undefined,
  });
}

/** Confirmation cards of a conversation, including already decided ones. */
export function usePendingActions(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.pendingActions(conversationId ?? ''),
    queryFn: () => pendingActionsService.list(conversationId!),
    enabled: !!conversationId,
  });
}

/** Undo on a resolved card: deletes what the action created in Google. */
export function useUndoAction(conversationId: string) {
  return useMutation({
    mutationFn: (actionId: string) => pendingActionsService.undo(actionId),
    onSuccess: (action) =>
      queryClient.setQueryData<PendingAction[]>(
        queryKeys.pendingActions(conversationId),
        (old) => old?.map((a) => (a.id === action.id ? action : a)),
      ),
  });
}
