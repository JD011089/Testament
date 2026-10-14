import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, X, ArrowUpRight } from 'lucide-react';
import { applyAppUpdate, isUpdateAvailable } from '../utils/pwaUpdateEngine';
import { soundEngine } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

export const UpdateNotificationBanner: React.FC = () => {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState<boolean>(() => {
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('testament_update_toast_dismissed')) {
        return false;
      }
      return isUpdateAvailable();
    } catch {
      return false;
    }
  });
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdateFound = () => {
      try {
        if (!sessionStorage.getItem('testament_update_toast_dismissed')) {
          setShowBanner(true);
        }
      } catch {
        setShowBanner(true);
      }
    };

    window.addEventListener('testament-update-available', handleUpdateFound);
    return () => {
      window.removeEventListener('testament-update-available', handleUpdateFound);
    };
  }, []);

  // One-time auto-dismiss after 7 seconds so it never persists across screens
  useEffect(() => {
    if (!showBanner) return;
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem('testament_update_toast_dismissed', 'true');
      } catch {
        // ignore
      }
      setShowBanner(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, [showBanner]);

  const handleApplyUpdate = () => {
    soundEngine.playClick();
    setIsUpdating(true);
    applyAppUpdate();
  };

  const handleDismiss = () => {
    soundEngine.playSnap();
    try {
      sessionStorage.setItem('testament_update_toast_dismissed', 'true');
    } catch {
      // ignore
    }
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto pointer-events-auto"
        >
          <div className="p-3 rounded-2xl bg-stone-900/95 text-parchment-100 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 text-left transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-serif font-bold text-stone-100">
                    {t('update.ready')}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 truncate">
                  {t('update.desc')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleApplyUpdate}
                disabled={isUpdating}
                className="btn-primary text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isUpdating ? t('update.updating') : t('update.reload')}</span>
                {!isUpdating && <ArrowUpRight className="w-3 h-3 hidden sm:inline-block" />}
              </button>

              <button
                onClick={handleDismiss}
                aria-label="Dismiss update notification toast"
                className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors"
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
