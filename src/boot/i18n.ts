import { defineBoot } from '#q-app/wrappers';
import { LocalStorage } from 'quasar';
import { createI18n } from 'vue-i18n';
import type { I18n } from 'vue-i18n';
import type { Ref } from 'vue';

import type enUS from 'src/i18n/en-US.json';
import messages, { manifest } from 'src/i18n';

export type MessageSchema = typeof enUS;

const I18N_STORAGE_KEY = 'aurioncal.locale';
const DEFAULT_LOCALE = 'en-US' as const;

function normalizeLocale(input: string | null | undefined): string {
  return (input ?? '').trim().replace('_', '-');
}

function supportedLocaleCodes(): string[] {
  return manifest.map((m) => m.code);
}

function resolveSupportedLocale(raw: string | null | undefined): string {
  const normalized = normalizeLocale(raw);
  const supported = supportedLocaleCodes();

  if (supported.includes(normalized)) {
    return normalized;
  }

  const lang = normalized.split('-')[0];
  const byLang = supported.find((s) => s.split('-')[0] === lang);
  if (byLang) {
    return byLang;
  }

  return DEFAULT_LOCALE;
}

function getInitialLocale(): string {
  const stored = LocalStorage.getItem(I18N_STORAGE_KEY);
  if (typeof stored === 'string' && stored.length > 0) {
    return resolveSupportedLocale(stored);
  }

  if (typeof navigator !== 'undefined') {
    const browserLocale = navigator.languages?.[0] || navigator.language;
    return resolveSupportedLocale(browserLocale);
  }

  return DEFAULT_LOCALE;
}

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
  export interface DefineDateTimeFormat {}
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export default defineBoot(({ app }) => {
  const i18n = createI18n({
    locale: getInitialLocale(),
    legacy: false,
    messages: messages as unknown as Record<string, MessageSchema>,
  }) as unknown as I18n;

  const localeRef = (i18n.global as unknown as { locale: Ref<string> }).locale;
  const current = resolveSupportedLocale(localeRef.value);
  localeRef.value = current;
  LocalStorage.set(I18N_STORAGE_KEY, current);

  app.use(i18n);
});

export { I18N_STORAGE_KEY, resolveSupportedLocale, DEFAULT_LOCALE };
