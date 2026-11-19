import { useEffect, useState, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useMatch, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import { APP_NAME, APP_VERSION } from '../../constants';
import {
  useConversations,
  useCreateConversation,
  useCurrentUser,
  useGoals,
  useLogout,
  useMemories,
} from '../../queries';
import { colors, fonts, palette } from '../../theme';
import { Kbd } from '../ui/Kbd';
import { StatusDot } from '../ui/StatusDot';

export const SIDEBAR_WIDTH = 260;

const CYAN = palette.primary.base;
const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.platform);

const monoLabel = {
  fontFamily: fonts.mono,
  fontWeight: 500,
  fontSize: 10,
  lineHeight: '12px',
  letterSpacing: '0.6px',
  whiteSpace: 'nowrap',
} as const;

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<SvgIconProps>;
  badge?: string;
}

interface SidebarProps {
  /** Called after any navigation, e.g. to close the mobile drawer. */
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createConversation = useCreateConversation();
  const { data: goals } = useGoals();
  const { data: memories } = useMemories();

  const activeGoals = goals?.filter(
    (g) => !g.parentId && g.status === 'active',
  ).length;

  const nav: NavItem[] = [
    { to: '/chat', label: t('nav.chat'), Icon: ChatBubbleOutlineOutlinedIcon },
    { to: '/today', label: t('nav.today'), Icon: CalendarTodayOutlinedIcon },
    {
      to: '/goals',
      label: t('nav.goals'),
      Icon: FlagOutlinedIcon,
      badge:
        activeGoals !== undefined
          ? t('sidebar.goalsActive', { count: activeGoals })
          : undefined,
    },
    {
      to: '/memory',
      label: t('nav.memory'),
      Icon: PsychologyOutlinedIcon,
      badge: memories
        ? t('sidebar.notes', { count: memories.length })
        : undefined,
    },
  ];

  const newChat = async () => {
    if (createConversation.isPending) return;
    const conversation = await createConversation.mutateAsync();
    navigate(`/chat/${conversation.id}`);
    onNavigate?.();
  };

  // ⌘K / Ctrl+K starts a new chat from anywhere in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        void newChat();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <Box
      component="aside"
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.surface,
        borderRight: `1px solid ${colors.border}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 2,
          minHeight: 0,
          flex: 1,
        }}
      >
        {/* Brand */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 0.5,
            px: 0.5,
          }}
        >
          <Box
            component="span"
            sx={{
              fontWeight: 600,
              fontSize: 18,
              lineHeight: '26px',
              letterSpacing: '-0.45px',
              color: colors.text,
            }}
          >
            {APP_NAME}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              px: '9px',
              py: '3px',
              borderRadius: 9999,
              bgcolor: alpha(CYAN, 0.1),
              border: `1px solid ${alpha(CYAN, 0.2)}`,
            }}
          >
            <StatusDot color={CYAN} glow />
            <Box
              component="span"
              sx={{ ...monoLabel, color: colors.accentText }}
            >
              {`${APP_VERSION} // ACTIVE`}
            </Box>
          </Box>
        </Box>

        {/* New chat */}
        <ButtonBase
          onClick={() => void newChat()}
          disabled={createConversation.isPending}
          sx={{
            width: '100%',
            justifyContent: 'space-between',
            px: '17px',
            py: '11px',
            borderRadius: '12px',
            bgcolor: colors.surfaceContainer,
            border: `1px solid ${alpha(colors.outline, 0.4)}`,
            transition: 'border-color 150ms, background-color 150ms',
            '&:hover': {
              borderColor: alpha(CYAN, 0.3),
              bgcolor: colors.surfaceContainerHigh,
            },
            '&.Mui-focusVisible': { outline: `2px solid ${alpha(CYAN, 0.5)}` },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon sx={{ fontSize: 14, color: colors.text }} />
            <Box
              component="span"
              sx={{
                fontWeight: 500,
                fontSize: 12,
                lineHeight: '16px',
                color: colors.text,
              }}
            >
              {t('sidebar.newChat')}
            </Box>
          </Box>
          <Kbd>{isMac ? '⌘K' : 'Ctrl K'}</Kbd>
        </ButtonBase>

        {/* Primary navigation */}
        <Box
          component="nav"
          sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 0.5 }}
        >
          {nav.map((item) => (
            <NavRow key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </Box>

        <Recents onNavigate={onNavigate} />
      </Box>

      <ProfileCard />
    </Box>
  );
}

function NavRow({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const { to, label, Icon, badge } = item;
  return (
    <Box
      component={NavLink}
      to={to}
      onClick={onNavigate}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        p: 1,
        borderRadius: '8px',
        border: '1px solid transparent',
        textDecoration: 'none',
        color: colors.textSecondary,
        transition: 'background-color 150ms, color 150ms',
        '& .nav-label': { fontWeight: 500 },
        '& .nav-badge': {
          bgcolor: colors.surfaceContainerHigh,
          color: colors.textSecondary,
        },
        '& .nav-dot': { display: 'none' },
        '&:hover': {
          bgcolor: alpha(colors.surfaceContainer, 0.7),
          color: colors.text,
        },
        '&.active': {
          bgcolor: alpha(CYAN, 0.1),
          borderColor: alpha(CYAN, 0.25),
          boxShadow: `0 0 10px ${alpha(CYAN, 0.35)}`,
          color: colors.accentText,
          '& .nav-label': { fontWeight: 600 },
          '& .nav-badge': {
            bgcolor: alpha(CYAN, 0.2),
            color: colors.accentText,
          },
          '& .nav-dot': { display: 'inline-block' },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon sx={{ fontSize: 16 }} />
        <Box
          component="span"
          className="nav-label"
          sx={{ fontSize: 12, lineHeight: '16px' }}
        >
          {label}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Box className="nav-dot" component="span">
          <StatusDot color={CYAN} glow />
        </Box>
        {badge && (
          <Box
            component="span"
            className="nav-badge"
            sx={{ ...monoLabel, px: '6px', py: '2px', borderRadius: '4px' }}
          >
            {badge}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function Recents({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const { data: conversations } = useConversations();
  const activeId = useMatch('/chat/:conversationId')?.params.conversationId;

  if (!conversations?.length) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pt: 1,
        minHeight: 0,
      }}
    >
      <Box
        component="span"
        sx={{
          ...monoLabel,
          px: 0.5,
          fontWeight: 600,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: colors.textSecondary,
        }}
      >
        {t('sidebar.recents')}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          overflowY: 'auto',
          minHeight: 0,
          pr: 0.5,
        }}
      >
        {conversations.map((c) => {
          const active = c.id === activeId;
          return (
            <Box
              key={c.id}
              component={NavLink}
              to={`/chat/${c.id}`}
              onClick={onNavigate}
              title={c.title ?? undefined}
              sx={{
                flexShrink: 0,
                px: 1,
                py: '6px',
                borderRadius: '8px',
                borderLeft: '2px solid transparent',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: 12,
                lineHeight: '16px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: alpha(colors.textSecondary, 0.8),
                '&:hover': {
                  bgcolor: alpha(colors.surfaceContainerLow, 0.6),
                  color: colors.text,
                },
                ...(active && {
                  pl: '10px',
                  borderLeftColor: colors.accentText,
                  bgcolor: alpha(colors.surfaceContainerLow, 0.6),
                  color: colors.text,
                }),
              }}
            >
              {c.title ?? t('sidebar.untitledChat')}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

function ProfileCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  if (!user) return null;

  return (
    <Box
      sx={{ borderTop: `1px solid ${colors.border}`, px: 2, pt: '17px', pb: 2 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          p: '9px',
          borderRadius: '12px',
          bgcolor: colors.surfaceContainerLow,
          border: `1px solid ${alpha(colors.outline, 0.2)}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '8px',
              bgcolor: colors.surfaceContainerHigh,
              border: `1px solid ${alpha(CYAN, 0.3)}`,
              fontFamily: fonts.mono,
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: '0.44px',
              color: colors.accentText,
            }}
          >
            {initials(user.name, user.email)}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                fontWeight: 500,
                fontSize: 12,
                lineHeight: '15px',
                color: colors.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name ?? user.email}
            </Box>
            <Box
              sx={{
                ...monoLabel,
                color: colors.textSecondary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.email}
            </Box>
          </Box>
        </Box>
        <IconButton
          size="small"
          aria-label={t('sidebar.accountMenu')}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{
            color: colors.textSecondary,
            '&:hover': { color: colors.text },
          }}
        >
          <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            setAnchor(null);
            navigate('/memory');
          }}
        >
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          {t('sidebar.settings')}
        </MenuItem>
        <MenuItem
          disabled={logout.isPending}
          onClick={() =>
            logout.mutate(undefined, { onSettled: () => navigate('/login') })
          }
        >
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          {t('sidebar.logout')}
        </MenuItem>
      </Menu>
    </Box>
  );
}
