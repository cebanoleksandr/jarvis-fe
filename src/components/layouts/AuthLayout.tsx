import { useTranslation } from 'react-i18next';
import { Link as RouterLink, Navigate, Outlet } from 'react-router-dom';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

import verticalDivider from '../../assets/auth-vertical-divider.png';
import { APP_NAME, APP_VERSION } from '../../constants';
import { useCurrentUser } from '../../queries';
import { colors, fonts, palette } from '../../theme';
import { LanguageSwitcher } from '../business/LanguageSwitcher';
import { SystemStatus } from '../business/SystemStatus';
import { StatusDot } from '../ui/StatusDot';
import { FullScreenLoader } from './MainLayout';

const CYAN = palette.primary.base;
const hairline = alpha(colors.outline, 0.15);

const barSx = {
  position: 'relative',
  zIndex: 1,
  px: { xs: 2, sm: 6 },
  bgcolor: alpha(colors.background, 0.6),
} as const;

const innerSx = {
  maxWidth: 1280,
  mx: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 2,
} as const;

/** Sign-in shell: brand header, ambient HUD background, centered card slot, legal footer. */
export default function AuthLayout() {
  const { t } = useTranslation();
  const { data: user, isPending } = useCurrentUser();

  if (isPending) return <FullScreenLoader />;
  if (user) return <Navigate to="/chat" replace />;

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.background,
        overflow: 'hidden',
      }}
    >
      <AmbientBackground />

      <Box
        component="header"
        sx={{
          ...barSx,
          pt: 2,
          pb: '17px',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${alpha(colors.outline, 0.2)}`,
        }}
      >
        <Box sx={innerSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ mr: 0.5, display: 'flex' }}>
              <StatusDot color={colors.accentText} size={8} glow />
            </Box>
            <Box
              component="span"
              sx={{
                fontWeight: 500,
                fontSize: 18,
                lineHeight: '26px',
                letterSpacing: '-0.45px',
                color: colors.text,
              }}
            >
              {APP_NAME}
            </Box>
            <Box
              component="span"
              sx={{
                ml: 0.5,
                px: '7px',
                py: '3px',
                borderRadius: '4px',
                border: `1px solid ${colors.border}`,
                fontFamily: fonts.mono,
                fontWeight: 500,
                fontSize: 10,
                lineHeight: '12px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: alpha(colors.textSecondary, 0.6),
              }}
            >
              {`${APP_VERSION} // AUTH`}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SystemStatus />
            <LanguageSwitcher />
          </Box>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 4,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          <Outlet />
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          ...barSx,
          pt: '17px',
          pb: 2,
          backdropFilter: 'blur(4px)',
          borderTop: `1px solid ${alpha(colors.outline, 0.2)}`,
        }}
      >
        <Box sx={innerSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="span"
              sx={{
                fontWeight: 500,
                fontSize: 12,
                lineHeight: '16px',
                letterSpacing: '0.6px',
                color: colors.text,
              }}
            >
              {APP_NAME}
            </Box>
            <Box
              component="span"
              sx={{
                fontFamily: fonts.mono,
                fontSize: 10,
                color: colors.outline,
              }}
            >
              •
            </Box>
            <Box
              component="span"
              sx={{
                fontFamily: fonts.mono,
                fontWeight: 500,
                fontSize: 10,
                letterSpacing: '0.6px',
                color: colors.textSecondary,
              }}
            >
              © {new Date().getFullYear()} {APP_NAME}
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            {[
              { to: '/privacy', label: t('footer.privacy') },
              { to: '/terms', label: t('footer.terms') },
            ].map((link) => (
              <Box
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{
                  fontSize: 13,
                  lineHeight: '18px',
                  color: alpha(colors.textSecondary, 0.8),
                  textDecoration: 'none',
                  '&:hover': { color: colors.text },
                }}
              >
                {link.label}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/** HUD grid, cyan glows and hairlines behind the auth card. Purely decorative. */
function AmbientBackground() {
  const glow = (size: number, color: string, blur: number) => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: '50%',
    bgcolor: color,
    filter: `blur(${blur}px)`,
  });
  const hLine = {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${hairline}, transparent)`,
  };
  const vLine = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '1px',
    display: { xs: 'none', md: 'block' },
    backgroundImage: `url(${verticalDivider})`,
    backgroundSize: '100% 100%',
  };

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.7,
          backgroundImage:
            'linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <Box
        sx={{
          ...glow(720, alpha(CYAN, 0.1), 140),
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <Box
        sx={{
          ...glow(500, alpha(colors.accentText, 0.05), 120),
          right: 320,
          top: -160,
        }}
      />
      <Box
        sx={{ ...glow(450, alpha(CYAN, 0.05), 130), left: 320, bottom: -160 }}
      />
      <Box sx={{ ...hLine, top: 256 }} />
      <Box sx={{ ...hLine, bottom: 256 }} />
      <Box sx={{ ...vLine, left: 320 }} />
      <Box sx={{ ...vLine, right: 320 }} />
    </Box>
  );
}
