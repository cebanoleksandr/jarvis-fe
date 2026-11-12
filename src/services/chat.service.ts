import { api } from './api';
import { streamAgent } from './sse';
import type { AgentEvent, Conversation, Message } from './types';

export const chatService = {
  async createConversation(): Promise<Conversation> {
    return (await api.post<Conversation>('/conversations')).data;
  },

  /** Most recently updated first (up to 100). */
  async listConversations(): Promise<Conversation[]> {
    return (await api.get<Conversation[]>('/conversations')).data;
  },

  async deleteConversation(id: string): Promise<void> {
    await api.delete(`/conversations/${id}`);
  },

  /** Full history in order, including tool_use / tool_result blocks. */
  async listMessages(conversationId: string): Promise<Message[]> {
    return (
      await api.get<Message[]>(`/conversations/${conversationId}/messages`)
    ).data;
  },

  /**
   * Sends a user message and streams the assistant's reply:
   *
   *   for await (const ev of chatService.sendMessage(id, text, ctrl.signal)) { ... }
   *
   * Sending while a confirmation card is open dismisses that action.
   */
  sendMessage(
    conversationId: string,
    text: string,
    signal?: AbortSignal,
  ): AsyncGenerator<AgentEvent> {
    return streamAgent(
      `/conversations/${conversationId}/messages`,
      { text },
      signal,
    );
  },
};
