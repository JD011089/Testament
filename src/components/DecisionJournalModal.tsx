import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookHeart, 
  X, 
  Trash2, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  Quote, 
  AlertCircle
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';
import { useLanguage } from '../context/LanguageContext';
import { 
  getDecisionJournalEntries, 
  clearDecisionJournal, 
  deleteDecisionJournalEntry,
  saveUserFreeTextJournalEntry,
  type DecisionJournalEntry 
} from '../utils/decisionJournal';

interface DecisionJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DecisionJournalModal: React.FC<DecisionJournalModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const modalRef = useModalLock(isOpen);
  const [entries, setEntries] = useState<DecisionJournalEntry[]>(() => getDecisionJournalEntries());
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);
  const [reflectionText, setReflectionText] = useState<string>('');

  const handleSaveReflection = () => {
    if (!reflectionText.trim()) return;
    soundEngine.playSnap();
    const newEntry = saveUserFreeTextJournalEntry(reflectionText);
    if (newEntry) {
      setEntries(getDecisionJournalEntries());
      setReflectionText('');
    }
  };

  const handleDeleteEntry = (id: string) => {
    soundEngine.playClick();
    deleteDecisionJournalEntry(id);
    setEntries(getDecisionJournalEntries());
  };

  const handleClear = () => {
    soundEngine.playClick();
    clearDecisionJournal();
    setEntries([]);
    setIsConfirmingClear(false);
  };

  const handleDismiss = () => {
    soundEngine.playClick();
    setIsConfirmingClear(false);
    onClose();
  };

  const formatDate = (dateKey: string, timestamp: number) => {
    try {
      const d = timestamp ? new Date(timestamp) : new Date(dateKey);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateKey;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-black/60 dark:bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain"
          onClick={handleDismiss}
          role="region"
          aria-label="Decision Journal"
        >
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[85vh] rounded-none sm:rounded-3xl bg-white dark:bg-stone-900 border-0 sm:border border-stone-200 dark:border-stone-800 shadow-none sm:shadow-2xl flex flex-col text-left overflow-hidden relative outline-none"
          >
            {/* MODAL HEADER */}
            <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 bg-stone-50 dark:bg-stone-900/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                  <BookHeart className="w-5 h-5" />
                </div>
                <div>
                  <h2 
                    id="journal-modal-title"
                    className="text-lg font-serif font-bold text-stone-900 dark:text-parchment-50"
                  >
                    {t('journal.title')}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {t('journal.subtitle')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors"
                aria-label="Close journal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PRIVACY PROMISE BANNER (Non-negotiable requirement) */}
            <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200 shrink-0">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-medium">
                {t('journal.privacyPromise')}
              </span>
            </div>

            {/* TIMELINE LIST */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Free-Text Reflection Composer */}
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-stone-850/90 border border-amber-500/25 space-y-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold block">
                  {t('journal.reflectionType')}
                </span>
                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder={t('journal.writePrompt')}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm font-reading text-stone-900 dark:text-parchment-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!reflectionText.trim()}
                    onClick={handleSaveReflection}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reflectionText.trim()
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {t('journal.saveReflection')}
                  </button>
                </div>
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                    <Quote className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-serif font-bold text-stone-800 dark:text-stone-200">
                    {t('journal.noDecisions')}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                    {t('journal.noDecisionsDesc')}
                  </p>
                </div>
              ) : (
                <div className="relative pl-4 sm:pl-6 border-l-2 border-amber-500/30 space-y-6 my-2">
                  {entries.map((entry) => {
                    const hasUserCustom = Boolean(entry.userCustomText?.trim());
                    const isFreeReflection = entry.entryType === 'free_reflection';
                    return (
                      <div key={entry.id} className="relative group">
                        {/* Timeline pip */}
                        <div className="absolute -left-[23px] sm:-left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white dark:border-stone-900 shadow-xs" />

                        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850/70 border border-stone-200/80 dark:border-stone-800 space-y-3">
                          {/* Entry Header: Date & Passage + Delete entry button */}
                          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 flex-wrap gap-1">
                            <span className="font-mono flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-400">
                              <Calendar className="w-3 h-3" />
                              {formatDate(entry.dateKey, entry.timestamp)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] bg-stone-200/60 dark:bg-stone-800 px-2 py-0.5 rounded-md text-stone-700 dark:text-stone-300">
                                {isFreeReflection ? t('journal.reflectionType') : `${entry.heroName} (${entry.passageReference})`}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-1 rounded-md text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                title={t('journal.deleteEntry')}
                                aria-label={t('journal.deleteEntry')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Scenario Question (for mission decisions) */}
                          {!isFreeReflection && (
                            <p className="text-xs sm:text-sm font-serif font-medium text-stone-700 dark:text-stone-300 italic">
                              "{entry.scenarioQuestion}"
                            </p>
                          )}

                          {/* User's Choice (Verbatim Own Words or Option Text) */}
                          <div className="p-3 rounded-xl bg-amber-500/10 border-l-2 border-amber-500">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold block mb-1">
                              {isFreeReflection ? t('journal.reflectionType') : (hasUserCustom ? t('journal.inYourOwnWords') : t('journal.yourDecision'))}
                            </span>
                            <p className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-50 leading-snug">
                              "{hasUserCustom ? entry.userCustomText : entry.chosenText}"
                            </p>
                          </div>

                          {/* Day's Story Takeaway */}
                          {entry.storyTakeaway && (
                            <p className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-1.5 pt-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{entry.storyTakeaway}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 flex items-center justify-between gap-3 shrink-0">
              {entries.length > 0 && !isConfirmingClear ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-medium py-1.5 px-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('journal.clear')}</span>
                </button>
              ) : isConfirmingClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    {t('journal.wipeConfirm')}
                  </span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
                  >
                    {t('journal.yesClear')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(false)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
                  >
                    {t('journal.cancel')}
                  </button>
                </div>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleDismiss}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs transition-colors"
              >
                {t('journal.close')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
