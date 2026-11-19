import 'i18next';

import type en from './locales/en.json';

// English is the source of truth: `t()` only accepts keys that exist there.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
  }
}
