import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, X, ArrowUpRight } from 'lucide-react';
import { applyAppUpdate, isUpdateAvailable } from '../utils/pwaUpdateEngine';
import { soundEngine } from '../utils/audio';

export const UpdateNotificationBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState<boolean>(() => isUpdateAvailable());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdateFound = () => {
      setShowBanner(true);
    };

    window.addEventListener('testament-update-available', handleUpdateFound);
    return () => {
      window.removeEventListener('testament-update-available', handleUpdateFound);
    };
  }, []);

  const handleApplyUpdate = () => {
    soundEngine.playClick();
    setIsUpdating(true);
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
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141822] border-2 border-amber-500/70 shadow-2xl shadow-amber-500/15 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-bold text-parchment-50">
                    Testament Update Available
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 font-bold hidden sm:inline-block">
                    Ready
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 truncate mt-0.5">
                  A fresh version is installed. Tap to update and open.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleApplyUpdate}
                disabled={isUpdating}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-glow-amber flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isUpdating ? 'Updating...' : 'Update & Open'}</span>
                {!isUpdating && <ArrowUpRight className="w-3 h-3 hidden sm:inline-block" />}
              </button>

              <button
                onClick={handleDismiss}
                aria-label="Dismiss update notification banner"
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
