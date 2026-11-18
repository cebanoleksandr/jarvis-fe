import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { useCurrentUser } from '../../queries';
import { colors } from '../../theme';
import { Header } from './Header';
import { Sidebar, SIDEBAR_WIDTH } from './Sidebar';

/**
 * App shell for signed-in pages: sidebar on the left, header and the page on
 * the right. Below `md` the sidebar moves into a drawer.
 *
 * Pages render into a full-height, non-scrolling area so a chat can pin its
 * input to the bottom; a page that just needs to scroll should use
 * `<Box sx={{ overflowY: 'auto', height: '100%' }}>`.
 */
export default function MainLayout() {
  const { data: user, isPending } = useCurrentUser();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isPending) return <FullScreenLoader />;
  // Also reached when any request gets a 401 mid-session.
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Box sx={{ display: 'flex', height: '100dvh', bgcolor: colors.background }}>
      {isDesktop ? (
        <Sidebar />
      ) : (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{ paper: { sx: { width: SIDEBAR_WIDTH, border: 0 } } }}
        >
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </Drawer>
      )}

      <Box
        sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Header
          onMenuClick={isDesktop ? undefined : () => setDrawerOpen(true)}
        />
        <Box
          component="main"
          sx={{ flex: 1, minHeight: 0, position: 'relative' }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export function FullScreenLoader() {
  return (
    <Box
      sx={{
        height: '100dvh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: colors.background,
      }}
    >
      <CircularProgress size={28} />
    </Box>
  );
}
