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
