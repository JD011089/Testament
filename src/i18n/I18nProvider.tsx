import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { initLocale, persistLocale, translate, type LocaleId } from './runtime';

interface I18nContextValue {
  locale: LocaleId;
  setLocale: (id: LocaleId) => void;
  t: typeof translate;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: translate,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleId>(() => initLocale());

  useEffect(() => {
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<{ locale?: LocaleId }>).detail?.locale;
      if (next && next !== locale) setLocaleState(next);
    };
    window.addEventListener('testament-locale-changed', onChange);
    return () => window.removeEventListener('testament-locale-changed', onChange);
  }, [locale]);

  const setLocale = useCallback((id: LocaleId) => {
    setLocaleState(id);
    persistLocale(id);
  }, []);

  const value = useMemo(() => ({ locale, setLocale, t: translate }), [locale, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
