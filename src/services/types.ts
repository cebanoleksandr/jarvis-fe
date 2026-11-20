/** DTOs returned by the backend. Dates arrive as ISO-8601 strings (UTC). */

export interface User {
  id: string;
  email: string;
  name: string | null;
  /** IANA zone, e.g. Europe/Kyiv. */
  timezone: string;
}

export interface Profile {
  name: string | null;
  email: string;
  timezone: string;
  about: string;
  preferences: Record<string, string>;
}

export type ProfileUpdate = Partial<Omit<Profile, 'email'>>;

export const GOAL_STATUSES = ['active', 'paused', 'done', 'dropped'] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

/** Goal -> project -> task, linked through parentId (max depth 3). */
export interface Goal {
  id: string;
  parentId: string | null;
  title: string;
  notes: string;
  status: GoalStatus;
  /** Calendar day, YYYY-MM-DD. */
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalCreate {
  title: string;
  notes?: string;
  status?: GoalStatus;
  deadline?: string | null;
  parentId?: string | null;
}

export type GoalUpdate = Partial<GoalCreate>;

export interface Memory {
  id: string;
  text: string;
  createdAt: string;
}

export const BRIEFING_KINDS = ['morning', 'evening', 'weekly'] as const;
export type BriefingKind = (typeof BRIEFING_KINDS)[number];

/** `chat` for ordinary dialogs, otherwise the briefing that opened it. */
export type ConversationKind = 'chat' | BriefingKind;

export interface Conversation {
  id: string;
  title: string | null;
  kind: ConversationKind;
  createdAt: string;
  updatedAt: string;
}

export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
}

export interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

/** Provider-specific blocks (e.g. thinking) are passed through as-is. */
export interface OtherBlock {
  type: string;
  [key: string]: unknown;
}

export type ContentBlock =
  TextBlock | ToolUseBlock | ToolResultBlock | OtherBlock;

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: ContentBlock[];
  /**
   * True for prompts written by the app (scheduled briefings), not the user.
   * Do not render these as user messages.
   */
  synthetic: boolean;
  /** Assistant only: `end_turn`, `max_tokens`, `aborted`, ... */
  stopReason: string | null;
  createdAt: string;
}

/** `undone`: executed, then reverted by the user with Undo. */
export type PendingActionStatus =
  | 'pending'
  | 'executing'
  | 'executed'
  | 'failed'
  | 'cancelled'
  | 'dismissed'
  | 'undone';

export interface ActionSummary {
  title: string;
  details: Record<string, string>;
}

/** A mutating tool call waiting for (or already past) the user's decision. */
export interface PendingAction {
  id: string;
  conversationId: string;
  messageId: string;
  tool: string;
  args: Record<string, unknown>;
  /** What the model proposed, when the user edited the arguments. */
  originalArgs: Record<string, unknown> | null;
  summary: ActionSummary | null;
  status: PendingActionStatus;
  result: unknown;
  error: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

/**
 * Events of a streamed assistant reply. `done.stopReason` is
 * `awaiting_confirmation` when a confirmation card needs a decision;
 * other values: `end_turn`, `max_tokens`, `refusal`, `max_steps`, ...
 */
export type AgentEvent =
  | { event: 'message_start'; data: { userMessageId: string } }
  | { event: 'delta'; data: { text: string } }
  | { event: 'tool_call'; data: { id: string; name: string; input: unknown } }
  | {
      event: 'tool_result';
      data: { id: string; name: string; isError: boolean };
    }
  | { event: 'action_required'; data: PendingAction }
  | { event: 'action_resolved'; data: PendingAction }
  | {
      event: 'done';
      data: { assistantMessageId: string | null; stopReason: string | null };
    }
  | { event: 'error'; data: { message: string } };

/** Briefing schedule. Times are `HH:mm` in the user's profile time zone. */
export interface NotificationSettings {
  morningEnabled: boolean;
  morningTime: string;
  eveningEnabled: boolean;
  eveningTime: string;
  weeklyEnabled: boolean;
  /** 0 = Sunday ... 6 = Saturday. */
  weeklyDay: number;
  weeklyTime: string;
}

export type NotificationSettingsUpdate = Partial<NotificationSettings>;

/** A day range in the user's timezone, `YYYY-MM-DD`, at most 31 days. */
export interface DateRange {
  from: string;
  /** Inclusive; defaults to `from`. */
  to?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  /** Local date-time with offset, or `YYYY-MM-DD` for all-day events. */
  start: string;
  /** For all-day events: the day after the last one (exclusive). */
  end: string;
  allDay: boolean;
  location?: string;
  description?: string;
  /** Opens the event in Google Calendar. */
  link?: string;
}

export interface CalendarEventsResponse {
  timezone: string;
  /** Ordered by start, at most 100. */
  events: CalendarEvent[];
  /** More events exist than were returned. */
  truncated: boolean;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  /** `YYYY-MM-DD`; Google Tasks has no due time. */
  due?: string;
  status: 'needsAction' | 'completed';
  completedAt?: string;
  link?: string;
}

export interface TasksResponse {
  tasks: GoogleTask[];
  truncated: boolean;
}

export interface GoogleConnection {
  connected: boolean;
  /** Services the user actually granted at sign-in. */
  services: { calendar: boolean; tasks: boolean };
  connectedAt: string | null;
}

export interface Health {
  status: 'ok' | 'error';
  db: 'up' | 'down';
}
