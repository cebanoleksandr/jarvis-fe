import { api } from './api';
import type {
  BriefingKind,
  NotificationSettings,
  NotificationSettingsUpdate,
} from './types';

export const notificationsService = {
  /** Defaults are returned until the user changes something. */
  async get(): Promise<NotificationSettings> {
    return (await api.get<NotificationSettings>('/notifications')).data;
  },

  async update(
    patch: NotificationSettingsUpdate,
  ): Promise<NotificationSettings> {
    return (await api.patch<NotificationSettings>('/notifications', patch))
      .data;
  },

  /**
   * Starts a briefing now and resolves at once with its new conversation.
   * The reply is generated in the background (not streamed): poll
   * `chatService.listMessages(conversationId)` until the assistant message
   * appears. A 404 there means generation failed and the conversation was removed.
   */
  async runNow(kind: BriefingKind): Promise<{ conversationId: string }> {
    return (
      await api.post<{ conversationId: string }>(`/notifications/${kind}/run`)
    ).data;
  },
};
