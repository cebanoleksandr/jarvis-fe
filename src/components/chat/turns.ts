import type { ContentBlock, Message, ToolUseBlock } from '../../services';

export type ToolStatus = 'running' | 'done' | 'error' | 'awaiting';

export type AssistantPart =
  | { type: 'text'; text: string }
  | { type: 'tool'; id: string; name: string; status: ToolStatus };

export type Turn =
  | { kind: 'user'; id: string; text: string; createdAt: string }
  | {
      kind: 'assistant';
      id: string;
      /** Every message folded into this turn; pending actions point at one of them. */
      messageIds: string[];
      parts: AssistantPart[];
      createdAt: string;
      stopReason: string | null;
    };

const isText = (b: ContentBlock): b is { type: 'text'; text: string } =>
  b.type === 'text' && typeof (b as { text?: unknown }).text === 'string';

const isToolUse = (b: ContentBlock): b is ToolUseBlock => b.type === 'tool_use';

/**
 * Turns the stored history into what the chat shows:
 * - user messages that carry only tool results (agent bookkeeping) and
 *   app-written prompts (`synthetic`, briefings) are hidden;
 * - consecutive assistant messages of one agent loop become one turn, with
 *   each tool call marked by the result that came back for it.
 */
export function buildTurns(messages: Message[]): Turn[] {
  const results = new Map<string, boolean>(); // tool_use_id -> is_error
  for (const m of messages) {
    for (const b of m.content) {
      if (b.type === 'tool_result') {
        const r = b as { tool_use_id: string; is_error?: boolean };
        results.set(r.tool_use_id, Boolean(r.is_error));
      }
    }
  }

  const turns: Turn[] = [];
  for (const m of messages) {
    if (m.role === 'user') {
      if (m.synthetic) continue;
      const text = m.content
        .filter(isText)
        .map((b) => b.text)
        .join('\n\n');
      if (!text.trim()) continue;
      turns.push({ kind: 'user', id: m.id, text, createdAt: m.createdAt });
      continue;
    }

    const parts: AssistantPart[] = [];
    for (const b of m.content) {
      if (isText(b) && b.text.trim())
        parts.push({ type: 'text', text: b.text });
      else if (isToolUse(b)) {
        const err = results.get(b.id);
        parts.push({
          type: 'tool',
          id: b.id,
          name: b.name,
          status: err === undefined ? 'awaiting' : err ? 'error' : 'done',
        });
      }
    }

    const last = turns.at(-1);
    if (last?.kind === 'assistant') {
      last.messageIds.push(m.id);
      last.parts.push(...parts);
      last.stopReason = m.stopReason;
    } else {
      turns.push({
        kind: 'assistant',
        id: m.id,
        messageIds: [m.id],
        parts,
        createdAt: m.createdAt,
        stopReason: m.stopReason,
      });
    }
  }
  return turns;
}
