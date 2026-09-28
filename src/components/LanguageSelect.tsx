import { Languages } from 'lucide-react';
import { LOCALES, useI18n, type LocaleId } from '../i18n';
import { soundEngine } from '../utils/audio';

interface LanguageSelectProps {
  compact?: boolean;
}

export function LanguageSelect({ compact = false }: LanguageSelectProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <label
      className={`inline-flex items-center gap-1 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 ${
        compact ? 'px-1.5 py-1' : 'px-2 py-1.5'
      }`}
      title={t('lang.note')}
    >
      <Languages className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" aria-hidden="true" />
      <select
        value={locale}
        aria-label={t('lang.label')}
        onChange={(event) => {
          soundEngine.playClick();
          setLocale(event.target.value as LocaleId);
        }}
        className={`bg-transparent font-semibold cursor-pointer focus:outline-none max-w-[7.5rem] ${
          compact ? 'text-[11px]' : 'text-xs'
        }`}
      >
        {LOCALES.map((item) => (
          <option key={item.id} value={item.id} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
            {compact ? item.short : item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
