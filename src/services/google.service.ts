import { api } from './api';
import type {
  CalendarEventsResponse,
  DateRange,
  GoogleConnection,
  TasksResponse,
} from './types';

/**
 * Read-only Calendar and Tasks data plus the connection itself. Creating
 * events and tasks goes through the assistant and its confirmation cards.
 *
 * Calendar and Tasks reject with ApiError 409 (`isGoogleReauthRequired`) when
 * the user must sign in with Google again, 502 on other Google failures.
 */
export const googleService = {
  /** Today (in the user's timezone) when no range is given. */
  async events(range?: DateRange): Promise<CalendarEventsResponse> {
    return (
      await api.get<CalendarEventsResponse>('/calendar/events', {
        params: range,
      })
    ).data;
  },

  /** Open tasks of the default list; completed ones too on request. */
  async tasks(includeCompleted = false): Promise<TasksResponse> {
    return (
      await api.get<TasksResponse>('/tasks', {
        params: includeCompleted ? { includeCompleted: true } : undefined,
      })
    ).data;
  },

  async connection(): Promise<GoogleConnection> {
    return (await api.get<GoogleConnection>('/google/connection')).data;
  },

  /** Revokes access at Google and forgets the tokens. Sign in with Google to reconnect. */
  async disconnect(): Promise<void> {
    await api.delete('/google/connection');
  },
};
