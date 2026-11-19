import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import pl from './locales/pl.json';
import ru from './locales/ru.json';
import uk from './locales/uk.json';

/** Order shown in the language menu. `short` is the compact label in headers. */
export const LANGUAGES = [
  { code: 'uk', name: 'Українська', short: 'UA' },
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'pl', name: 'Polski', short: 'PL' },
  { code: 'es', name: 'Español', short: 'ES' },
  { code: 'ru', name: 'Русский', short: 'RU' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

/** The active language, narrowed to one we ship. */
export function currentLanguage(): LanguageCode {
  const lng = i18n.resolvedLanguage;
  return LANGUAGES.some((l) => l.code === lng)
    ? (lng as LanguageCode)
    : DEFAULT_LANGUAGE;
}

// Resources are bundled: they are small, and this avoids a flash of
// untranslated keys on first paint.
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      uk: { translation: uk },
      ru: { translation: ru },
      pl: { translation: pl },
      es: { translation: es },
    },
    supportedLngs: LANGUAGES.map((l) => l.code),
    // uk-UA -> uk, es-MX -> es, ...
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false }, // React already escapes.
    detection: {
      // ?lng=pl in a link, then the user's saved choice, then the browser.
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'jarvis.language',
      caches: ['localStorage'],
    },
    returnNull: false,
  });

const syncHtmlLang = (lng: string) => {
  document.documentElement.lang = lng;
};
syncHtmlLang(currentLanguage());
i18n.on('languageChanged', () => syncHtmlLang(currentLanguage()));

export default i18n;
