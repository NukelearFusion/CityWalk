import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { getLocales } from 'expo-localization';
import { catalogues, DEFAULT_LOCALE, type Locale, type Translations } from './translations';

/** A message with plural forms, as declared in the catalogue. */
export interface PluralForms {
  one: string;
  few: string;
  many: string;
}

/**
 * Plural category for a count.
 *
 * Polish uses three forms: 1 → one, 2–4 (excluding the teens) → few, the rest →
 * many. This is implemented directly rather than through `Intl.PluralRules`
 * because Hermes ships without full ICU data on some Android builds.
 */
function pluralCategory(count: number, locale: Locale): keyof PluralForms {
  const n = Math.abs(Math.trunc(count));

  if (locale === 'en') return n === 1 ? 'one' : 'many';

  if (n === 1) return 'one';

  const lastTwo = n % 100;
  const last = n % 10;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'few';

  return 'many';
}

/** Replaces `%{name}` placeholders with the supplied values. */
function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/%\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    return value === undefined ? match : String(value);
  });
}

export interface I18n {
  /** The active catalogue, accessed as a typed object: `t.home.greeting`. */
  t: Translations;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Fills `%{…}` placeholders in a message. */
  format: (template: string, params: Record<string, string | number>) => string;
  /** Picks the correct plural form and substitutes `%{count}`. */
  plural: (forms: PluralForms, count: number) => string;
}

const I18nContext = createContext<I18n | null>(null);

/** Best matching supported locale for the device, falling back to Polish. */
function detectLocale(): Locale {
  const preferred = getLocales();
  for (const entry of preferred) {
    const code = entry.languageCode;
    if (code && code in catalogues) return code as Locale;
  }
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale);

  const plural = useCallback(
    (forms: PluralForms, count: number): string =>
      interpolate(forms[pluralCategory(count, locale)], { count }),
    [locale],
  );

  const value = useMemo<I18n>(
    () => ({ t: catalogues[locale], locale, setLocale, format: interpolate, plural }),
    [locale, plural],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return context;
}

export { DEFAULT_LOCALE, LOCALES } from './translations';
export type { Locale, Translations } from './translations';
