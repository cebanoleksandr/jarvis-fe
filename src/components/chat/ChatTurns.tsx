import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import { alpha, keyframes } from '@mui/material/styles';

import type { StreamToolCall } from '../../queries';
import { colors, fonts } from '../../theme';
import { AssistantAvatar } from './AssistantAvatar';
import { formatTime } from './format';
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
        <Box sx={{ ...monoMeta, pt: 1, textAlign: 'right' }}>
          {formatTime(turn.createdAt, i18n.language, timeZone)}
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

/** Text and tool chips in their original order; neighbouring chips share a row. */
function Parts({ parts }: { parts: AssistantPart[] }) {
  const out: ReactNode[] = [];
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
  for (const p of parts) {
    if (p.type === 'tool') chips.push(p);
    else {
      flush();
      out.push(<Markdown key={`text-${out.length}`}>{p.text}</Markdown>);
    }
  }
  flush();
  return <>{out}</>;
}

export function AssistantTurn({
  turn,
  children,
}: {
  turn: Extract<Turn, { kind: 'assistant' }>;
  /** Confirmation cards that belong to this turn. */
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <AssistantRow>
      <Parts parts={turn.parts} />
      {turn.stopReason === 'aborted' && (
        <Box component="span" sx={monoMeta}>
          {t('chat.stopped')}
        </Box>
      )}
      {children}
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
