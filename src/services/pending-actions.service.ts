import { api } from './api';
import { streamAgent } from './sse';
import type { AgentEvent, PendingAction } from './types';

export const pendingActionsService = {
  /** Open confirmation cards of a conversation (e.g. after a page reload). */
  async list(conversationId: string): Promise<PendingAction[]> {
    return (
      await api.get<PendingAction[]>(
        `/conversations/${conversationId}/pending-actions`,
      )
    ).data;
  },

  /**
   * Runs the action and streams the continued reply. Pass `args` only when the
   * user edited them; they are validated against the tool's schema (400).
   * A second decision on the same action fails with 409.
   */
  confirm(
    id: string,
    args?: Record<string, unknown>,
    signal?: AbortSignal,
  ): AsyncGenerator<AgentEvent> {
    return streamAgent(
      `/pending-actions/${id}/confirm`,
      args ? { args } : {},
      signal,
    );
  },

  /** Declines the action and streams the continued reply. */
  cancel(id: string, signal?: AbortSignal): AsyncGenerator<AgentEvent> {
    return streamAgent(`/pending-actions/${id}/cancel`, undefined, signal);
  },
};
