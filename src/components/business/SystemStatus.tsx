import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';

import { useHealth } from '../../queries';
import { colors, fonts } from '../../theme';
import { StatusDot } from '../ui/StatusDot';

/** Backend health as a dot + mono label; rechecks every minute. */
export function SystemStatus() {
  const { t } = useTranslation();
  const { data, isPending, isError } = useHealth({ refetchInterval: 60_000 });
  const state = isPending
    ? 'pending'
    : isError || data?.status !== 'ok'
      ? 'down'
      : 'ok';
  const color =
    state === 'ok'
      ? colors.success
      : state === 'down'
        ? colors.warning
        : colors.textMuted;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <StatusDot color={color} glow={state === 'ok'} />
      <Box
        component="span"
        sx={{
          // Phones keep only the dot.
          display: { xs: 'none', sm: 'inline' },
          fontFamily: fonts.mono,
          fontSize: 11,
          lineHeight: '14px',
          letterSpacing: '0.44px',
          color: colors.textSecondary,
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
        }}
      >
        {t(`status.${state}`)}
      </Box>
    </Box>
  );
}
