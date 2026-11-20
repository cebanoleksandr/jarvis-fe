import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';

import { colors, fonts } from '../../theme';
import type { ToolStatus } from './turns';

const STATUS_COLOR: Record<ToolStatus, string> = {
  running: colors.accentText,
  done: colors.accentText,
  error: colors.error,
  awaiting: colors.warning,
};

/** Mono badge for one tool call: dot, tool name, status icon. */
export function ToolChip({
  name,
  status,
}: {
  name: string;
  status: ToolStatus;
}) {
  const { t } = useTranslation();
  const label =
    status === 'error'
      ? t('action.failed')
      : status === 'awaiting'
        ? t('action.awaiting')
        : status === 'running'
          ? t('action.executing')
          : t('action.executed');

  return (
    <Box
      title={label}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        px: '11px',
        py: '5px',
        borderRadius: '6px',
        bgcolor: colors.surfaceContainerLow,
        border: `1px solid ${alpha(colors.outline, 0.3)}`,
        fontFamily: fonts.mono,
        fontSize: 10,
        lineHeight: '12px',
        letterSpacing: '0.6px',
        color: colors.text,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: STATUS_COLOR[status],
        }}
      />
      {name}
      <Box
        component="span"
        aria-label={label}
        sx={{ display: 'flex', color: alpha(colors.textSecondary, 0.7) }}
      >
        {status === 'running' && (
          <CircularProgress size={9} thickness={6} color="inherit" />
        )}
        {status === 'done' && <CheckCircleOutlineIcon sx={{ fontSize: 11 }} />}
        {status === 'error' && (
          <ErrorOutlineIcon sx={{ fontSize: 11, color: colors.error }} />
        )}
        {status === 'awaiting' && (
          <ScheduleIcon sx={{ fontSize: 11, color: colors.warning }} />
        )}
      </Box>
    </Box>
  );
}
