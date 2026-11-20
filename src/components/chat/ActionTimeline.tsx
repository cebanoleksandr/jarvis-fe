import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { useCalendarEvents } from '../../queries';
import type { CalendarEvent } from '../../services';
import { colors, fonts, palette, radius } from '../../theme';
import {
  type EventArgs,
  formatClock,
  formatDay,
  fromMinutes,
  toMinutes,
} from './actionArgs';

const CYAN = palette.primary.base;
const DAY = 24 * 60;
const MIN_SPAN = 6 * 60;

const mono = {
  fontFamily: fonts.mono,
  fontWeight: 500,
  fontSize: 10,
  lineHeight: '12px',
  letterSpacing: '0.6px',
} as const;

interface Slot {
  id: string;
  title: string;
  /** Minutes since midnight of the proposal's day, clipped to the day. */
  from: number;
  to: number;
}

/**
 * Event times come back from the API already in the user's timezone
 * (`2026-11-27T12:30:00+02:00`), so the wall-clock part can be read directly.
 */
function toSlot(e: CalendarEvent, day: string): Slot | null {
  if (e.allDay) return null;
  const [sd, st] = e.start.split('T');
  const [ed, et] = e.end.split('T');
  const from = sd < day ? 0 : sd > day ? DAY : toMinutes(st.slice(0, 5));
  const to = ed > day ? DAY : ed < day ? 0 : toMinutes(et.slice(0, 5));
  return to > from ? { id: e.id, title: e.title, from, to } : null;
}

/** The window shown: the proposal plus two hours around it, at least six hours. */
function viewWindow(from: number, to: number) {
  let start = Math.max(0, Math.floor(from / 60) * 60 - 120);
  let end = Math.min(DAY, Math.ceil(to / 60) * 60 + 120);
  while (end - start < MIN_SPAN) {
    if (start > 0) start -= 60;
    if (end - start < MIN_SPAN && end < DAY) end += 60;
    if (start === 0 && end === DAY) break;
  }
  return { start, end };
}

/** Short hour label: `2 PM` where the language uses a 12-hour clock, else `14:00`. */
function formatTick(min: number, language: string) {
  const h = Math.floor(min / 60) % 24;
  const hour12 = new Intl.DateTimeFormat(language, {
    hour: 'numeric',
  }).resolvedOptions().hour12;
  if (!hour12) return `${String(h).padStart(2, '0')}:00`;
  return new Intl.DateTimeFormat(language, {
    hour: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2000, 0, 1, h)));
}

/** "Day density" strip for a proposed timed event: existing events, the proposal, conflicts. */
export function ActionTimeline({ args }: { args: EventArgs }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [day, startTime] = args.start.split('T');
  const [endDay, endTime] = args.end.split('T');
  const proposal = {
    from: toMinutes(startTime),
    to: endDay === day ? toMinutes(endTime) : DAY,
  };

  const events = useCalendarEvents({ from: day, to: day });
  const slots = (events.data?.events ?? [])
    .map((e) => toSlot(e, day))
    .filter((s): s is Slot => s !== null);
  const allDayCount = (events.data?.events ?? []).filter(
    (e) => e.allDay,
  ).length;
  const conflicts = slots.filter(
    (s) => s.from < proposal.to && s.to > proposal.from,
  );

  const win = viewWindow(proposal.from, proposal.to);
  const span = win.end - win.start;
  const pct = (min: number) =>
    `${((Math.min(Math.max(min, win.start), win.end) - win.start) / span) * 100}%`;
  const step = span > 8 * 60 ? 120 : 60;
  const ticks: number[] = [];
  for (let m = win.start; m <= win.end; m += step) ticks.push(m);

  const hasConflict = conflicts.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 0.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box
          component="span"
          sx={{
            ...mono,
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: colors.textSecondary,
          }}
        >
          {t('timeline.title', {
            day: formatDay(day, lang, 'short'),
            from: formatClock(fromMinutes(win.start % DAY), lang),
            to: formatClock(fromMinutes(win.end === DAY ? 0 : win.end), lang),
          })}
        </Box>
        {events.isSuccess && (
          <Box
            role="status"
            sx={{
              ...mono,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              px: '9px',
              py: '3px',
              borderRadius: '4px',
              color: hasConflict ? colors.warning : colors.success,
              bgcolor: alpha(
                hasConflict ? colors.warning : colors.success,
                0.1,
              ),
              border: `1px solid ${alpha(hasConflict ? colors.warning : colors.success, 0.2)}`,
            }}
          >
            {hasConflict ? (
              <WarningAmberIcon sx={{ fontSize: 11 }} />
            ) : (
              <CheckCircleIcon sx={{ fontSize: 11 }} />
            )}
            {hasConflict
              ? t('timeline.conflict', { count: conflicts.length })
              : t('timeline.noConflict')}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          p: '17px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          borderRadius: `${radius.md}px`,
          bgcolor: alpha(colors.background, 0.9),
          border: `1px solid ${alpha(colors.outline, 0.4)}`,
        }}
      >
        {events.isError ? (
          <Box sx={{ ...mono, color: colors.textSecondary }}>
            {t('timeline.unavailable')}
          </Box>
        ) : (
          <>
            <Box
              sx={{
                position: 'relative',
                height: 12,
                pb: '5px',
                borderBottom: `1px solid ${alpha(colors.outline, 0.2)}`,
                boxSizing: 'content-box',
              }}
            >
              {ticks.map((m, i) => (
                <Box
                  key={m}
                  component="span"
                  sx={{
                    ...mono,
                    position: 'absolute',
                    left: pct(m),
                    transform:
                      i === 0
                        ? 'none'
                        : i === ticks.length - 1
                          ? 'translateX(-100%)'
                          : 'translateX(-50%)',
                    color: alpha(colors.textSecondary, 0.6),
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatTick(m, lang)}
                </Box>
              ))}
            </Box>

            {events.isPending ? (
              <Skeleton
                variant="rounded"
                height={48}
                aria-label={t('timeline.loading')}
              />
            ) : (
              <Box
                sx={{
                  position: 'relative',
                  height: 48,
                  borderRadius: '8px',
                  bgcolor: alpha(colors.surfaceContainer, 0.5),
                  // Free time as a dashed line through the track.
                  backgroundImage: `linear-gradient(90deg, ${alpha(colors.outline, 0.4)} 50%, transparent 50%)`,
                  backgroundSize: '8px 1px',
                  backgroundRepeat: 'repeat-x',
                  backgroundPosition: '0 50%',
                }}
              >
                {slots
                  .filter((s) => s.to > win.start && s.from < win.end)
                  .map((s) => {
                    const clash = conflicts.includes(s);
                    return (
                      <Box
                        key={s.id}
                        title={`${formatClock(fromMinutes(s.from), lang)} ${s.title}`}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          bottom: 4,
                          left: pct(s.from),
                          width: `calc(${pct(s.to)} - ${pct(s.from)})`,
                          minWidth: 4,
                          px: '7px',
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'hidden',
                          borderRadius: '6px',
                          bgcolor: colors.surfaceContainerHigh,
                          border: `1px solid ${clash ? colors.warning : alpha(colors.outline, 0.5)}`,
                          opacity: 0.85,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            ...mono,
                            color: colors.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {formatClock(fromMinutes(s.from), lang)} {s.title}
                        </Box>
                      </Box>
                    );
                  })}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: pct(proposal.from),
                    width: `calc(${pct(proposal.to)} - ${pct(proposal.from)})`,
                    minWidth: 6,
                    px: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 0.5,
                    overflow: 'hidden',
                    borderRadius: '6px',
                    border: `2px solid ${CYAN}`,
                    // Opaque, so an overlapping event does not show through.
                    bgcolor: colors.surfaceContainerLow,
                    backgroundImage: `linear-gradient(90deg, ${alpha(CYAN, 0.3)}, ${alpha(CYAN, 0.12)})`,
                    boxShadow: `0 0 18px ${alpha(CYAN, 0.25)}`,
                    zIndex: 1,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      ...mono,
                      fontWeight: 600,
                      color: colors.accentText,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {formatClock(startTime, lang)}–
                    {formatClock(endDay === day ? endTime : '00:00', lang)}{' '}
                    {args.title}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      ...mono,
                      flexShrink: 0,
                      px: 0.5,
                      borderRadius: '4px',
                      bgcolor: alpha(colors.accentText, 0.2),
                      color: colors.accentText,
                      textTransform: 'uppercase',
                    }}
                  >
                    {t('timeline.proposed')}
                  </Box>
                </Box>
              </Box>
            )}
            {allDayCount > 0 && (
              <Box sx={{ ...mono, color: alpha(colors.textSecondary, 0.6) }}>
                {t('timeline.allDayEvents', { count: allDayCount })}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
