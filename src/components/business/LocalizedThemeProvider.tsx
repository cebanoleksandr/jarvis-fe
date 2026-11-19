import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { enUS, esES, plPL, ruRU, ukUA } from '@mui/material/locale';

import { currentLanguage, type LanguageCode } from '../../i18n';
import { theme } from '../../theme';

const MUI_LOCALES = {
  en: enUS,
  uk: ukUA,
  ru: ruRU,
  pl: plPL,
  es: esES,
} satisfies Record<LanguageCode, unknown>;

/** The app theme plus MUI's built-in texts (close buttons, pagination...) in the active language. */
export function LocalizedThemeProvider({ children }: { children: ReactNode }) {
  // Subscribes to language changes; the code itself comes from currentLanguage().
  useTranslation();
  const code = currentLanguage();
  const localized = useMemo(
    () => createTheme(theme, MUI_LOCALES[code]),
    [code],
  );
  return <ThemeProvider theme={localized}>{children}</ThemeProvider>;
}
