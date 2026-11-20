import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import { alpha, keyframes } from '@mui/material/styles';
import DoneIcon from '@mui/icons-material/Done';

import type { StreamToolCall } from '../../queries';
import { APP_NAME } from '../../constants';
import { colors, fonts } from '../../theme';
import { AssistantAvatar } from './AssistantAvatar';
import { dayKey, formatTime } from './format';
import { Markdown } from './Markdown';
import { ToolChip } from './ToolChip';
import type { AssistantPart, Turn } from './turns';

const monoMeta = {
  fontFamily: fonts.mono,
  fontWeight: 500,
  fontSize: 10,
  lineHeight: '12px',
  letterSpacing: '0.6px',
  color: alpha(colors.textSecondary, 0.5),
} as const;

export function UserBubble({
  turn,
  timeZone,
}: {
  turn: Extract<Turn, { kind: 'user' }>;
  timeZone?: string;
}) {
  const { i18n } = useTranslation();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Box
        sx={{
          maxWidth: { xs: '90%', sm: '80%' },
          px: '21px',
          pt: '14px',
          pb: '15px',
          borderRadius: '16px 16px 2px 16px',
          bgcolor: alpha(colors.surfaceContainerHigh, 0.8),
          border: `1px solid ${alpha(colors.outline, 0.3)}`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <Box
          sx={{
            fontSize: 14,
            lineHeight: '22.75px',
            color: colors.text,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
          }}
        >
          {turn.text}
        </Box>
        <Box
          sx={{
            ...monoMeta,
            pt: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '6px',
          }}
        >
          {formatTime(turn.createdAt, i18n.language, timeZone)}
          {/* Saved on the server (no longer the optimistic copy). */}
          {!turn.id.startsWith('optimistic-') && (
            <DoneIcon sx={{ fontSize: 12, color: colors.accentText }} />
          )}
        </Box>
      </Box>
    </Box>
  );
}

/** Avatar column + content column shared by stored and streaming turns. */
function AssistantRow({
  active,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Box sx={{ pt: 0.5 }}>
        <AssistantAvatar active={active} />
      </Box>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function Chips({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{children}</Box>
  );
}

/**
 * Text and tool chips in their original order; neighbouring chips share a
 * row. `after(messageId)` is placed right after that message's parts, so a
 * confirmation card sits under the call that proposed it.
 */
function Parts({
  parts,
  messageIds,
  after,
}: {
  parts: AssistantPart[];
  messageIds: string[];
  after?: (messageId: string) => ReactNode;
}) {
  const out: ReactNode[] = [];
  const placed = new Set<string>();
  let chips: AssistantPart[] = [];
  const flush = () => {
    if (!chips.length) return;
    out.push(
      <Chips key={`chips-${out.length}`}>
        {chips.map(
          (c) =>
            c.type === 'tool' && (
              <ToolChip key={c.id} name={c.name} status={c.status} />
            ),
        )}
      </Chips>,
    );
    chips = [];
  };
  const place = (messageId: string) => {
    flush();
    placed.add(messageId);
    const node = after?.(messageId);
    if (node) out.push(<Fragment key={`after-${messageId}`}>{node}</Fragment>);
  };
  parts.forEach((p, i) => {
    if (p.type === 'tool') chips.push(p);
    else {
      flush();
      out.push(<Markdown key={`text-${out.length}`}>{p.text}</Markdown>);
    }
    if (parts[i + 1]?.messageId !== p.messageId) place(p.messageId);
  });
  flush();
  // Messages without visible parts still get their cards.
  for (const id of messageIds) if (!placed.has(id)) place(id);
  return <>{out}</>;
}

export function AssistantTurn({
  turn,
  timeZone,
  renderAfter,
}: {
  turn: Extract<Turn, { kind: 'assistant' }>;
  timeZone?: string;
  /** Rendered after each message of the turn (its confirmation cards). */
  renderAfter?: (messageId: string) => ReactNode;
}) {
  const { t, i18n } = useTranslation();
  return (
    <AssistantRow>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: -0.5 }}>
        <Box
          component="span"
          sx={{
            fontWeight: 600,
            fontSize: 14,
            lineHeight: '18px',
            color: colors.text,
          }}
        >
          {APP_NAME}
        </Box>
        <Box component="span" sx={monoMeta}>
          {formatTime(turn.createdAt, i18n.language, timeZone)}
        </Box>
      </Box>
      <Parts
        parts={turn.parts}
        messageIds={turn.messageIds}
        after={renderAfter}
      />
      {turn.stopReason === 'aborted' && (
        <Box component="span" sx={monoMeta}>
          {t('chat.stopped')}
        </Box>
      )}
    </AssistantRow>
  );
}

const blink = keyframes`50% { opacity: 0.2; }`;

/** The reply as it streams in; replaced by the stored turn once it finishes. */
export function LiveTurn({
  text,
  toolCalls,
  streaming,
  children,
}: {
  text: string;
  toolCalls: StreamToolCall[];
  streaming: boolean;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <AssistantRow active={streaming}>
      {toolCalls.length > 0 && (
        <Chips>
          {toolCalls.map((c) => (
            <ToolChip key={c.id} name={c.name} status={c.status} />
          ))}
        </Chips>
      )}
      {text ? (
        <Markdown>{text}</Markdown>
      ) : (
        streaming && (
          <Box
            component="span"
            role="status"
            sx={{
              ...monoMeta,
              pt: 1,
              animation: `${blink} 1.2s ease-in-out infinite`,
            }}
          >
            {t('chat.thinking')}
          </Box>
        )
      )}
      {children}
    </AssistantRow>
  );
}

/** `TODAY · 14:01` rule between turns from different days. */
export function DaySeparator({
  at,
  timeZone,
}: {
  at: string;
  timeZone?: string;
}) {
  const { t, i18n } = useTranslation();
  const key = dayKey(at, timeZone);
  const now = new Date();
  const label =
    key === dayKey(now, timeZone)
      ? t('chatDay.today')
      : key === dayKey(new Date(now.getTime() - 86_400_000), timeZone)
        ? t('chatDay.yesterday')
        : new Intl.DateTimeFormat(i18n.language, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            timeZone: 'UTC',
          }).format(new Date(`${key}T00:00:00Z`));

  return (
    <Box
      role="separator"
      sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}
    >
      <Box
        sx={{ flex: 1, height: '1px', bgcolor: alpha(colors.outline, 0.2) }}
      />
      <Box
        component="span"
        sx={{ ...monoMeta, letterSpacing: '1px', textTransform: 'uppercase' }}
      >
        {label} · {formatTime(at, i18n.language, timeZone)}
      </Box>
      <Box
        sx={{ flex: 1, height: '1px', bgcolor: alpha(colors.outline, 0.2) }}
      />
    </Box>
  );
}
