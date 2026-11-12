import { API_URL, ApiError, notifyUnauthorized, toApiError } from './api';
import type { AgentEvent } from './types';

/**
 * POSTs to an SSE endpoint and yields the reply events as they arrive.
 * (EventSource is GET-only, so the stream is read with fetch.)
 *
 * Errors raised before streaming starts (400/401/404/409) throw an ApiError;
 * a failure mid-stream arrives as an `error` event. Abort `signal` to stop the
 * reply: the backend keeps the text generated so far.
 */
export async function* streamAgent(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): AsyncGenerator<AgentEvent> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body ?? {}),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new ApiError(0, 'Network error. Check your connection and try again.');
  }

  if (!res.ok || !res.body) {
    const error = toApiError(res.status, await res.json().catch(() => null));
    if (error.isUnauthorized) notifyUnauthorized();
    throw error;
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      // Events are separated by a blank line.
      let end: number;
      while ((end = buffer.search(/\r?\n\r?\n/)) !== -1) {
        const raw = buffer.slice(0, end);
        buffer = buffer.slice(end).replace(/^\r?\n\r?\n/, '');
        const event = parseEvent(raw);
        if (event) yield event;
      }
    }
  } finally {
    // Also runs when the consumer stops iterating early.
    await reader.cancel().catch(() => {});
  }
}

function parseEvent(raw: string): AgentEvent | null {
  let event = 'message';
  const data: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
  }
  if (!data.length) return null;
  try {
    return { event, data: JSON.parse(data.join('\n')) } as AgentEvent;
  } catch {
    return null;
  }
}
