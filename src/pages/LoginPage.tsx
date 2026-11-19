import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, keyframes } from '@mui/material/styles';

import arrowForwardIcon from '../assets/login/arrow-forward.svg';
import calendarIcon from '../assets/login/calendar.svg';
import googleGIcon from '../assets/login/google-g.svg';
import lockIcon from '../assets/login/lock.svg';
import shieldIcon from '../assets/login/shield.svg';
import taskCheckIcon from '../assets/login/task-check.svg';
import { StatusDot } from '../components/ui/StatusDot';
import { APP_VERSION } from '../constants';
import { authService } from '../services';
import { colors, fonts, palette, radius } from '../theme';

const CYAN = palette.primary.base;
/** Google button fill from the Figma card; not part of the token scales. */
const GOOGLE_BUTTON_BG = '#353940';

/** Message for `?error=` set by the backend when the Google callback fails. */
const errorKey = (error: string) =>
  error === 'access_denied'
    ? 'login.errors.access_denied'
    : 'login.errors.default';

/** Must match GOOGLE_SCOPES on the backend (calendar.events, tasks). */
const PERMISSIONS = [
  {
    icon: calendarIcon,
    label: 'Google Calendar',
    detailKey: 'login.calendarDetail',
  },
  {
    icon: taskCheckIcon,
    label: 'Google Tasks',
    detailKey: 'login.tasksDetail',
  },
] as const;

const monoLabel = {
  fontFamily: fonts.mono,
  fontWeight: 500,
  fontSize: 10,
  lineHeight: '12px',
} as const;

const spin = keyframes`to { transform: rotate(-360deg); }`;
const pulse = keyframes`
  0%, 100% { filter: drop-shadow(0 0 10px ${alpha(CYAN, 0.6)}); }
  50% { filter: drop-shadow(0 0 16px ${alpha(CYAN, 0.9)}); }
`;

/** Glass sign-in card: orb, Google button, the access being requested, error from the callback. */
export default function LoginPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const error = params.get('error');
  const [redirecting, setRedirecting] = useState(false);

  const signIn = () => {
    setRedirecting(true);
    authService.loginWithGoogle();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        component="section"
        aria-labelledby="login-title"
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          p: { xs: '21px', sm: '33px' },
          borderRadius: `${radius.md}px`,
          border: `1px solid ${colors.borderGlass}`,
          bgcolor: alpha(colors.surface, 0.65),
          backdropFilter: 'blur(24px)',
          boxShadow: `0 8px 40px -6px rgba(0,0,0,0.7), 0 0 24px -4px ${alpha(CYAN, 0.12)}`,
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: 0,
            left: 24,
            right: 24,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${alpha(CYAN, 0.5)}, transparent)`,
          }}
        />

        <Orb />

        <Box sx={{ textAlign: 'center' }}>
          <Box
            component="h1"
            id="login-title"
            sx={{
              m: 0,
              fontWeight: 600,
              fontSize: 28,
              lineHeight: '36px',
              letterSpacing: '-0.7px',
              color: colors.textStrong,
            }}
          >
            {t('login.title')}
          </Box>
          <Box
            component="p"
            sx={{
              m: 0,
              mt: '3px',
              mx: 'auto',
              maxWidth: 384,
              fontSize: 14,
              lineHeight: '22.75px',
              color: colors.textMuted,
            }}
          >
            {t('login.subtitle')}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2.5 }}>
          {error && (
            <Alert
              severity="error"
              variant="outlined"
              onClose={() => setParams({}, { replace: true })}
              sx={{ borderRadius: `${radius.md}px`, fontSize: 13 }}
            >
              {t(errorKey(error))}
            </Alert>
          )}

          <GoogleButton loading={redirecting} onClick={signIn} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              p: '17px',
              borderRadius: `${radius.md}px`,
              border: `1px solid ${alpha('#FFFFFF', 0.06)}`,
              bgcolor: alpha(colors.surfaceContainerLow, 0.7),
              backdropFilter: 'blur(12px)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                pb: '5px',
                borderBottom: `1px solid ${alpha(colors.outline, 0.2)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StatusDot color={colors.success} />
                <Box
                  component="span"
                  sx={{
                    ...monoLabel,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    color: colors.textSecondary,
                  }}
                >
                  {t('login.scopesHeader')}
                </Box>
              </Box>
              <Box
                component="span"
                sx={{
                  ...monoLabel,
                  flexShrink: 0,
                  px: '7px',
                  py: '3px',
                  borderRadius: '4px',
                  border: `1px solid ${alpha(CYAN, 0.2)}`,
                  bgcolor: alpha(CYAN, 0.1),
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: alpha(colors.accentText, 0.8),
                }}
              >
                Google
              </Box>
            </Box>

            <Box
              component="ul"
              aria-label={t('login.accessRequested')}
              sx={{
                m: 0,
                p: 0,
                pt: 0.5,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              {PERMISSIONS.map((p) => (
                <Box
                  component="li"
                  key={p.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    columnGap: 1,
                    rowGap: 0.25,
                    py: 0.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 15,
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <img src={p.icon} alt="" />
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        fontWeight: 500,
                        fontSize: 13,
                        lineHeight: '18px',
                        color: colors.text,
                      }}
                    >
                      {p.label}
                    </Box>
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      ...monoLabel,
                      letterSpacing: '0.6px',
                      color: colors.textSecondary,
                    }}
                  >
                    {t(p.detailKey)}
                  </Box>
                </Box>
              ))}
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0.5,
                pt: '5px',
                borderTop: `1px solid ${alpha(colors.outline, 0.15)}`,
              }}
            >
              <Box sx={{ display: 'flex', flexShrink: 0 }}>
                <img src={lockIcon} alt="" />
              </Box>
              <Box
                component="p"
                sx={{
                  m: 0,
                  fontSize: 13,
                  lineHeight: '16.25px',
                  color: alpha(colors.textSecondary, 0.9),
                  '& strong': { fontWeight: 500, color: colors.text },
                }}
              >
                <Trans i18nKey="login.noChanges" />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            pt: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <img src={shieldIcon} alt="" />
            <Box
              component="span"
              sx={{
                ...monoLabel,
                letterSpacing: '0.6px',
                color: alpha(colors.textSecondary, 0.6),
                textTransform: 'uppercase',
              }}
            >
              {t('login.tokensEncrypted')}
            </Box>
          </Box>
          <Box
            component="span"
            sx={{
              ...monoLabel,
              letterSpacing: '0.6px',
              color: alpha(colors.textSecondary, 0.6),
            }}
          >
            {t('login.build', { version: APP_VERSION }).toUpperCase()}
          </Box>
        </Box>
      </Box>

      <Box
        component="p"
        sx={{
          m: 0,
          textAlign: 'center',
          fontSize: 13,
          lineHeight: '18px',
          color: alpha(colors.textSecondary, 0.7),
        }}
      >
        {t('login.privacyQuestion')}{' '}
        <Box
          component={RouterLink}
          to="/privacy"
          sx={{
            fontWeight: 500,
            color: colors.accentText,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {t('login.privacyLink')}
        </Box>
      </Box>
    </Box>
  );
}

function GoogleButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ButtonBase
      onClick={onClick}
      disabled={loading}
      sx={{
        width: '100%',
        height: 48,
        display: 'flex',
        alignItems: 'center',
        // Tighter on narrow phones so the label stays on one line.
        gap: { xs: 1.5, sm: 2 },
        px: { xs: '13px', sm: '17px' },
        whiteSpace: 'nowrap',
        borderRadius: `${radius.md}px`,
        border: `1px solid ${alpha('#FFFFFF', 0.1)}`,
        bgcolor: alpha(GOOGLE_BUTTON_BG, 0.7),
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.3)',
        fontFamily: fonts.sans,
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '18px',
        color: colors.textStrong,
        transition: 'background-color 150ms, border-color 150ms',
        '&:hover': {
          bgcolor: alpha(GOOGLE_BUTTON_BG, 0.95),
          borderColor: alpha(CYAN, 0.35),
        },
        '&.Mui-focusVisible': {
          outline: `2px solid ${CYAN}`,
          outlineOffset: 2,
        },
        '&.Mui-disabled': { color: colors.textStrong, opacity: 0.8 },
        '&:hover .arrow': { transform: 'translateX(2px)' },
      }}
    >
      <Box
        sx={{
          width: 20,
          height: 20,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          bgcolor: '#FFFFFF',
          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.05))',
        }}
      >
        <img src={googleGIcon} alt="" />
      </Box>
      <span>{loading ? t('login.redirecting') : t('login.continue')}</span>
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
        {loading ? (
          <CircularProgress size={12} thickness={5} sx={{ color: CYAN }} />
        ) : (
          <Box
            className="arrow"
            sx={{ display: 'flex', transition: 'transform 150ms' }}
          >
            <img src={arrowForwardIcon} alt="" />
          </Box>
        )}
      </Box>
    </ButtonBase>
  );
}

/** Decorative assistant orb: aura, rotating dashed ring, orbit ring, glowing core. */
function Orb() {
  const { t } = useTranslation();
  const ring = { position: 'absolute', borderRadius: '50%' } as const;

  return (
    <Box
      aria-hidden
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 0.5,
        pb: 2,
        '@media (prefers-reduced-motion: reduce)': {
          '& *': { animation: 'none !important' },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 96,
          height: 96,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            ...ring,
            inset: 0,
            bgcolor: alpha(CYAN, 0.2),
            filter: 'blur(24px)',
          }}
        />
        <Box
          sx={{
            ...ring,
            inset: 0,
            border: `1px dashed ${alpha(CYAN, 0.3)}`,
            animation: `${spin} 40s linear infinite`,
          }}
        />
        <Box
          sx={{
            ...ring,
            inset: 8,
            border: `1px solid ${alpha(colors.accentText, 0.25)}`,
          }}
        >
          <Box
            sx={{
              ...ring,
              top: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 6,
              height: 6,
              bgcolor: colors.accentText,
              boxShadow: `0 0 6px ${colors.accentText}`,
            }}
          />
          <Box
            sx={{
              ...ring,
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 4,
              height: 4,
              bgcolor: alpha(colors.accentText, 0.6),
            }}
          />
        </Box>
        <Box
          sx={{
            ...ring,
            inset: 16,
            border: `1px solid ${alpha(colors.outline, 0.4)}`,
            bgcolor: alpha(colors.background, 0.4),
            backdropFilter: 'blur(4px)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `linear-gradient(45deg, ${CYAN} 0%, #2FD9F4 50%, ${colors.accentText} 100%)`,
            filter: `drop-shadow(0 0 10px ${alpha(CYAN, 0.6)})`,
            animation: `${pulse} 3.2s ease-in-out infinite`,
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: colors.background,
            }}
          />
        </Box>
      </Box>
      <Box
        component="span"
        sx={{
          ...monoLabel,
          mt: 1,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: alpha(colors.accentText, 0.8),
        }}
      >
        {t('login.orb', { version: APP_VERSION })}
      </Box>
    </Box>
  );
}
