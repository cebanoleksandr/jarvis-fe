import { useMatches } from 'react-router-dom';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';

import { APP_NAME } from '../../constants';
import { colors } from '../../theme';
import { SystemStatus } from '../business/SystemStatus';

export const HEADER_HEIGHT = 56;

/** Set on a route as `handle: { title: 'Today' }` to fill the breadcrumb. */
export interface RouteHandle {
  title?: string;
}

interface HeaderProps {
  /** Shown below `md`, where the sidebar lives in a drawer. */
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const title = useMatches()
    .map((m) => (m.handle as RouteHandle | undefined)?.title)
    .filter(Boolean)
    .at(-1);

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
            aria-label="Open navigation"
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
          aria-label="Breadcrumb"
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
            {title}
          </Box>
        </Box>
      </Box>

      <SystemStatus />
    </Box>
  );
}
