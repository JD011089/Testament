import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, X, ArrowUpRight } from 'lucide-react';
import { applyAppUpdate, isUpdateAvailable, primeWaitingWorker } from '../utils/pwaUpdateEngine';
import { soundEngine } from '../utils/audio';
import { useI18n } from '../i18n';
import { buildReloadUrl, markReloadGuard, needsGestureNavigation } from '../utils/pwaReload';

export const UpdateNotificationBanner: React.FC = () => {
  const { t } = useI18n();
  const [showBanner, setShowBanner] = useState<boolean>(() => isUpdateAvailable());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const iosHomeScreen = needsGestureNavigation();
  const reloadHref = iosHomeScreen ? buildReloadUrl(window.location.href) : undefined;

  useEffect(() => {
    const handleUpdateFound = () => {
      setShowBanner(true);
    };

    window.addEventListener('testament-update-available', handleUpdateFound);
    return () => {
      window.removeEventListener('testament-update-available', handleUpdateFound);
    };
  }, []);

  const handleApplyUpdate = (event: React.MouseEvent<HTMLAnchorElement>) => {
    soundEngine.playClick();
    setIsUpdating(true);
    window.setTimeout(() => setIsUpdating(false), 2500);
    if (iosHomeScreen) {
      // Let the anchor navigate. iOS standalone ignores reload() and timed location changes.
      primeWaitingWorker();
      markReloadGuard();
      return;
    }
    event.preventDefault();
    applyAppUpdate();
  };

  const handleDismiss = () => {
    soundEngine.playSnap();
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-4 right-4 z-50 max-w-xl mx-auto"
        >
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-ink-overlay border border-amber-500/70 shadow-xl dark:shadow-2xl flex items-center justify-between gap-3 text-left transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-800 dark:text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-serif font-bold text-stone-900 dark:text-parchment-50">
                    {t('update.title')}
                  </span>
                  <span className="text-[11px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-bold hidden sm:inline-block">
                    {t('update.badge')}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {t('update.body')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <a
                href={reloadHref || window.location.href}
                onClick={handleApplyUpdate}
                aria-disabled={isUpdating}
                className={`px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${isUpdating ? 'pointer-events-none opacity-80' : ''}`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isUpdating ? t('update.updating') : t('update.reload')}</span>
                {!isUpdating && <ArrowUpRight className="w-3 h-3 hidden sm:inline-block" />}
              </a>

              <button
                onClick={handleDismiss}
                aria-label={t('update.dismiss')}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
