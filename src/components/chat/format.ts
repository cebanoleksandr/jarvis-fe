/** `09:14` in the user's language and timezone; falls back to the browser zone. */
export function formatTime(iso: string, language: string, timeZone?: string) {
  const opts: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  try {
    return new Intl.DateTimeFormat(language, { ...opts, timeZone }).format(
      new Date(iso),
    );
  } catch {
    return new Intl.DateTimeFormat(language, opts).format(new Date(iso));
  }
}

/** `YYYY-MM-DD` of an instant in the given timezone. */
export function dayKey(iso: string | Date, timeZone?: string) {
  const opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  try {
    return new Intl.DateTimeFormat('en-CA', { ...opts, timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-CA', opts).format(date);
  }
}
