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
};
