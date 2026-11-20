import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import { alpha, keyframes } from '@mui/material/styles';

import { colors, palette } from '../../theme';

const CYAN = palette.primary.base;
const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 16px -2px ${alpha(CYAN, 0.25)}; }
  50% { box-shadow: 0 0 20px 0 ${alpha(CYAN, 0.55)}; }
`;

/** Concentric orb next to assistant turns; pulses while a reply streams. */
export function AssistantAvatar({ active = false }: { active?: boolean }) {
  const { t } = useTranslation();
  return (
    <Box
      role="img"
      aria-label={t('chat.assistant')}
      sx={{
        width: 32,
        height: 32,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        bgcolor: colors.surfaceContainerHigh,
        border: `1px solid ${alpha(CYAN, 0.4)}`,
        boxShadow: `0 0 16px -2px ${alpha(CYAN, 0.25)}`,
        animation: active ? `${pulse} 1.6s ease-in-out infinite` : 'none',
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <Box
        sx={{
          width: 16,
          height: 16,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          bgcolor: alpha(CYAN, 0.2),
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: colors.accentText,
          }}
        />
      </Box>
    </Box>
  );
}
