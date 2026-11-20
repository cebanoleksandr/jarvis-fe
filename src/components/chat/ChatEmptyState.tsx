import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';

import { colors } from '../../theme';
import { AssistantAvatar } from './AssistantAvatar';

export function ChatEmptyState() {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box sx={{ transform: 'scale(1.5)', mb: 1 }}>
        <AssistantAvatar />
      </Box>
      <Box
        component="h1"
        sx={{
          m: 0,
          fontWeight: 600,
          fontSize: { xs: 22, sm: 28 },
          lineHeight: '36px',
          letterSpacing: '-0.7px',
          color: colors.textStrong,
        }}
      >
        {t('chat.emptyTitle')}
      </Box>
      <Box
        component="p"
        sx={{ m: 0, fontSize: 14, lineHeight: '22px', color: colors.textMuted }}
      >
        {t('chat.emptySubtitle')}
      </Box>
    </Box>
  );
}
