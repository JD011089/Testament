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
      <header className="sticky top-0 z-10 bg-surface/90 backdrop-blur-md">
        <div className={`${width} mx-auto flex items-center gap-1 px-3 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2`}>
          <button
            ref={backRef}
            type="button"
            onClick={onBack}
            className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-fg-muted hover:bg-stone-100 dark:hover:bg-stone-850 transition-colors cursor-pointer"
            aria-label={t('story.back')}
          >
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
          </button>
          {/* Long titles wrap onto a second line rather than being cut off. */}
          <h1 id={titleId} className="min-w-0 font-serif text-[1.6rem] font-semibold leading-tight text-fg [overflow-wrap:anywhere]">
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
