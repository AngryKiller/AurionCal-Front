import enUS from './en-US.json';
import frFR from './fr-FR.json';

export type LocaleManifestEntry = {
  /** BCP-47 locale code, ex: "en-US", "fr-FR" */
  code: string;
  /** Human-friendly label shown in the language selector */
  label: string;
  /** ISO 3166-1 alpha-2 country code, ex: "US", "FR" (used for flags) */
  flag: string;
  /** vue-i18n messages */
  messages: Record<string, unknown>;
};

const manifest: readonly LocaleManifestEntry[] = [
  {
    code: 'en-US',
    label: 'English',
    flag: 'GB',
    messages: enUS,
  },
  {
    code: 'fr-FR',
    label: 'Français',
    flag: 'FR',
    messages: frFR,
  },
] as const;

export default manifest;
