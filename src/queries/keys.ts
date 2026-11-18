/** Every query key in one place, so invalidation never misses a spot. */
export const queryKeys = {
  me: ['auth', 'me'] as const,
  profile: ['profile'] as const,
  conversations: ['conversations'] as const,
  messages: (conversationId: string) =>
    ['conversations', conversationId, 'messages'] as const,
  pendingActions: (conversationId: string) =>
    ['conversations', conversationId, 'pending-actions'] as const,
  goals: ['goals'] as const,
  memories: ['memories'] as const,
  notifications: ['notifications'] as const,
  health: ['health'] as const,
  /** Prefix of every Google-backed query, to drop them all on disconnect. */
  calendar: ['calendar'] as const,
  calendarEvents: (from?: string, to?: string) =>
    ['calendar', 'events', from ?? 'today', to ?? from ?? 'today'] as const,
  tasks: (includeCompleted: boolean) =>
    ['tasks', { includeCompleted }] as const,
  googleConnection: ['google', 'connection'] as const,
};
