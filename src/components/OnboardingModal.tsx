import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  Brain, 
  BookOpen, 
  X
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';
import { useI18n, type MessageKey } from '../i18n';
import confetti from 'canvas-confetti';

export interface UserCalibrationProfile {
  battleId: string;
  battleTitle: string;
  recommendedQuestId: string;
  learningStyle: 'visual' | 'audio' | 'tactical' | 'plain';
  familiarity: 'new' | 'disconnected' | 'sharp';
  dailyCadence: '3min' | '10min' | 'deep';
  completedAt: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserCalibrationProfile, startRecommendedQuest?: boolean, openTour?: boolean) => void;
  onClose: () => void;
  initialProfile?: UserCalibrationProfile | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  initialProfile
}) => {
  const modalRef = useModalLock(isOpen);
  const { t } = useI18n();
  const [step, setStep] = useState<number>(1);
  const [battle, setBattle] = useState<string>(initialProfile?.battleId || 'responsibility');
  const [learningStyle, setLearningStyle] = useState<'visual' | 'audio' | 'tactical' | 'plain'>(initialProfile?.learningStyle || 'visual');
  const [familiarity, setFamiliarity] = useState<'new' | 'disconnected' | 'sharp'>(initialProfile?.familiarity || 'new');
  const [dailyCadence, setDailyCadence] = useState<'3min' | '10min' | 'deep'>(initialProfile?.dailyCadence || '10min');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // BATTLES DEFINITION
  const BATTLES = [
    { id: 'responsibility', recommendedQuestId: 'david-journey', icon: '🛡️' },
    { id: 'betrayal', recommendedQuestId: 'joseph-journey', icon: '🔥' },
    { id: 'regret', recommendedQuestId: 'peter-journey', icon: '⚔️' },
    { id: 'purpose', recommendedQuestId: 'moses-journey', icon: '🧭' },
    { id: 'discipline', recommendedQuestId: 'elijah-journey', icon: '⚡' },
  ].map((battle) => ({
    ...battle,
    title: t(`battle.${battle.id}.title` as MessageKey),
    desc: t(`battle.${battle.id}.desc` as MessageKey),
    questTitle: t(`battle.${battle.id}.quest` as MessageKey),
    primaryVerse: t(`battle.${battle.id}.verse` as MessageKey),
  }));

  const LEARNING_STYLES = (['visual', 'audio', 'tactical', 'plain'] as const).map((id) => ({
    id,
    title: t(`style.${id}.title` as MessageKey),
    desc: t(`style.${id}.desc` as MessageKey),
    icon: id === 'visual' ? '🎬' : id === 'audio' ? '🎧' : id === 'tactical' ? '🧠' : '🔍',
  }));

  const FAMILIARITIES = (['new', 'disconnected', 'sharp'] as const).map((id) => ({
    id,
    title: t(`familiar.${id}.title` as MessageKey),
    desc: t(`familiar.${id}.desc` as MessageKey),
    tag: t(`familiar.${id}.tag` as MessageKey),
  }));

  const CADENCES = [
    { id: '3min' as const, title: t('cadence.3'), desc: t('cadence.3.desc'), icon: '☕' },
    { id: '10min' as const, title: t('cadence.10'), desc: t('cadence.10.desc'), icon: '⏱️' },
    { id: 'deep' as const, title: t('cadence.deep'), desc: t('cadence.deep.desc'), icon: '🛡️' },
  ];

  const selectedBattleObj = BATTLES.find(b => b.id === battle) || BATTLES[0];

  const handleNextStep = () => {
    soundEngine.playSnap();
    if (step === 4) {
      // Reached reveal
      soundEngine.playVictory();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ea580c', '#fbbf24', '#10b981']
      });
      setStep(5);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    soundEngine.playClick();
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleFinishCalibration = (startQuest: boolean, openTour: boolean = false) => {
    soundEngine.playVictory();
    const profile: UserCalibrationProfile = {
      battleId: selectedBattleObj.id,
      battleTitle: selectedBattleObj.title,
      recommendedQuestId: selectedBattleObj.recommendedQuestId,
      learningStyle,
      familiarity,
      dailyCadence,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem('testament_user_profile', JSON.stringify(profile));
    localStorage.setItem('testament_onboarding_completed', 'true');
    onComplete(profile, startQuest, openTour);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 dark:bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <motion.div 
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-white dark:bg-ink-raised border-2 border-amber-400 dark:border-amber-600/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] outline-none"
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-ink-overlay flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-amber-500/60 shadow-md bg-stone-100 dark:bg-stone-950 shrink-0">
              <img 
                src="/icons/icon-192.png" 
                alt={t('onboard.emblem')} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="onboarding-modal-title" className="text-sm sm:text-base font-serif font-bold text-stone-900 dark:text-parchment-50">
                  {t('onboard.title')}
                </h3>
                <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
                  {step < 5 ? t('onboard.step', { step }) : t('onboard.ready')}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {t('onboard.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                try {
                  localStorage.setItem('testament_onboarding_completed', 'true');
                } catch {
                  // ignore
                }
                onClose();
              }}
              className="text-xs text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors px-2.5 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {t('onboard.skip')}
            </button>
            <button
              onClick={onClose}
              aria-label={t('onboard.close')}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
              title={t('pwa.close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-stone-200 dark:bg-stone-900 h-1.5 flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s} 
              className={`h-full flex-1 transition-all duration-300 ${
                s <= step ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-stone-200 dark:bg-stone-850'
              }`}
            />
          ))}
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5 text-left">
          
          {/* STEP 1: CURRENT LIFE BATTLE */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-500 mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{t('onboard.front')}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-parchment-50">
                  {t('onboard.battleQ')}
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {t('onboard.battleHelp')}
                </p>
              </div>

              <div className="space-y-2.5">
                {BATTLES.map((b) => {
                  const isSelected = battle === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        soundEngine.playSnap();
                        setBattle(b.id);
                      }}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isSelected 
                          ? 'bg-amber-50 dark:bg-gradient-to-r dark:from-amber-950/50 dark:to-stone-900 border-amber-500 shadow-sm dark:shadow-glow ring-1 ring-amber-500/50 text-stone-950 dark:text-parchment-50' 
                          : 'bg-stone-50 dark:bg-stone-900/70 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-850/60'
                      }`}
                    >
                      <span className="text-2xl mt-0.5 shrink-0">{b.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-stone-900 dark:text-parchment-100">{b.title}</h4>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
                            isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'border border-stone-300 dark:border-stone-700'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </div>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">{b.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: COGNITIVE LEARNING STYLE */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-500 mb-1">
                  <Brain className="w-3.5 h-3.5" />
                  <span>{t('onboard.cognitive')}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-parchment-50">
                  {t('onboard.styleQ')}
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {t('onboard.styleHelp')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LEARNING_STYLES.map((ls) => {
                  const isSelected = learningStyle === ls.id;
                  return (
                    <button
                      key={ls.id}
                      onClick={() => {
                        soundEngine.playSnap();
                        setLearningStyle(ls.id);
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm ring-1 ring-amber-500/50 text-stone-950 dark:text-parchment-50' 
                          : 'bg-stone-50 dark:bg-stone-900/70 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-850/60'
                      }`}
                    >
                      <div>
                        <div className="text-2xl mb-2">{ls.icon}</div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-parchment-100">{ls.title}</h4>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">{ls.desc}</p>
                      </div>
                      <div className="mt-3 pt-2 flex items-center justify-end">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[11px] ${
                          isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'border border-stone-300 dark:border-stone-700'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SCRIPTURE FAMILIARITY */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-500 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t('onboard.familiar')}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-parchment-50">
                  {t('onboard.startQ')}
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {t('onboard.startHelp')}
                </p>
              </div>

              <div className="space-y-3">
                {FAMILIARITIES.map((fam) => {
                  const isSelected = familiarity === fam.id;
                  return (
                    <button
                      key={fam.id}
                      onClick={() => {
                        soundEngine.playSnap();
                        setFamiliarity(fam.id);
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isSelected 
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50 text-stone-950 dark:text-parchment-50' 
                          : 'bg-stone-50 dark:bg-stone-900/70 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-850/60'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-stone-900 dark:text-parchment-100">{fam.title}</h4>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-amber-800 dark:text-amber-400 border border-stone-200 dark:border-stone-700">
                            {fam.tag}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{fam.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full mt-1 flex items-center justify-center text-[11px] shrink-0 ${
                        isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'border border-stone-300 dark:border-stone-700'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: DAILY CADENCE */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-500 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t('onboard.commit')}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-parchment-50">
                  {t('onboard.timeQ')}
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {t('onboard.timeHelp')}
                </p>
              </div>

              <div className="space-y-3">
                {CADENCES.map((cad) => {
                  const isSelected = dailyCadence === cad.id;
                  return (
                    <button
                      key={cad.id}
                      onClick={() => {
                        soundEngine.playSnap();
                        setDailyCadence(cad.id);
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                        isSelected 
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50 text-stone-950 dark:text-parchment-50' 
                          : 'bg-stone-50 dark:bg-stone-900/70 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-850/60'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{cad.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-stone-900 dark:text-parchment-100">{cad.title}</h4>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">{cad.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
                        isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'border border-stone-300 dark:border-stone-700'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: PERSONALIZED BATTLE PLAN REVEAL */}
          {step === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center py-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600/50 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold mb-3 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('onboard.done')}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-900 dark:text-parchment-50">
                  {t('onboard.planTitle')}
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-md mx-auto">
                  {t('onboard.planHelp')}
                </p>
              </div>

              {/* Recommendation Card */}
              <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-gradient-to-br dark:from-[#1a1713] dark:to-[#101217] border-2 border-amber-400 dark:border-amber-500/70 shadow-sm dark:shadow-glow space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-amber-200 dark:border-amber-900/40 pb-3">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                      {t('onboard.recommended')}
                    </div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-100 mt-0.5">
                      {selectedBattleObj.questTitle}
                    </h3>
                  </div>
                  <span className="text-3xl shrink-0">{selectedBattleObj.icon}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-stone-700 dark:text-stone-300">
                    <strong className="text-amber-800 dark:text-amber-400">{t('onboard.targeting')} </strong>
                    {selectedBattleObj.title}
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-stone-900/80 border border-amber-200 dark:border-stone-800 text-stone-800 dark:text-parchment-200 italic shadow-xs">
                    <strong className="text-amber-800 dark:text-amber-300 not-italic">{t('onboard.verse')} </strong>
                    "{selectedBattleObj.primaryVerse}"
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-stone-600 dark:text-stone-400 font-mono">
                    <div>
                      <span className="text-stone-500">{t('onboard.mode')} </span>
                      <span className="text-amber-800 dark:text-amber-300 font-bold uppercase">{t(`style.${learningStyle}.title` as MessageKey)}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">{t('onboard.cadence')} </span>
                      <span className="text-amber-800 dark:text-amber-300 font-bold">{dailyCadence === '3min' ? t('cadence.3') : dailyCadence === '10min' ? t('cadence.10') : t('cadence.deep')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={() => handleFinishCalibration(false, false)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>{t('onboard.startMission')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => handleFinishCalibration(true, false)}
                  className="w-full py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <span>{t('onboard.jump')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation (Steps 1 to 4) */}
        {step < 5 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-ink-raised flex items-center justify-between">
            <button
              onClick={handlePrevStep}
              disabled={step === 1}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                step === 1 ? 'opacity-30 cursor-not-allowed text-stone-400 dark:text-stone-600' : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('onboard.back')}</span>
            </button>

            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              <span>{step === 4 ? t('onboard.build') : t('onboard.continue')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
