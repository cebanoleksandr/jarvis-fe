import { useCallback, useRef, useState } from 'react';

import {
  chatService,
  pendingActionsService,
  type AgentEvent,
  type Message,
  type PendingAction,
} from '../services';
import { queryClient } from './query-client';
import { queryKeys } from './keys';

export interface StreamToolCall {
  id: string;
  name: string;
  input: unknown;
  status: 'running' | 'done' | 'error';
}

/** The part of the reply that is still arriving and not in the cache yet. */
export interface ChatStreamState {
  isStreaming: boolean;
  text: string;
  toolCalls: StreamToolCall[];
  /** Last `done.stopReason`, e.g. `awaiting_confirmation`, `end_turn`. */
  stopReason: string | null;
  /** ApiError before the stream started, or a mid-stream `error` event. */
  error: Error | null;
}

const IDLE: ChatStreamState = {
  isStreaming: false,
  text: '',
  toolCalls: [],
  stopReason: null,
  error: null,
};

function upsertPendingAction(conversationId: string, action: PendingAction) {
  queryClient.setQueryData<PendingAction[]>(
    queryKeys.pendingActions(conversationId),
    (old = []) =>
      old.some((a) => a.id === action.id)
        ? old.map((a) => (a.id === action.id ? action : a))
        : [...old, action],
  );
}

/**
 * Sends messages and decides confirmation cards in one conversation,
 * streaming the assistant's reply.
 *
 * Render `useMessages()` + `usePendingActions()` as the history, then
 * `state.text` / `state.toolCalls` as the reply in progress. When the stream
 * ends the caches are refetched and the live part is cleared, so nothing shows twice.
 *
 * Leaving the conversation does not abort the reply: it finishes on the
 * server and the caches are still refreshed. Call `abort()` to stop it.
 */
export function useChatStream(conversationId: string | undefined) {
  const [stream, setStream] = useState<
    ChatStreamState & { conversationId?: string }
  >(IDLE);
  // The run whose events may update local state. Starting a run in another
  // conversation replaces it, which detaches the old one (it still finishes
  // on the server and refreshes the caches). No unmount cleanup on purpose:
  // StrictMode's simulated remount would detach a run that just started.
  const runRef = useRef<{ convId: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (
      convId: string,
      start: (signal: AbortSignal) => AsyncGenerator<AgentEvent>,
    ) => {
      if (runRef.current?.convId === convId) return; // one reply at a time
      const runId = { convId };
      const ctrl = new AbortController();
      runRef.current = runId;
      abortRef.current = ctrl;

      const update = (fn: (s: ChatStreamState) => ChatStreamState) => {
        if (runRef.current === runId)
          setStream((s) => ({ ...fn(s), conversationId: convId }));
      };
      update(() => ({ ...IDLE, isStreaming: true }));

      try {
        for await (const ev of start(ctrl.signal)) {
          switch (ev.event) {
            case 'message_start':
              // Swap the optimistic id for the real one.
              queryClient.setQueryData<Message[]>(
                queryKeys.messages(convId),
                (old) =>
                  old?.map((m) =>
                    m.id.startsWith('optimistic-')
                      ? { ...m, id: ev.data.userMessageId }
                      : m,
                  ),
              );
              break;
            case 'delta':
              update((s) => ({ ...s, text: s.text + ev.data.text }));
              break;
            case 'tool_call':
              update((s) => ({
                ...s,
                toolCalls: [...s.toolCalls, { ...ev.data, status: 'running' }],
              }));
              break;
            case 'tool_result':
              update((s) => ({
                ...s,
                toolCalls: s.toolCalls.map((t) =>
                  t.id === ev.data.id
                    ? { ...t, status: ev.data.isError ? 'error' : 'done' }
                    : t,
                ),
              }));
              break;
            case 'action_required':
            case 'action_resolved':
              upsertPendingAction(convId, ev.data);
              break;
            case 'done':
              update((s) => ({ ...s, stopReason: ev.data.stopReason }));
              break;
            case 'error':
              update((s) => ({ ...s, error: new Error(ev.data.message) }));
              break;
          }
        }
      } catch (err) {
        if (!ctrl.signal.aborted) {
          update((s) => ({
            ...s,
            error: err instanceof Error ? err : new Error(String(err)),
          }));
        }
      } finally {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: queryKeys.messages(convId),
          }),
          queryClient.invalidateQueries({
            queryKey: queryKeys.pendingActions(convId),
          }),
          // Title and order change after a reply.
          queryClient.invalidateQueries({
            queryKey: queryKeys.conversations,
            exact: true,
          }),
        ]);
        // History now holds the reply; keep only the outcome.
        update((s) => ({ ...IDLE, stopReason: s.stopReason, error: s.error }));
        if (runRef.current === runId) {
          runRef.current = null;
          abortRef.current = null;
        }
      }
    },
    [],
  );

  const send = useCallback(
    (text: string) => {
      if (!conversationId || runRef.current?.convId === conversationId) return;
      queryClient.setQueryData<Message[]>(
        queryKeys.messages(conversationId),
        (old = []) => [
          ...old,
          {
            id: `optimistic-${Date.now()}`,
            role: 'user',
            content: [{ type: 'text', text }],
            synthetic: false,
            stopReason: null,
            createdAt: new Date().toISOString(),
          },
        ],
      );
      return run(conversationId, (signal) =>
        chatService.sendMessage(conversationId, text, signal),
      );
    },
    [conversationId, run],
  );

  /** Pass `args` only when the user edited them. */
  const confirm = useCallback(
    (actionId: string, args?: Record<string, unknown>) => {
      if (!conversationId) return;
      return run(conversationId, (signal) =>
        pendingActionsService.confirm(actionId, args, signal),
      );
    },
    [conversationId, run],
  );

  const cancel = useCallback(
    (actionId: string) => {
      if (!conversationId) return;
      return run(conversationId, (signal) =>
        pendingActionsService.cancel(actionId, signal),
      );
    },
    [conversationId, run],
  );

  /** Stops the reply; the backend keeps what was generated so far. */
  const abort = useCallback(() => abortRef.current?.abort(), []);

  const state: ChatStreamState =
    stream.conversationId === conversationId ? stream : IDLE;

  return { state, send, confirm, cancel, abort };
}
