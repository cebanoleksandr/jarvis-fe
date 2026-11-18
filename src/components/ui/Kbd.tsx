import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

import { colors, fonts } from '../../theme';

/** Keyboard shortcut hint, e.g. <Kbd>⌘K</Kbd>. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <Box
      component="kbd"
      sx={{
        px: '7px',
        py: '3px',
        borderRadius: '4px',
        border: `1px solid ${colors.border}`,
        bgcolor: 'rgba(10,14,20,0.8)',
        fontFamily: fonts.mono,
        fontWeight: 500,
        fontSize: 10,
        lineHeight: '12px',
        letterSpacing: '0.6px',
        color: colors.textSecondary,
      }}
    >
      {children}
    </Box>
  );
}
