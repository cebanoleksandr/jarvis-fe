import type { PendingAction } from '../../services';

/**
 * Arguments of the tools the UI knows how to show and edit. They mirror the
 * backend zod schemas (google/tools/*.tools.ts): dates and times are local
 * wall-clock values in the user's timezone, `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM`.
 */
export interface EventArgs {
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
}

export interface TaskArgs {
  title: string;
  due?: string;
  notes?: string;
}

const str = (v: unknown) => (typeof v === 'string' ? v : undefined);

export function eventArgs(action: PendingAction): EventArgs | null {
  if (action.tool !== 'create_event') return null;
  const { title, start, end, location, description } = action.args;
  if (!str(title) || !str(start) || !str(end)) return null;
  return {
    title: title as string,
    start: start as string,
    end: end as string,
    location: str(location),
    description: str(description),
  };
}

export function taskArgs(action: PendingAction): TaskArgs | null {
  if (action.tool !== 'create_task') return null;
  const { title, due, notes } = action.args;
  if (!str(title)) return null;
  return { title: title as string, due: str(due), notes: str(notes) };
}

export const isAllDay = (args: EventArgs) => args.start.length === 10;

/** `HH:MM` -> minutes since midnight. */
export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const fromMinutes = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/**
 * Wall-clock value -> Date in UTC with the same fields, formatted with
 * `timeZone: 'UTC'`, so the browser's own zone never shifts the day or hour.
 */
function wallClock(value: string) {
  const [d, t = '00:00'] = value.split('T');
  const [y, mo, day] = d.split('-').map(Number);
  const [h, mi] = t.split(':').map(Number);
  return new Date(Date.UTC(y, mo - 1, day, h, mi));
}

const fmt = (language: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(language, { ...opts, timeZone: 'UTC' });

/** `Thursday, Nov 27` */
export function formatDay(
  date: string,
  language: string,
  weekday: 'long' | 'short' = 'long',
) {
  return fmt(language, { weekday, month: 'short', day: 'numeric' }).format(
    wallClock(date),
  );
}

export function formatClock(time: string, language: string) {
  return fmt(language, { hour: '2-digit', minute: '2-digit' }).format(
    wallClock(`2000-01-01T${time}`),
  );
}

/** `Thursday, Nov 27 · 14:00 – 16:00`, or an all-day / multi-day range. */
export function formatEventWhen(args: EventArgs, language: string) {
  const [sd, st] = args.start.split('T');
  const [ed, et] = args.end.split('T');
  if (isAllDay(args)) {
    return sd === ed
      ? formatDay(sd, language)
      : `${formatDay(sd, language, 'short')} – ${formatDay(ed, language, 'short')}`;
  }
  if (sd === ed) {
    return `${formatDay(sd, language)} · ${formatClock(st, language)} – ${formatClock(et, language)}`;
  }
  return `${formatDay(sd, language, 'short')}, ${formatClock(st, language)} – ${formatDay(ed, language, 'short')}, ${formatClock(et, language)}`;
}
