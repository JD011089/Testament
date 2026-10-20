import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import { WEEKLY_SERIES, type WeeklySeries } from '../data/weeklySeries';
import {
  clearActiveSeries,
  getActiveSeriesState,
  getSeriesDayNumber,
  startWeeklySeries,
  type ActiveSeriesState,
} from '../utils/weeklySeriesEngine';
import { soundEngine } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';
import { useLanguage } from '../context/LanguageContext';

function guardClickThrough(ms = 450) {
  const blocker = document.createElement('div');
  blocker.setAttribute('aria-hidden', 'true');
  blocker.style.cssText = 'position:fixed;inset:0;z-index:2147483647;touch-action:none;';
  const stop = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };
  blocker.addEventListener('click', stop, true);
  blocker.addEventListener('pointerup', stop, true);
  blocker.addEventListener('pointerdown', stop, true);
  blocker.addEventListener('touchend', stop, true);
  document.body.appendChild(blocker);
  window.setTimeout(() => blocker.remove(), ms);
}

interface SeriesPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeriesSelected?: (seriesId: string) => void;
}

export function SeriesPickerModal({ isOpen, onClose, onSeriesSelected }: SeriesPickerModalProps) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const rootRef = useModalLock(isOpen);
  const [activeState, setActiveState] = useState<ActiveSeriesState | null>(() => getActiveSeriesState());
  const [detail, setDetail] = useState<WeeklySeries | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveState(getActiveSeriesState());
    setDetail(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      soundEngine.playSnap();
      if (detail) {
        setDetail(null);
        return;
      }
      guardClickThrough();
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, detail, onClose]);

  if (!isOpen) return null;

  const dismiss = () => {
    guardClickThrough();
    onClose();
  };

  const handleClear = () => {
    soundEngine.playSnap();
    clearActiveSeries();
    setActiveState(null);
    dismiss();
  };

  const launchSeriesDay = (seriesId: string, dayNumber?: number) => {
    soundEngine.playClick();
    const existing = getActiveSeriesState();
    const switching = !existing || existing.seriesId !== seriesId;
    const next = switching ? startWeeklySeries(seriesId) : existing;
    if (!next) return;

    setActiveState(next);
    const todayDay = getSeriesDayNumber(next);
    const targetDay = dayNumber ?? todayDay;
    if (targetDay > todayDay) return;

    const dayOffset = targetDay - todayDay;
    onSeriesSelected?.(seriesId);
    window.dispatchEvent(
      new CustomEvent('testament-launch-series-day', {
        detail: { seriesId, dayOffset, dayNumber: targetDay },
      })
    );
    dismiss();
  };

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 34 };

  const isDetailActive = Boolean(detail && activeState?.seriesId === detail.id);
  const detailDay = isDetailActive && activeState ? getSeriesDayNumber(activeState) : 1;
  const ctaDay = isDetailActive && activeState ? getSeriesDayNumber(activeState) : 1;

  return (
    <motion.div
      ref={rootRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="series-picker-title"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18 }}
      onClick={() => {
        soundEngine.playSnap();
        dismiss();
      }}
    >
      <motion.div
        initial={reduceMotion ? false : { y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reduceMotion ? undefined : { y: 24, opacity: 0 }}
        transition={transition}
        className="w-full max-w-lg sm:max-w-xl max-h-[88dvh] rounded-t-3xl sm:rounded-3xl bg-surface-raised dark:bg-stone-900 border border-line dark:border-stone-700 shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-4 pt-3 pb-3 border-b border-line dark:border-stone-800 flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSnap();
              if (detail) {
                setDetail(null);
                return;
              }
              dismiss();
            }}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-line bg-surface dark:bg-stone-850 text-fg-muted hover:text-fg transition-colors"
            aria-label={detail ? t('series.back') : t('series.close')}
          >
            {detail ? <ArrowLeft className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-accent-text font-bold">
              {detail
                ? isDetailActive
                  ? t('series.dayOfSeven', { day: detailDay })
                  : t('series.weekLabel')
                : t('series.pickerEyebrow')}
            </p>
            <h2 id="series-picker-title" className="text-title-3 text-fg truncate leading-tight">
              {detail ? detail.heroName : t('series.pickerTitle')}
            </h2>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4">
          {!detail ? (
            <div className="space-y-2">
              <p className="text-xs text-fg-muted leading-relaxed pb-1">
                {t('series.pickerHint')}
              </p>

              {WEEKLY_SERIES.map((series) => {
                const isActive = activeState?.seriesId === series.id;
                const day = isActive && activeState ? getSeriesDayNumber(activeState) : null;
                return (
                  <button
                    key={series.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playSnap();
                      setDetail(series);
                    }}
                    className={`w-full flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors min-h-[60px] ${
                      isActive
                        ? 'border-accent/45 bg-accent/10'
                        : 'border-line bg-surface dark:bg-stone-900/70 hover:border-accent/35'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-serif font-bold ${
                        isActive
                          ? 'bg-accent text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-fg'
                      }`}
                      aria-hidden
                    >
                      {series.heroName.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-fg">{series.heroName}</span>
                        {isActive && day != null && (
                          <span className="text-[10px] font-mono font-bold text-accent-text bg-accent/15 px-1.5 py-0.5 rounded-md">
                            {t('series.dayChip', { day })}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-fg-muted mt-0.5 line-clamp-1 leading-snug">
                        {series.tagline}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-fg-muted shrink-0" />
                  </button>
                );
              })}

              {activeState && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="btn-quiet w-full mt-2 text-xs text-fg-muted"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('series.leaveSeries')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-fg-muted leading-relaxed">{detail.tagline}</p>

              <ol className="space-y-1.5">
                {detail.moments.map((m) => {
                  const isDone = isDetailActive && activeState?.completedMomentIds.includes(m.id);
                  const isToday = m.dayNumber === detailDay;
                  const locked = isDetailActive ? m.dayNumber > detailDay : m.dayNumber > 1;
                  const canOpen = !locked;

                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        disabled={!canOpen}
                        onClick={() => {
                          if (!canOpen) return;
                          launchSeriesDay(detail.id, m.dayNumber);
                        }}
                        className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors min-h-[52px] ${
                          locked
                            ? 'border-line/60 bg-surface/70 dark:bg-stone-900/40 cursor-not-allowed'
                            : isToday
                              ? 'border-accent/40 bg-accent/10'
                              : 'border-line bg-surface dark:bg-stone-850/70 hover:border-accent/30'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-mono font-bold ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : isToday
                                ? 'bg-accent text-white'
                                : locked
                                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500'
                                  : 'bg-stone-200 dark:bg-stone-700 text-fg-muted'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : m.dayNumber}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-sm font-medium leading-snug truncate ${
                              locked ? 'text-stone-400 dark:text-stone-500' : 'text-fg'
                            }`}
                          >
                            {m.momentTitle}
                          </div>
                          <div
                            className={`text-[11px] font-mono mt-0.5 truncate ${
                              locked ? 'text-stone-300 dark:text-stone-600' : 'text-fg-muted'
                            }`}
                          >
                            {m.reference}
                          </div>
                        </div>
                        {isToday && canOpen && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wide text-accent-text shrink-0 pr-0.5">
                            {t('series.today')}
                          </span>
                        )}
                        {canOpen && !isToday && (
                          <ArrowRight className="w-3.5 h-3.5 text-fg-muted shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        {detail && (
          <div className="shrink-0 px-4 pt-3 pb-[calc(0.85rem+env(safe-area-inset-bottom,0px))] border-t border-line dark:border-stone-800">
            <button
              type="button"
              onClick={() => launchSeriesDay(detail.id, ctaDay)}
              className="btn-primary w-full !max-w-none text-sm"
            >
              {isDetailActive
                ? t('series.continueDay', { day: ctaDay })
                : activeState
                  ? t('series.switchStart', { name: detail.heroName })
                  : t('series.startDayOne')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
