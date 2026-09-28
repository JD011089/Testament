import { isTranslationId, type TranslationId } from '../utils/bibleService';
import { loadReadingPlace, saveReadingPlace } from '../utils/readingPlace';
import { en, type MessageKey } from './en';
import { ar } from './ar';
import { de } from './de';
import { es } from './es';
import { fr } from './fr';
import { ko } from './ko';
import { pt } from './pt';
import { zh } from './zh';

export type { MessageKey };

export type LocaleId = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'ko' | 'zh' | 'ar';

export interface LocaleOption {
  id: LocaleId;
  /** Name in that language, shown in the picker. */
  label: string;
  /** Short mark for the crowded phone header. */
  short: string;
  dir: 'ltr' | 'rtl';
  scripture: TranslationId;
}

export const LOCALES: LocaleOption[] = [
  { id: 'en', label: 'English', short: 'EN', dir: 'ltr', scripture: 'web' },
  { id: 'es', label: 'Español', short: 'ES', dir: 'ltr', scripture: 'valera' },
  { id: 'pt', label: 'Português', short: 'PT', dir: 'ltr', scripture: 'almeida' },
  { id: 'fr', label: 'Français', short: 'FR', dir: 'ltr', scripture: 'ls1910' },
  { id: 'de', label: 'Deutsch', short: 'DE', dir: 'ltr', scripture: 'luther1545' },
  { id: 'ko', label: '한국어', short: '한', dir: 'ltr', scripture: 'korean' },
  { id: 'zh', label: '中文', short: '中', dir: 'ltr', scripture: 'cus' },
  { id: 'ar', label: 'العربية', short: 'ع', dir: 'rtl', scripture: 'arabicsv' },
];

const TABLES = { en, es, pt, fr, de, ko, zh, ar };
const STORAGE_KEY = 'testament_locale';
const PREFERRED_TRANSLATION_KEY = 'testament_scripture_translation';

let activeLocale: LocaleId = 'en';

export function isLocaleId(value: unknown): value is LocaleId {
  return LOCALES.some((item) => item.id === value);
}

export function localeById(id: LocaleId): LocaleOption {
  return LOCALES.find((item) => item.id === id) ?? LOCALES[0];
}

function matchNavigatorLocale(): LocaleId {
  if (typeof navigator === 'undefined') return 'en';
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    const base = (tag || '').toLowerCase().split('-')[0];
    if (isLocaleId(base)) return base;
  }
  return 'en';
}

export function readStoredLocale(): LocaleId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocaleId(stored)) return stored;
  } catch {
    // ignore
  }
  return matchNavigatorLocale();
}

export function getLocale(): LocaleId {
  return activeLocale;
}

export function getPreferredTranslation(): TranslationId {
  const fromLocale = localeById(activeLocale).scripture;
  try {
    const stored = localStorage.getItem(PREFERRED_TRANSLATION_KEY);
    if (isTranslationId(stored)) return stored;
  } catch {
    // ignore
  }
  return fromLocale;
}

function applyDocumentLocale(id: LocaleId) {
  if (typeof document === 'undefined') return;
  const locale = localeById(id);
  document.documentElement.lang = id === 'zh' ? 'zh-Hans' : id;
  document.documentElement.dir = locale.dir;
}

function rememberScripture(translation: TranslationId) {
  try {
    localStorage.setItem(PREFERRED_TRANSLATION_KEY, translation);
  } catch {
    // ignore
  }
  const place = loadReadingPlace();
  if (place && place.translation !== translation) {
    saveReadingPlace({ ...place, translation });
  }
}

export function translate(key: MessageKey, vars?: Record<string, string | number>): string {
  const table = TABLES[activeLocale] ?? en;
  let text = table[key] ?? en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function initLocale(): LocaleId {
  activeLocale = readStoredLocale();
  applyDocumentLocale(activeLocale);
  return activeLocale;
}

export function persistLocale(id: LocaleId): void {
  activeLocale = id;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore
  }
  applyDocumentLocale(id);
  const scripture = localeById(id).scripture;
  rememberScripture(scripture);
  window.dispatchEvent(new CustomEvent('testament-locale-changed', {
    detail: { locale: id, translation: scripture }
  }));
}
