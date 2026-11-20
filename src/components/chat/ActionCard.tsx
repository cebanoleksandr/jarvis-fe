import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import ShortTextIcon from '@mui/icons-material/ShortText';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

import { useCurrentUser, useUndoAction } from '../../queries';
import { ApiError } from '../../services';
import type { PendingAction } from '../../services';
import { colors, fonts, palette, radius } from '../../theme';
import { StatusDot } from '../ui/StatusDot';
import { ActionEditPopup } from './ActionEditPopup';
import { ActionTimeline } from './ActionTimeline';
import {
  eventArgs,
  formatDay,
  formatEventWhen,
  formatReminder,
  isAllDay,
  taskArgs,
} from './actionArgs';
import { formatTime } from './format';

const CYAN = palette.primary.base;

const mono = {
  fontFamily: fonts.mono,
  fontWeight: 500,
  fontSize: 10,
  lineHeight: '12px',
  letterSpacing: '0.6px',
} as const;

interface Field {
  key: string;
  label: string;
  value: string;
  icon?: ReactNode;
  /** Spans both columns (long text). */
  wide?: boolean;
}

const icon = (Icon: typeof ShortTextIcon) => (
  <Icon sx={{ fontSize: 14, color: colors.accentText }} />
);

/**
 * Title and fields of the card. Known tools are shown from their arguments,
 * localized and formatted; anything else falls back to the backend summary.
 */
function describe(
  action: PendingAction,
  t: TFunction,
  language: string,
): { title: string; fields: Field[] } {
  const event = eventArgs(action);
  if (event) {
    return {
      title: t('toolTitle.create_event'),
      fields: [
        {
          key: 'title',
          label: t('field.title'),
          value: event.title,
          icon: icon(ShortTextIcon),
        },
        {
          key: 'when',
          label: t('field.when'),
          value: formatEventWhen(event, language),
          icon: icon(EventOutlinedIcon),
        },
        ...(event.location
          ? [
              {
                key: 'location',
                label: t('field.location'),
                value: event.location,
                icon: icon(PlaceOutlinedIcon),
              },
            ]
          : []),
        ...(event.reminderMinutes !== undefined
          ? [
              {
                key: 'reminder',
                label: t('field.reminder'),
                value: formatReminder(event.reminderMinutes, t),
                icon: icon(NotificationsNoneOutlinedIcon),
              },
            ]
          : []),
        ...(event.description
          ? [
              {
                key: 'description',
                label: t('field.description'),
                value: event.description,
                icon: icon(NotesOutlinedIcon),
                wide: true,
              },
            ]
          : []),
      ],
    };
  }

  const task = taskArgs(action);
  if (task) {
    return {
      title: t('toolTitle.create_task'),
      fields: [
        {
          key: 'title',
          label: t('field.title'),
          value: task.title,
          icon: icon(ShortTextIcon),
        },
        ...(task.due
          ? [
              {
                key: 'due',
                label: t('field.due'),
                value: formatDay(task.due, language),
                icon: icon(EventOutlinedIcon),
              },
            ]
          : []),
        ...(task.notes
          ? [
              {
                key: 'notes',
                label: t('field.notes'),
                value: task.notes,
                icon: icon(NotesOutlinedIcon),
                wide: true,
              },
            ]
          : []),
      ],
    };
  }

  const details =
    action.summary?.details ??
    Object.fromEntries(
      Object.entries(action.args).map(([k, v]) => [
        k,
        typeof v === 'string' ? v : JSON.stringify(v),
      ]),
    );
  return {
    title: action.summary?.title ?? action.tool,
    fields: Object.entries(details).map(([label, value]) => ({
      key: label,
      label,
      value,
    })),
  };
}

interface ActionCardProps {
  action: PendingAction;
  /** Pass `args` only when the user edited them. */
  onConfirm: (args?: Record<string, unknown>) => void;
  onCancel: () => void;
  /** True while any reply streams: one decision at a time. */
  busy: boolean;
}

/**
 * Confirmation card for a mutating tool call. Nothing runs until the user
 * presses Confirm (or saves an edit); afterwards it collapses into a resolved line.
 */
export function ActionCard({
  action,
  onConfirm,
  onCancel,
  busy,
}: ActionCardProps) {
  const { t, i18n } = useTranslation();
  const [editing, setEditing] = useState(false);
  const { title, fields } = describe(action, t, i18n.language);

  if (action.status !== 'pending' && action.status !== 'executing') {
    return <ResolvedAction action={action} title={title} fields={fields} />;
  }

  const executing = action.status === 'executing';
  const event = eventArgs(action);
  const task = taskArgs(action);
  const editable = Boolean(event || task);

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
          justifyContent: 'space-between',
          gap: 1,
          pb: '5px',
          borderBottom: `1px solid ${alpha(colors.outline, 0.3)}`,
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}
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
        {!executing && (
          <Box
            sx={{
              ...mono,
              flexShrink: 0,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: '6px',
              color: alpha(colors.textSecondary, 0.7),
            }}
          >
            <ScheduleOutlinedIcon sx={{ fontSize: 12 }} />
            {t('action.provisional')}
          </Box>
        )}
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

      {fields.length > 0 && (
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
          {fields.map((f) => (
            <Box
              key={f.key}
              sx={{ minWidth: 0, gridColumn: f.wide ? '1 / -1' : undefined }}
            >
              <Box
                component="dt"
                sx={{
                  ...mono,
                  textTransform: 'uppercase',
                  color: alpha(colors.textSecondary, 0.6),
                }}
              >
                {f.label}
              </Box>
              <Box
                component="dd"
                sx={{
                  m: 0,
                  mt: 0.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 0.5,
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '18px',
                  color: colors.text,
                  overflowWrap: 'anywhere',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {f.icon && (
                  <Box sx={{ display: 'flex', pt: '2px' }}>{f.icon}</Box>
                )}
                {f.value}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {event && !isAllDay(event) && <ActionTimeline args={event} />}

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ButtonBase
            onClick={() => onConfirm()}
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
          {editable && (
            <ButtonBase
              onClick={() => setEditing(true)}
              disabled={busy || executing}
              sx={{
                gap: '6px',
                px: '17px',
                py: '11px',
                borderRadius: `${radius.md}px`,
                bgcolor: colors.surfaceContainer,
                border: `1px solid ${alpha(colors.outline, 0.6)}`,
                color: colors.text,
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '18px',
                '&:hover': { bgcolor: colors.surfaceContainerHigh },
                '&.Mui-disabled': { opacity: 0.5 },
                '&.Mui-focusVisible': {
                  outline: `2px solid ${alpha(CYAN, 0.5)}`,
                },
              }}
            >
              <TuneOutlinedIcon sx={{ fontSize: 14 }} />
              {t('action.edit')}
            </ButtonBase>
          )}
        </Box>
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

      {editable && (
        <ActionEditPopup
          isVisible={editing}
          onClose={() => setEditing(false)}
          event={event}
          task={task}
          onSubmit={(args) => {
            setEditing(false);
            onConfirm(args);
          }}
        />
      )}
    </Box>
  );
}

function ResolvedAction({
  action,
  title,
  fields,
}: {
  action: PendingAction;
  title: string;
  fields: Field[];
}) {
  const { t, i18n } = useTranslation();
  const { data: user } = useCurrentUser();
  const undo = useUndoAction(action.conversationId);
  const { color, label } =
    action.status === 'executed'
      ? { color: colors.success, label: t('action.executed') }
      : action.status === 'failed'
        ? { color: colors.error, label: t('action.failed') }
        : action.status === 'dismissed'
          ? { color: colors.textMuted, label: t('action.dismissed') }
          : action.status === 'undone'
            ? { color: colors.textMuted, label: t('action.undone') }
            : { color: colors.textMuted, label: t('action.cancelled') };
  // The backend can revert what these tools created.
  const undoable =
    action.status === 'executed' &&
    (action.tool === 'create_event' || action.tool === 'create_task');
  const undoError =
    undo.error instanceof ApiError && undo.error.isGoogleReauthRequired
      ? t('action.reauth')
      : undo.error
        ? t('action.undoFailed', { message: undo.error.message })
        : null;

  // create_event / create_task return a link to the new item.
  const link =
    action.status === 'executed' &&
    action.result &&
    typeof (action.result as { link?: unknown }).link === 'string'
      ? (action.result as { link: string }).link
      : null;

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
        {action.resolvedAt && (
          <Box
            component="span"
            sx={{ ...mono, color: alpha(colors.textSecondary, 0.6) }}
          >
            {t('action.resolvedAt', {
              time: formatTime(
                action.resolvedAt,
                i18n.language,
                user?.timezone,
              ),
            })}
          </Box>
        )}
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
        {fields
          .filter((f) => !f.wide)
          .slice(0, 3)
          .map((f) => (
            <Box
              key={f.key}
              component="span"
              sx={{
                ...mono,
                maxWidth: 280,
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
              {f.value}
            </Box>
          ))}
      </Box>
      {(link || undoable) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {link && (
            <Box
              component="a"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                ...mono,
                fontSize: 11,
                lineHeight: '14px',
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: colors.accentText,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {action.tool === 'create_task'
                ? t('action.openInTasks')
                : t('action.viewInCalendar')}
              <OpenInNewIcon sx={{ fontSize: 11 }} />
            </Box>
          )}
          {undoable && (
            <ButtonBase
              onClick={() => undo.mutate(action.id)}
              disabled={undo.isPending}
              sx={{
                ...mono,
                fontSize: 11,
                lineHeight: '14px',
                gap: 0.5,
                color: alpha(colors.textSecondary, 0.7),
                '&:hover': { color: colors.text },
                '&.Mui-disabled': { opacity: 0.5 },
                '&.Mui-focusVisible': {
                  outline: `2px solid ${alpha(CYAN, 0.5)}`,
                },
              }}
            >
              {undo.isPending ? (
                <CircularProgress size={10} thickness={6} color="inherit" />
              ) : (
                <UndoIcon sx={{ fontSize: 12 }} />
              )}
              {t('action.undo')}
            </ButtonBase>
          )}
        </Box>
      )}
      {undoError && (
        <Box
          component="p"
          role="alert"
          sx={{ m: 0, fontSize: 13, lineHeight: '18px', color: colors.error }}
        >
          {undoError}
        </Box>
      )}
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
