import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  HeartHandshake, 
  Brain, 
  Bell, 
  Wind, 
  Flame, 
  Music, 
  Volume2, 
  CheckCircle2, 
  ShieldAlert,
  Compass,
  Sparkles,
  MapPin
} from 'lucide-react';
import { 
  PSALM_PRESCRIPTIONS, 
  PSALM_MOODS, 
  type PsalmCrisisMood, 
  type PsalmPrescription 
} from '../data/psalms';
import { soundEngine } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedPsalm } from '../utils/localizedScripture';

interface PsalmsFieldMedicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWordForge?: (verseId: string) => void;
  onSetMemoryVerse?: (verseId: string) => void;
  currentAmbience?: 'none' | 'campfire' | 'wind' | 'sanctuary';
  onToggleAmbience?: (type: 'campfire' | 'wind' | 'sanctuary') => void;
  onRewardXP?: (xp: number) => void;
  initialPsalmId?: string | null;
}

export const PsalmsFieldMedicModal: React.FC<PsalmsFieldMedicModalProps> = ({
  isOpen,
  onClose,
  onOpenWordForge,
  onSetMemoryVerse,
  currentAmbience = 'none',
  onToggleAmbience,
  onRewardXP,
  initialPsalmId
}) => {
  const { t, language } = useLanguage();
  const modalRef = useModalLock(isOpen);
  const [selectedMood, setSelectedMood] = useState<PsalmCrisisMood>('panic-fear');

  useEffect(() => {
    if (isOpen && initialPsalmId) {
      const match = PSALM_PRESCRIPTIONS.find(p => p.id === initialPsalmId);
      if (match) {
        setSelectedMood(match.moodId);
      }
    }
  }, [isOpen, initialPsalmId]);
  const [completedPrescriptions, setCompletedPrescriptions] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('testament_psalm_completed');
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  });
  const [isFormalMode, setIsFormalMode] = useState<boolean>(false);

  const rawPrescriptions = PSALM_PRESCRIPTIONS.filter(p => p.moodId === selectedMood);
  const rawItem: PsalmPrescription = rawPrescriptions[0] || PSALM_PRESCRIPTIONS[0];
  const activeItem: PsalmPrescription = getLocalizedPsalm(rawItem, language);

  const getMoodLabel = (moodKey: PsalmCrisisMood): string => {
    switch (moodKey) {
      case 'panic-fear': return t('medic.moodPanic');
      case 'insomnia-overwhelm': return t('medic.moodInsomnia');
      case 'betrayal-hurt': return t('medic.moodBetrayal');
      case 'guilt-ruin': return t('medic.moodGuilt');
      case 'rage-injustice': return t('medic.moodRage');
      case 'grief-exhaustion': return t('medic.moodGrief');
      default: return '';
    }
  };

  const handleApplyPrescription = () => {
    soundEngine.playVictory();
    if (!completedPrescriptions[activeItem.id]) {
      const next = { ...completedPrescriptions, [activeItem.id]: true };
      setCompletedPrescriptions(next);
      try {
        localStorage.setItem('testament_psalm_completed', JSON.stringify(next));
      } catch {
        // ignore
      }
      onRewardXP?.(activeItem.xpReward);
      window.dispatchEvent(new CustomEvent('testament-psalm-applied'));
    }
  };

  const handleSwitchAmbience = (type: 'campfire' | 'wind' | 'sanctuary') => {
    soundEngine.playClick();
    onToggleAmbience?.(type);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/90 backdrop-blur-md overflow-y-auto overscroll-contain"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[94vh] bg-white dark:bg-ink border-0 sm:border border-amber-500/30 dark:border-amber-500/40 rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl overflow-hidden my-auto flex flex-col text-left transition-colors outline-none"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200/60 dark:border-stone-800 bg-stone-50 dark:bg-gradient-to-r dark:from-stone-900 dark:via-[#141824] dark:to-stone-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-800 dark:text-amber-400 shrink-0">
                <HeartHandshake className="w-5 h-5 text-amber-800 dark:text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-serif font-black text-stone-900 dark:text-parchment-50 leading-tight">
                    {t('medic.title')}
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 font-bold uppercase tracking-wider">
                    {t('medic.badge')}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-400">
                  {t('medic.desc')}
                </p>
              </div>
            </div>

            {/* Ambience & Close Controls */}
            <div className="flex items-center gap-2">
              {onToggleAmbience && (
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-950 p-1 rounded-xl border border-stone-250 dark:border-stone-800 text-xs">
                  <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 px-1.5 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-amber-800 dark:text-amber-500" />
                    <span className="hidden sm:inline">{t('medic.atmosphere')}</span>
                  </span>
                  <button
                    onClick={() => handleSwitchAmbience('wind')}
                    className={`px-2 py-1 rounded-lg transition-all text-xs flex items-center gap-1 ${
                      currentAmbience === 'wind' 
                        ? 'bg-amber-100 dark:bg-amber-600/30 text-amber-900 dark:text-amber-300 border border-amber-400 dark:border-amber-500/60 font-bold' 
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                    title={t('medic.wind')}
                  >
                    <Wind className="w-3 h-3" />
                    <span>{t('medic.wind')}</span>
                  </button>
                  <button
                    onClick={() => handleSwitchAmbience('campfire')}
                    className={`px-2 py-1 rounded-lg transition-all text-xs flex items-center gap-1 ${
                      currentAmbience === 'campfire' 
                        ? 'bg-amber-100 dark:bg-amber-600/30 text-amber-900 dark:text-amber-300 border border-amber-400 dark:border-amber-500/60 font-bold' 
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                    title={t('medic.fire')}
                  >
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span>{t('medic.fire')}</span>
                  </button>
                  <button
                    onClick={() => handleSwitchAmbience('sanctuary')}
                    className={`px-2 py-1 rounded-lg transition-all text-xs flex items-center gap-1 ${
                      currentAmbience === 'sanctuary' 
                        ? 'bg-amber-100 dark:bg-amber-600/30 text-amber-900 dark:text-amber-300 border border-amber-400 dark:border-amber-500/60 font-bold' 
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                    title={t('medic.sanctuary')}
                  >
                    <Music className="w-3 h-3 text-blue-500" />
                    <span>{t('medic.sanctuary')}</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 border border-stone-250 dark:border-stone-700 flex items-center justify-center text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Crisis Mood Triage Selector */}
          <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800/80 bg-stone-50 dark:bg-stone-950/70 shrink-0">
            <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-800 dark:text-amber-500" />
              <span>{t('medic.triage')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {(Object.keys(PSALM_MOODS) as PsalmCrisisMood[]).map((moodKey) => {
                const info = PSALM_MOODS[moodKey];
                const isSelected = selectedMood === moodKey;
                return (
                  <button
                    key={moodKey}
                    onClick={() => {
                      soundEngine.playSnap();
                      setSelectedMood(moodKey);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-400 dark:border-amber-500 text-stone-950 dark:text-parchment-50 ring-1 ring-amber-400 dark:ring-amber-500 shadow-sm'
                        : 'bg-white dark:bg-stone-900/90 border-stone-250 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-amber-300 dark:hover:border-stone-700 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    <span className="text-lg mb-1">{info.icon}</span>
                    <span className="text-xs font-semibold leading-tight line-clamp-2">
                      {getMoodLabel(moodKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Prescription Stage */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="max-w-3xl mx-auto space-y-5">
              
              {/* Active Prescription Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-stone-50 dark:bg-ink-raised border-2 border-amber-500/25 dark:border-amber-500/30 shadow-xl relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <span>{activeItem.moodIcon}</span>
                    <span>{t('medic.emergencyPrescription', { mood: getMoodLabel(activeItem.moodId) })}</span>
                  </span>
                  <span className="text-sm font-mono font-bold text-amber-800 dark:text-amber-500">
                    {activeItem.reference}
                  </span>
                </div>

                <h4 className="text-xl sm:text-2xl font-serif font-black text-stone-900 dark:text-parchment-50 mb-3">
                  {activeItem.title}
                </h4>

                {/* Symptom Check */}
                <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-stone-250 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 leading-relaxed mb-4 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-800 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono font-bold text-amber-800 dark:text-amber-400 uppercase text-[11px] block mb-0.5">
                      {t('medic.symptomAudit')}
                    </span>
                    <span>{activeItem.symptomCheck}</span>
                  </div>
                </div>

                {/* Scripture & Street Breakdown */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/40 relative mb-4">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-800 dark:text-amber-400 mb-2">
                    <span className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                      <span>{t('medic.scriptureUnderFire')}</span>
                    </span>
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setIsFormalMode(prev => !prev);
                      }}
                      className="text-[11px] underline text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-300"
                    >
                      {isFormalMode ? t('medic.viewStreet') : t('medic.viewFormal')}
                    </button>
                  </div>

                  <blockquote className="text-sm sm:text-base font-serif italic text-stone-900 dark:text-parchment-50 leading-relaxed mb-3">
                    "{isFormalMode ? activeItem.formalText : activeItem.streetTranslation}"
                  </blockquote>

                  {/* Cave Backstory */}
                  <div className="pt-3 border-t border-amber-200 dark:border-amber-900/40 flex items-start gap-2 text-xs text-stone-700 dark:text-amber-300/80">
                    <MapPin className="w-3.5 h-3.5 text-amber-800 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-900 dark:text-amber-300">{t('medic.whereDavidScreamed')}</strong>
                      <span>{activeItem.caveBackstory}</span>
                    </div>
                  </div>
                </div>

                {/* The 3-Step Field Medic Protocol */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                    {t('medic.threeStepProtocol')}
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {activeItem.fieldMedicSteps.map((step, idx) => {
                      const titles = [t('medic.step1'), t('medic.step2'), t('medic.step3')];
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-white dark:bg-stone-900/90 border border-stone-250 dark:border-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed flex items-start gap-3"
                        >
                          <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-mono font-bold text-amber-800 dark:text-amber-400 text-xs block mb-0.5">
                              {titles[idx]}
                            </span>
                            <span className="text-stone-700 dark:text-parchment-200">{step}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-5 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    {onOpenWordForge && (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onClose();
                          onOpenWordForge(activeItem.id);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-amber-800 dark:text-amber-400 border border-stone-250 dark:border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Brain className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                        <span>{t('medic.lockWordForge')}</span>
                      </button>
                    )}

                    {onSetMemoryVerse && (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onSetMemoryVerse(activeItem.id);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-amber-800 dark:text-amber-400 border border-stone-250 dark:border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                        <span>{t('medic.trainPulse')}</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleApplyPrescription}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all ml-auto"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('medic.applyPrescription', { xp: activeItem.xpReward })}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="p-3.5 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-ink flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 shrink-0">
            <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <span>{t('medic.footerCombat')}</span>
            </span>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold border border-stone-250 dark:border-stone-700"
            >
              {t('medic.exit')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
