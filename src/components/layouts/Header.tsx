import { useTranslation } from 'react-i18next';
import { useMatch, useMatches } from 'react-router-dom';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';

import { APP_NAME } from '../../constants';
import { useConversations } from '../../queries';
import { colors } from '../../theme';
import type en from '../../i18n/locales/en.json';
import { LanguageSwitcher } from '../business/LanguageSwitcher';
import { SystemStatus } from '../business/SystemStatus';

export const HEADER_HEIGHT = 56;

/** Set on a route as `handle: { title: 'today' }` to fill the breadcrumb from `pageTitle.*`. */
export interface RouteHandle {
  title?: keyof typeof en.pageTitle;
}

interface HeaderProps {
  /** Shown below `md`, where the sidebar lives in a drawer. */
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation();
  const title = useMatches()
    .map((m) => (m.handle as RouteHandle | undefined)?.title)
    .filter(Boolean)
    .at(-1);
  // In a conversation the breadcrumb shows its title instead of "Chat".
  const chatId = useMatch('/chat/:conversationId')?.params.conversationId;
  const { data: conversations } = useConversations();
  const chatTitle = chatId
    ? (conversations?.find((c) => c.id === chatId)?.title ??
      t('sidebar.untitledChat'))
    : null;

  return (
    <Box
      component="header"
      sx={{
        height: HEADER_HEIGHT,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: { xs: 2, sm: 3 },
        bgcolor: alpha(colors.surface, 0.8),
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        {onMenuClick && (
          <IconButton
            aria-label={t('header.openNavigation')}
            onClick={onMenuClick}
            size="small"
            sx={{
              display: { md: 'none' },
              ml: -1,
              color: colors.textSecondary,
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
        <Box
          component="nav"
          aria-label={t('header.breadcrumb')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: 12,
            lineHeight: '16px',
            minWidth: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Box
            component="span"
            sx={{ fontWeight: 500, color: colors.textSecondary }}
          >
            {APP_NAME} /
          </Box>
          <Box
            component="span"
            sx={{
              fontWeight: 600,
              color: colors.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {chatTitle ?? (title && t(`pageTitle.${title}`))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SystemStatus />
        <LanguageSwitcher />
      </Box>
    </Box>
  );
}
