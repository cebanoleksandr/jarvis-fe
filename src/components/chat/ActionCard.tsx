import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import type { PendingAction } from '../../services';
import { colors, fonts, palette, radius } from '../../theme';
import { StatusDot } from '../ui/StatusDot';

const CYAN = palette.primary.base;

const mono = {
  fontFamily: fonts.mono,
  fontWeight: 500,
  fontSize: 10,
  lineHeight: '12px',
  letterSpacing: '0.6px',
} as const;

interface ActionCardProps {
  action: PendingAction;
  onConfirm: () => void;
  onCancel: () => void;
  /** True while any reply streams: one decision at a time. */
  busy: boolean;
}

/** What the card shows: the tool's own summary, or its raw arguments as a fallback. */
function describe(action: PendingAction) {
  if (action.summary) return action.summary;
  return {
    title: action.tool,
    details: Object.fromEntries(
      Object.entries(action.args).map(([k, v]) => [
        k,
        typeof v === 'string' ? v : JSON.stringify(v),
      ]),
    ),
  };
}

/**
 * Confirmation card for a mutating tool call. Nothing runs until the user
 * presses Confirm; afterwards the card collapses into a resolved line.
 */
export function ActionCard({
  action,
  onConfirm,
  onCancel,
  busy,
}: ActionCardProps) {
  const { t } = useTranslation();
  const { title, details } = describe(action);

  if (action.status !== 'pending' && action.status !== 'executing') {
    return <ResolvedAction action={action} title={title} details={details} />;
  }

  const executing = action.status === 'executing';

  return (
    <Box
      component="section"
      aria-label={title}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pl: { xs: 2, sm: '28px' },
        pr: { xs: 2, sm: '25px' },
        py: { xs: 2, sm: '25px' },
        borderRadius: `${radius.md}px`,
        bgcolor: alpha(colors.surfaceContainerLow, 0.8),
        backdropFilter: 'blur(24px)',
        border: `1px solid ${alpha(colors.outline, 0.4)}`,
        borderLeft: `4px solid ${colors.warning}`,
        boxShadow: '0 8px 32px -4px rgba(0,0,0,0.6)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: '5px',
          borderBottom: `1px solid ${alpha(colors.outline, 0.3)}`,
        }}
      >
        {executing ? (
          <CircularProgress
            size={10}
            thickness={6}
            sx={{ color: colors.warning }}
          />
        ) : (
          <StatusDot color={colors.warning} size={10} glow />
        )}
        <Box
          component="span"
          sx={{
            ...mono,
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: colors.warning,
          }}
        >
          {executing ? t('action.executing') : t('action.required')}
        </Box>
      </Box>

      <Box
        component="h3"
        sx={{
          m: 0,
          fontWeight: 700,
          fontSize: { xs: 18, sm: 22 },
          lineHeight: { xs: '26px', sm: '30px' },
          letterSpacing: '-0.55px',
          color: colors.text,
        }}
      >
        {title}
      </Box>

      {Object.keys(details).length > 0 && (
        <Box
          component="dl"
          sx={{
            m: 0,
            p: '17px',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
            borderRadius: `${radius.md}px`,
            bgcolor: alpha(colors.background, 0.8),
            border: `1px solid ${alpha(colors.outline, 0.3)}`,
          }}
        >
          {Object.entries(details).map(([label, value]) => (
            <Box key={label} sx={{ minWidth: 0 }}>
              <Box
                component="dt"
                sx={{
                  ...mono,
                  textTransform: 'uppercase',
                  color: alpha(colors.textSecondary, 0.6),
                }}
              >
                {label}
              </Box>
              <Box
                component="dd"
                sx={{
                  m: 0,
                  mt: 0.5,
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '18px',
                  color: colors.text,
                  overflowWrap: 'anywhere',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {value}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pt: '5px',
          borderTop: `1px solid ${alpha(colors.outline, 0.2)}`,
        }}
      >
        <ButtonBase
          onClick={onConfirm}
          disabled={busy || executing}
          sx={{
            gap: 1,
            px: 3,
            py: '10px',
            borderRadius: `${radius.md}px`,
            bgcolor: CYAN,
            color: colors.textOnAccent,
            fontWeight: 600,
            fontSize: 14,
            lineHeight: '18px',
            boxShadow: `0 0 16px -2px ${alpha(CYAN, 0.35)}`,
            transition: 'background-color 150ms, opacity 150ms',
            '&:hover': { bgcolor: colors.accentText },
            '&.Mui-disabled': { opacity: 0.5 },
            '&.Mui-focusVisible': {
              outline: `2px solid ${CYAN}`,
              outlineOffset: 2,
            },
          }}
        >
          <CheckIcon sx={{ fontSize: 16 }} />
          {t('action.confirm')}
        </ButtonBase>
        <ButtonBase
          onClick={onCancel}
          disabled={busy || executing}
          sx={{
            gap: 0.5,
            px: 2,
            py: 1,
            borderRadius: '8px',
            color: colors.textSecondary,
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '18px',
            '&:hover': {
              color: colors.text,
              bgcolor: alpha(colors.surfaceContainerHigh, 0.6),
            },
            '&.Mui-disabled': { opacity: 0.5 },
            '&.Mui-focusVisible': { outline: `2px solid ${alpha(CYAN, 0.5)}` },
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
          {t('action.cancel')}
        </ButtonBase>
      </Box>
    </Box>
  );
}

function ResolvedAction({
  action,
  title,
  details,
}: {
  action: PendingAction;
  title: string;
  details: Record<string, string>;
}) {
  const { t } = useTranslation();
  const { color, label } =
    action.status === 'executed'
      ? { color: colors.success, label: t('action.executed') }
      : action.status === 'failed'
        ? { color: colors.error, label: t('action.failed') }
        : action.status === 'dismissed'
          ? { color: colors.textMuted, label: t('action.dismissed') }
          : { color: colors.textMuted, label: t('action.cancelled') };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pl: '20px',
        pr: '17px',
        py: '17px',
        borderRadius: `${radius.md}px`,
        bgcolor: alpha(colors.surfaceContainerLow, 0.5),
        border: `1px solid ${alpha(colors.outline, 0.3)}`,
        borderLeft: `4px solid ${alpha(color, 0.7)}`,
        opacity:
          action.status === 'executed' || action.status === 'failed' ? 1 : 0.75,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StatusDot color={color} />
        <Box
          component="span"
          sx={{ ...mono, fontWeight: 600, textTransform: 'uppercase', color }}
        >
          {label}
        </Box>
      </Box>
      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}
      >
        <Box
          component="span"
          sx={{
            fontWeight: 600,
            fontSize: 14,
            lineHeight: '18px',
            color: colors.text,
          }}
        >
          {title}
        </Box>
        {Object.values(details)
          .slice(0, 3)
          .map((value) => (
            <Box
              key={value}
              component="span"
              sx={{
                ...mono,
                maxWidth: 260,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                px: '9px',
                py: '3px',
                borderRadius: '4px',
                bgcolor: colors.surfaceContainerHigh,
                border: `1px solid ${alpha(colors.outline, 0.3)}`,
                color: colors.text,
              }}
            >
              {value}
            </Box>
          ))}
      </Box>
      {action.status === 'failed' && action.error && (
        <Box
          component="p"
          sx={{ m: 0, fontSize: 13, lineHeight: '18px', color: colors.error }}
        >
          {action.error}
        </Box>
      )}
    </Box>
  );
}
