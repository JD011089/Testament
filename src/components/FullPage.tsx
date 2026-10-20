import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FullPageProps {
  title: string;
  titleId: string;
  onBack: () => void;
  children: ReactNode;
  wide?: boolean;
}

/** Full-screen routed page. Same header, spacing, and tap targets as Settings. */
export function FullPage({ title, titleId, onBack, children, wide }: FullPageProps) {
  const { t } = useLanguage();
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  useEffect(() => {
    backRef.current?.focus();
  }, []);

  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  const width = wide ? 'max-w-3xl' : 'max-w-2xl';

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto overscroll-contain bg-surface text-stone-900 dark:text-parchment-50">
      <header className="sticky top-0 z-10 border-b border-stone-200 dark:border-stone-800 bg-surface/95 backdrop-blur-sm">
        <div className={`${width} mx-auto flex items-center gap-3 px-4 sm:px-8 pt-[max(0.75rem,env(safe-area-inset-top))] pb-4`}>
          <button
            ref={backRef}
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 min-h-[44px] pl-1 pr-3 -ml-1 rounded-full text-base font-semibold leading-6 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label={t('story.back')}
          >
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
            <span>{t('story.back')}</span>
          </button>
          <h1 id={titleId} className="text-title-1 text-stone-900 dark:text-parchment-50 truncate">
            {title}
          </h1>
        </div>
      </header>
      <div
        className={`${width} mx-auto px-5 sm:px-8 pt-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] space-y-8 text-base leading-7 [&_button]:min-h-[44px] [&_input]:min-h-[44px] [&_select]:min-h-[44px] [&_textarea]:min-h-[88px] [&_p]:leading-7`}
      >
        {children}
      </div>
    </div>
  );
}
