import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BibleSheetProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  /** Dim the page behind the sheet. Off for the verse panel so the text stays readable. */
  dim?: boolean;
  closeLabel?: string;
}

/** Slide-up panel on phones, centred card on larger screens. Escape closes it. */
export const BibleSheet: React.FC<BibleSheetProps> = ({ title, subtitle, onClose, children, dim = true, closeLabel = 'Close' }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center pointer-events-none" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className={`absolute inset-0 pointer-events-auto cursor-default ${dim ? 'bg-black/40 backdrop-blur-[1px]' : 'bg-transparent'}`}
      />
      <div className="pointer-events-auto relative w-full sm:max-w-md max-h-[86dvh] overflow-y-auto overscroll-contain bg-surface-raised text-fg rounded-t-[28px] sm:rounded-[28px] px-5 pt-3 pb-[max(1.4rem,env(safe-area-inset-bottom))] shadow-[0_-18px_50px_rgba(0,0,0,0.25)] animate-[sheetUp_.22s_ease-out]">
        <div className="w-10 h-1.5 rounded-full bg-line mx-auto mb-3 sm:hidden" />
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              {title && <h2 className="font-serif text-2xl font-semibold text-fg leading-tight">{title}</h2>}
              {subtitle && <p className="text-sm text-fg-muted mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="w-10 h-10 min-h-0 shrink-0 rounded-full bg-stone-100 dark:bg-stone-850 flex items-center justify-center text-fg-muted hover:text-fg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
