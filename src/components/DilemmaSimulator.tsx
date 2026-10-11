import React, { useState, useRef, useEffect } from 'react';
import { REAL_LIFE_DILEMMAS } from '../data/dilemmas';
import type { RealLifeDilemma } from '../data/dilemmas';
import type { HeartEvaluationResult, TemperamentProfile } from '../utils/heartEvaluation';
import { soundEngine } from '../utils/audio';
import { getDailyDilemma, getTodayDateKey } from '../utils/dailyEngine';
import { getDynamicDailyDilemma, evaluateUserPlayWithGemini, evaluateSocraticTurn2WithGemini } from '../utils/geminiDilemmaService';
import { isFeatureEnabled } from '../config/featureFlags';
import { generateSocraticFollowUp, generateAgeAwareDilemma } from '../utils/geminiFeatures';
import confetti from 'canvas-confetti';
import { TacticalNexusCard } from './TacticalNexusCard';
import { 
  ShieldAlert, 
  ArrowRight, 
  Award, 
  Volume2, 
  Sparkles, 
  Flame, 
  Shield, 
  CheckCircle2, 
  RotateCcw, 
  PenTool, 
  BookOpen,
  Filter,
  ChevronDown,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { getLocalizedDilemma } from '../utils/localizedScripture';

interface DilemmaSimulatorProps {
  onRewardXP: (amount: number) => void;
  targetDilemmaId?: string | null;
  onClearTargetDilemma?: () => void;
  onOpenNexus?: (type: string, id: string) => void;
}

export const DilemmaSimulator: React.FC<DilemmaSimulatorProps> = ({ 
  onRewardXP,
  targetDilemmaId,
  onClearTargetDilemma,
  onOpenNexus
}) => {
  const { t, language } = useLanguage();
  const dailyDilemma = getDailyDilemma(0, language);
  const [dynamicDilemma, setDynamicDilemma] = useState<RealLifeDilemma>(() => {
    try {
      const todayKey = getTodayDateKey();
      const cached = localStorage.getItem(`testament_gemini_dilemma_${todayKey}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id) return parsed;
      }
    } catch {
      // ignore
    }
    return dailyDilemma;
  });

  const [selectedDilemmaId, setSelectedDilemmaId] = useState<string>(() => {
    return targetDilemmaId || dynamicDilemma.id || dailyDilemma.id;
  });

  React.useEffect(() => {
    let cancelled = false;
    getDynamicDailyDilemma(dailyDilemma).then((res) => {
      if (!cancelled && res && res.id) {
        setDynamicDilemma(res);
        if (!targetDilemmaId && (selectedDilemmaId === dailyDilemma.id || selectedDilemmaId.startsWith('gemini-'))) {
          setSelectedDilemmaId(res.id);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [language]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeMode, setActiveMode] = useState<'heart_check' | 'playbook'>('heart_check');
  const [isCampaignFocus, setIsCampaignFocus] = useState<boolean>(() => !!targetDilemmaId);
  
  // Heart Check interactive state
  const [userText, setUserText] = useState<string>('');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<HeartEvaluationResult | null>(null);
  const [isSpeakingScripture, setIsSpeakingScripture] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isEvaluatingTurn2, setIsEvaluatingTurn2] = useState<boolean>(false);

  // Persistence
  const [completedDilemmas, setCompletedDilemmas] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('testament_completed_dilemmas');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Playbook mode state
  const [revealedPlayId, setRevealedPlayId] = useState<string | null>(null);
  const [prevTargetDilemmaId, setPrevTargetDilemmaId] = useState<string | null | undefined>(targetDilemmaId);

  // Multi-Turn Socratic AI state
  const [turn2Text, setTurn2Text] = useState<string>('');
  const [turn2Feedback, setTurn2Feedback] = useState<string | null>(null);
  const [temperamentProfile, setTemperamentProfile] = useState<TemperamentProfile | null>(null);
  const [activeEvalTab, setActiveEvalTab] = useState<'diagnosis' | 'playbook'>('diagnosis');
  const [isTurn2Expanded, setIsTurn2Expanded] = useState<boolean>(false);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState<boolean>(false);

  // Feature 5: Age-Aware Dilemma Variant state
  const [currentStage, setCurrentStage] = useState<string>('standard');
  const [currentStageLabel, setCurrentStageLabel] = useState<string>('Standard');
  const [adaptedTitle, setAdaptedTitle] = useState<string | null>(null);
  const [adaptedScenario, setAdaptedScenario] = useState<string | null>(null);
  const [isAdaptingStage, setIsAdaptingStage] = useState<boolean>(false);

  // Load saved answers for the current dilemma on mount or when switching
  React.useEffect(() => {
    setIsAnalysisExpanded(false);
    setCurrentStage('standard');
    setCurrentStageLabel('Standard');
    setAdaptedTitle(null);
    setAdaptedScenario(null);
    setIsAdaptingStage(false);
    try {
      const stored = localStorage.getItem('testament_dilemma_answers');
      if (stored) {
        const answers = JSON.parse(stored);
        if (answers[selectedDilemmaId]) {
          setUserText(answers[selectedDilemmaId].userText || '');
          setSelectedFeeling(answers[selectedDilemmaId].selectedFeeling || null);
          setEvaluationResult(answers[selectedDilemmaId].evaluationResult || null);
          setTurn2Text(answers[selectedDilemmaId].turn2Text || '');
          setTurn2Feedback(answers[selectedDilemmaId].turn2Feedback || null);
          setTemperamentProfile(answers[selectedDilemmaId].temperamentProfile || null);
          return;
        }
      }
    } catch {
      // ignore
    }
    setUserText('');
    setSelectedFeeling(null);
    setEvaluationResult(null);
    setTurn2Text('');
    setTurn2Feedback(null);
    setTemperamentProfile(null);
    setActiveEvalTab('diagnosis');
    setIsTurn2Expanded(false);
  }, [selectedDilemmaId]);

  if (targetDilemmaId && targetDilemmaId !== prevTargetDilemmaId) {
    setPrevTargetDilemmaId(targetDilemmaId);
    setSelectedDilemmaId(targetDilemmaId);
    setIsCampaignFocus(true);
    setSelectedCategory('All');
    setRevealedPlayId(null);
    if (onClearTargetDilemma) {
      onClearTargetDilemma();
    }
  }

  const categories = [
    'All',
    'Workplace & Ambition',
    'Family & Relationships',
    'Stress & Burnout',
    'Betrayal & Integrity'
  ];

  const allAvailableDilemmas: RealLifeDilemma[] = [
    ...(dynamicDilemma.id.startsWith('gemini-') && !REAL_LIFE_DILEMMAS.some(d => d.id === dynamicDilemma.id) ? [dynamicDilemma] : []),
    ...REAL_LIFE_DILEMMAS
  ];

  const filteredDilemmas = allAvailableDilemmas.filter(d => 
    selectedCategory === 'All' || d.category === selectedCategory
  ).map(d => getLocalizedDilemma(d, language));

  const rawDilemma: RealLifeDilemma = allAvailableDilemmas.find(d => d.id === selectedDilemmaId) || dynamicDilemma || dailyDilemma;
  const dilemma: RealLifeDilemma = getLocalizedDilemma(rawDilemma, language);

  // Reset inputs when switching dilemmas
  const handleSelectDilemma = (dilemmaId: string) => {
    soundEngine.stopSpeaking();
    setIsSpeakingScripture(false);
    soundEngine.playClick();
    setSelectedDilemmaId(dilemmaId);
    setRevealedPlayId(null);
  };

  // Stop audio on unmount
  React.useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, []);

  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  const dispatchedDilemmasRef = useRef<Set<string>>(new Set());

  // Trigger campaign next task prompt ONLY when user scrolls down to the bottom of the evaluated dilemma
  useEffect(() => {
    if (!evaluationResult) return;

    const checkAndDispatch = () => {
      if (dispatchedDilemmasRef.current.has(dilemma.id)) return;
      if (bottomSentinelRef.current) {
        const rect = bottomSentinelRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight + 50 && rect.bottom >= 0) {
          dispatchedDilemmasRef.current.add(dilemma.id);
          window.dispatchEvent(
            new CustomEvent('testament-dilemma-completed', { detail: { dilemmaId: dilemma.id } })
          );
        }
      }
    };

    const sentinel = bottomSentinelRef.current;
    let observer: IntersectionObserver | null = null;

    if (sentinel && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry && entry.isIntersecting) {
            checkAndDispatch();
          }
        },
        {
          root: null,
          rootMargin: '0px 0px 50px 0px',
          threshold: 0.1,
        }
      );
      observer.observe(sentinel);
    }

    window.addEventListener('scroll', checkAndDispatch, { passive: true });

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', checkAndDispatch);
    };
  }, [evaluationResult, dilemma.id]);

  const handleSelectLifeStage = async (stageId: string, stageLabel: string) => {
    soundEngine.playSnap();
    if (stageId === currentStage || isAdaptingStage) return;
    setCurrentStage(stageId);
    setCurrentStageLabel(stageLabel);

    if (stageId === 'standard') {
      setAdaptedTitle(null);
      setAdaptedScenario(null);
      return;
    }

    setIsAdaptingStage(true);
    try {
      const res = await generateAgeAwareDilemma({
        originalTitle: dilemma.title,
        scenarioText: dilemma.situationSetup,
        options: dilemma.plays ? dilemma.plays.map(p => p.name) : ['Furious / Want Payback', 'Walk Away / Ghost', 'Shut Down / Bottle It', 'Calm & Strategic'],
        targetStage: stageLabel
      });
      setAdaptedTitle(res.adaptedTitle);
      setAdaptedScenario(res.adaptedScenario);
    } catch (err) {
      console.warn('Failed to adapt dilemma stage:', err);
    } finally {
      setIsAdaptingStage(false);
    }
  };

  const handleQuickFeelingSelect = (feeling: string) => {
    soundEngine.playSnap();
    setSelectedFeeling(prev => prev === feeling ? null : feeling);
  };

  const handleSubmitHeartCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!userText.trim() && !selectedFeeling) || isEvaluating) return;

    soundEngine.playSnap();
    setIsEvaluating(true);

    try {
      const result = await evaluateUserPlayWithGemini(userText, selectedFeeling, dilemma);
      if (isFeatureEnabled('socraticFollowUp')) {
        try {
          const socraticQ = await generateSocraticFollowUp({
            scenarioTitle: adaptedTitle || dilemma.title,
            chosenReaction: selectedFeeling || 'neutral',
            userText: userText.trim() || undefined,
            ageOrStage: currentStageLabel || 'Adult'
          });
          if (socraticQ) {
            result.socraticChallenge = socraticQ;
          }
        } catch (err) {
          console.warn('Failed to generate adaptive Socratic follow-up:', err);
        }
      }
      setEvaluationResult(result);

      // Save user's answer and evaluation so it's preserved on review (Requirement 3 & 4)
      try {
        const stored = localStorage.getItem('testament_dilemma_answers');
        const answers = stored ? JSON.parse(stored) : {};
        answers[dilemma.id] = { userText, selectedFeeling, evaluationResult: result };
        localStorage.setItem('testament_dilemma_answers', JSON.stringify(answers));
      } catch (err) {
        console.warn('Failed to save dilemma answer', err);
      }

      if (!completedDilemmas.includes(dilemma.id)) {
        soundEngine.playVictory();
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#f59e0b', '#10b981', '#6366f1']
        });
        const updated = [...completedDilemmas, dilemma.id];
        setCompletedDilemmas(updated);
        localStorage.setItem('testament_completed_dilemmas', JSON.stringify(updated));
        onRewardXP(50);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmitSocraticTurn2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turn2Text.trim() || isEvaluatingTurn2) return;

    soundEngine.playSnap();
    setIsEvaluatingTurn2(true);

    try {
      const { followUpFeedback, temperament } = await evaluateSocraticTurn2WithGemini(userText, turn2Text, dilemma);
      setTurn2Feedback(followUpFeedback);
      setTemperamentProfile(temperament);

      const alreadyRewarded = (() => {
        try {
          const stored = localStorage.getItem('testament_dilemma_answers');
          const answers = stored ? JSON.parse(stored) : {};
          return Boolean(answers[dilemma.id]?.turn2Rewarded);
        } catch {
          return false;
        }
      })();

      try {
        const stored = localStorage.getItem('testament_dilemma_answers');
        const answers = stored ? JSON.parse(stored) : {};
        answers[dilemma.id] = {
          ...(answers[dilemma.id] || {}),
          userText,
          selectedFeeling,
          evaluationResult,
          turn2Text,
          turn2Feedback: followUpFeedback,
          temperamentProfile: temperament,
          turn2Rewarded: true
        };
        localStorage.setItem('testament_dilemma_answers', JSON.stringify(answers));
      } catch (err) {
        console.warn('Failed to save turn 2 answer', err);
      }

      soundEngine.playVictory();
      if (!alreadyRewarded) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#fbbf24', '#34d399']
        });
        onRewardXP(40);
      }
    } finally {
      setIsEvaluatingTurn2(false);
    }
  };

  const handleSpeakScripture = () => {
    if (isSpeakingScripture) {
      soundEngine.stopSpeaking();
      setIsSpeakingScripture(false);
      return;
    }

    setIsSpeakingScripture(true);
    const audioText = `${dilemma.anchorScripture.reference}. ${dilemma.anchorScripture.text}. The takeaway: ${dilemma.anchorScripture.streetMeaning}`;
    soundEngine.speakVerse(audioText, () => {
      setIsSpeakingScripture(false);
    });
  };

  const handleSelectPlaybookCard = (playId: string, _isRecommended: boolean) => {
    soundEngine.playSnap();
    setRevealedPlayId(playId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-2 md:pb-6 text-left">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-500 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>{t('dilemma.badge')}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-black text-stone-900 dark:text-parchment-50">
            {t('dilemma.title')}
          </h1>
          <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
            {t('dilemma.subtitle')}
          </p>
        </div>

        {/* Mobile Quick Controls */}
        <div className="flex md:hidden items-center gap-1.5">
          <LanguageToggle compact />
          <ThemeToggle compact />
        </div>
      </div>

      {/* Category Filter Pills & Single Campaign Dilemma Focus (Requirement 6) */}
      {isCampaignFocus ? (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 mb-6 transition-colors">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎯</span>
            <div>
              <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                {t('dilemma.campaignFocus')}
              </span>
              <span className="text-xs text-stone-600 dark:text-stone-400">
                {t('dilemma.campaignFocusSub')}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCampaignFocus(false)}
            className="text-xs text-amber-800 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 underline underline-offset-2 transition-colors font-semibold"
          >
            {t('dilemma.browseAll')}
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label={t('dilemma.category')}>
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 flex items-center gap-1 pl-1">
                <Filter className="w-3 h-3 text-amber-800 dark:text-amber-500" /> {t('dilemma.category')}
              </span>
              {categories.map(cat => {
                const catLabel = cat === 'All' ? t('dilemma.catAll')
                  : cat === 'Workplace & Ambition' ? t('dilemma.catWorkplace')
                  : cat === 'Family & Relationships' ? t('dilemma.catFamily')
                  : cat === 'Stress & Burnout' ? t('dilemma.catStress')
                  : cat === 'Betrayal & Integrity' ? t('dilemma.catBetrayal')
                  : cat;

                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={selectedCategory === cat}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedCategory(cat);
                      const firstInCat = REAL_LIFE_DILEMMAS.find(d => cat === 'All' || d.category === cat);
                      if (firstInCat) handleSelectDilemma(firstInCat.id);
                    }}
                    className={`text-xs px-3.5 py-2 rounded-full font-medium whitespace-nowrap min-h-[44px] flex items-center transition-all focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                        : 'bg-stone-200/50 dark:bg-stone-900/80 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    {catLabel} {cat === 'All' ? `(${REAL_LIFE_DILEMMAS.length})` : ''}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                handleSelectDilemma(dailyDilemma.id);
                setIsCampaignFocus(true);
              }}
              className="text-xs font-mono text-amber-800 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-bold shrink-0 ml-auto pb-2"
            >
              {t('dilemma.focusCampaign')}
            </button>
          </div>

          {/* Scenario Horizontal Selector */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {filteredDilemmas.map(d => {
              const isSelected = dilemma.id === d.id;
              const isDone = completedDilemmas.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => handleSelectDilemma(d.id)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : 'bg-stone-200/50 hover:bg-stone-200 dark:bg-stone-900/70 dark:hover:bg-stone-850 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  {d.id === dailyDilemma.id && <span className="text-amber-800 dark:text-amber-400 text-xs shrink-0" title="Today's Featured Scenario">★</span>}
                  <span>{d.title}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Main Dilemma Briefing Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-stone-100/70 dark:bg-stone-900/50 mb-6 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              {dilemma.category}
            </span>
            {dilemma.id === getDailyDilemma().id && (
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-800 dark:text-amber-400" />
                <span>{t('dilemma.todayDilemma')}</span>
              </span>
            )}
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              {t('dilemma.scenarioCount', { index: REAL_LIFE_DILEMMAS.findIndex(x => x.id === dilemma.id) + 1, total: REAL_LIFE_DILEMMAS.length })}
            </span>
          </div>

          {completedDilemmas.includes(dilemma.id) && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full">
              <Award className="w-3.5 h-3.5" />
              <span>{t('dilemma.completedXp')}</span>
            </span>
          )}
        </div>

        <h2 className="text-xl md:text-3xl font-serif font-black text-stone-900 dark:text-parchment-50 mb-2">
          {adaptedTitle || dilemma.title}
        </h2>

        {/* FEATURE 5: Age-Aware Dilemma Variant Selector */}
        {isFeatureEnabled('ageAwareDilemmas') && (
          <div className="mb-3.5 flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-stone-200/50 dark:bg-stone-950/50 border border-stone-200/80 dark:border-stone-800">
            <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 font-semibold pl-1">
              Adapt for life stage:
            </span>
            {[
              { id: 'standard', label: 'Standard' },
              { id: 'student', label: 'Student / School' },
              { id: 'workplace', label: 'Workplace / Career' },
              { id: 'family', label: 'Family / Home' }
            ].map(stage => (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleSelectLifeStage(stage.id, stage.label)}
                disabled={isAdaptingStage}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentStage === stage.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-200'
                }`}
              >
                {stage.label}
              </button>
            ))}
            {isAdaptingStage && (
              <span className="text-[11px] text-amber-800 dark:text-amber-400 font-mono animate-pulse ml-1">
                Adapting…
              </span>
            )}
          </div>
        )}

        {/* The Situation */}
        <div className="p-4 rounded-xl bg-white/80 dark:bg-stone-950/70 text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-reading mb-4">
          <div className="flex items-center justify-between mb-1">
            <strong className="text-amber-800 dark:text-amber-400 font-sans font-bold text-xs uppercase tracking-wider">
              {t('dilemma.incident')}
            </strong>
            {adaptedScenario && currentStage !== 'standard' && (
              <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30">
                ✨ Adapted for {currentStageLabel} (AI Reflection)
              </span>
            )}
          </div>
          {adaptedScenario || dilemma.situationSetup}
        </div>

        {/* Stakes & Ancient Parallel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white/80 dark:bg-stone-950/60">
            <span className="text-stone-600 dark:text-stone-400 font-bold block mb-1">{t('dilemma.whatsAtStake')}</span>
            <p className="text-stone-700 dark:text-stone-300">{dilemma.whatIsAtStake}</p>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10">
            <span className="text-amber-800 dark:text-amber-400 font-bold block mb-1">
              {t('dilemma.ancientPrecedent', { hero: dilemma.biblicalParallel.hero })}
            </span>
            <p className="text-amber-950/90 dark:text-amber-200/90">{dilemma.biblicalParallel.event}</p>
          </div>
        </div>
      </div>

      {/* Simulator Mode Tabs */}
      <div className="flex items-center gap-3 mb-6 p-1 bg-stone-200/50 dark:bg-stone-900/90 rounded-2xl max-w-md">
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveMode('heart_check');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'heart_check'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>{t('dilemma.heartCheck')}</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveMode('playbook');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'playbook'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('dilemma.kingsPlaybook')}</span>
        </button>
      </div>

      {/* MODE 1: HEART CHECK (FREE TEXT ANSWER) */}
      {activeMode === 'heart_check' && (
        <div className="space-y-6">
          {/* Question / Input Form */}
          <form onSubmit={handleSubmitHeartCheck} className="p-5 sm:p-6 rounded-2xl bg-stone-100/70 dark:bg-stone-900/50 transition-colors">
            <div className="mb-4">
              <h3 className="text-base md:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                <span>{t('dilemma.whatWouldYouDo')}</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                {t('dilemma.authenticPrompt')}
              </p>
            </div>

            {/* Quick Feeling Selector */}
            <div className="mb-4">
              <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2">
                {t('dilemma.gutReactionLabel')}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'Furious / Want Payback', label: t('dilemma.reactionFurious'), color: 'border-red-300 dark:border-red-600/60 bg-red-100/70 dark:bg-red-950/40 text-red-800 dark:text-red-300' },
                  { value: 'Walk Away / Ghost', label: t('dilemma.reactionWalkAway'), color: 'border-amber-300 dark:border-amber-600/60 bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' },
                  { value: 'Shut Down / Bottle It', label: t('dilemma.reactionShutDown'), color: 'border-blue-300 dark:border-blue-600/60 bg-blue-100/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300' },
                  { value: 'Panicking / Tempted', label: t('dilemma.reactionPanicking'), color: 'border-purple-300 dark:border-purple-600/60 bg-purple-100/70 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300' },
                  { value: 'Calm & Strategic', label: t('dilemma.reactionCalm'), color: 'border-emerald-300 dark:border-emerald-600/60 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' }
                ].map(feeling => (
                  <button
                    type="button"
                    key={feeling.value}
                    onClick={() => handleQuickFeelingSelect(feeling.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      selectedFeeling === feeling.value
                        ? `${feeling.color} ring-2 ring-amber-500 font-bold scale-105 shadow-xs`
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    {feeling.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Freeform Textarea */}
            <div className="mb-4">
              <label htmlFor="gut-reaction-input" className="sr-only">
                {t('dilemma.whatWouldYouDo')}
              </label>
              <textarea
                id="gut-reaction-input"
                value={userText}
                onChange={e => setUserText(e.target.value)}
                placeholder={t('dilemma.placeholder')}
                rows={4}
                className="w-full p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500 transition-all font-sans leading-relaxed shadow-inner"
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <span className="text-xs text-stone-600 dark:text-stone-400 font-mono">
                {selectedFeeling && userText.trim()
                  ? `✓ Gut reaction (${selectedFeeling}) & ${userText.length} chars typed`
                  : selectedFeeling
                  ? `✓ Gut reaction selected: ${selectedFeeling}`
                  : userText.trim()
                  ? `✓ ${userText.length} characters typed`
                  : 'To submit: pick a gut reaction above or type one sentence'}
              </span>

              <div className="flex flex-col items-end gap-1">
                <button
                  type="submit"
                  disabled={(!userText.trim() && !selectedFeeling) || isEvaluating}
                  className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isEvaluating
                      ? 'bg-amber-500/80 text-stone-950 cursor-wait animate-pulse'
                      : userText.trim() || selectedFeeling
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm cursor-pointer font-extrabold'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed'
                  }`}
                >
                  {isEvaluating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-stone-950" />
                      <span>Discerning in Scripture...</span>
                    </>
                  ) : (
                    <>
                      <span>{t('dilemma.submitPlay')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                {!userText.trim() && !selectedFeeling && (
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    Pick a gut reaction above or type your thoughts to continue
                  </span>
                )}
              </div>
            </div>
          </form>


          {/* Heart Check Evaluation Results Card */}
          {evaluationResult && (
            <div className="p-5 md:p-8 rounded-2xl bg-stone-100/70 dark:bg-stone-900/50 space-y-6 transition-colors">
              {/* EVALUATION TABS: Pastoral Diagnosis vs Tactical Playbook */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-stone-200/80 dark:bg-stone-950 border border-stone-300/60 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setActiveEvalTab('diagnosis')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeEvalTab === 'diagnosis'
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pastoral Diagnosis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEvalTab('playbook')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeEvalTab === 'playbook'
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Scripture Guidance</span>
                </button>
              </div>

              {/* TAB 1: PASTORAL DIAGNOSIS */}
              {activeEvalTab === 'diagnosis' && (
                <div className="space-y-6">
                  {/* Stance Badge & Motivation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-amber-800 dark:text-amber-400 uppercase tracking-widest font-bold">
                    {t('dilemma.diagnosticCheck')}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${evaluationResult.badgeColor}`}>
                    {evaluationResult.stanceTitle}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-parchment-50">
                  {t('dilemma.whereHeartDriving')}
                </h3>
                <p className="text-xs md:text-sm text-stone-700 dark:text-stone-300 mt-1 italic">
                  "{evaluationResult.coreMotive}"
                </p>
              </div>

              {/* Dynamic Analysis of User's Typed Words (Collapsible for M-11) */}
              {evaluationResult.userWordsAnalysis && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-200/60 dark:border-stone-800/60">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        {t('dilemma.analysisProposed')}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
                        Tactic: {evaluationResult.userWordsAnalysis.primaryTactic}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                        {evaluationResult.userWordsAnalysis.detectedTone}
                      </span>
                    </div>
                  </div>

                  {/* Summary & Collapsible Toggle (M-11) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3">
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans line-clamp-2 sm:line-clamp-none">
                      {evaluationResult.userWordsAnalysis.userQuoteSummary
                        ? evaluationResult.userWordsAnalysis.userQuoteSummary
                        : `Your response was classified as "${evaluationResult.stanceTitle}".`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAnalysisExpanded(prev => !prev)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 transition-colors shrink-0 self-start sm:self-center"
                    >
                      <span>{isAnalysisExpanded ? 'Hide full analysis' : 'Read full analysis'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAnalysisExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Expanded Full Analysis Section */}
                  {isAnalysisExpanded && (
                    <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 space-y-4 animate-fadeIn">
                      {evaluationResult.userWordsAnalysis.userQuoteSummary && (
                        <div className="px-3 py-2 rounded-xl bg-white/80 dark:bg-black/30 text-xs text-stone-700 dark:text-stone-300">
                          <span className="text-stone-500 dark:text-stone-400 text-xs font-mono uppercase tracking-wider block mb-0.5">Your Response:</span>
                          <span className="text-amber-800 dark:text-amber-200 italic font-reading">{evaluationResult.userWordsAnalysis.userQuoteSummary}</span>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
                        {evaluationResult.directAnswerToUser}
                      </p>

                      {/* Tactical Pros & Cons */}
                      {evaluationResult.tacticalProsCons && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-800/60 text-xs">
                          <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30">
                            <strong className="text-emerald-700 dark:text-emerald-400 block mb-1 font-mono uppercase text-xs tracking-wider">
                              {t('dilemma.tacticalStrength')}
                            </strong>
                            <span className="text-stone-700 dark:text-stone-300 leading-relaxed">{evaluationResult.tacticalProsCons.strength}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-rose-500/10 dark:bg-rose-950/20">
                            <strong className="text-rose-700 dark:text-rose-400 block mb-1 font-mono uppercase text-xs tracking-wider">
                              {t('dilemma.hiddenVulnerability')}
                            </strong>
                            <span className="text-stone-700 dark:text-stone-300 leading-relaxed">{evaluationResult.tacticalProsCons.vulnerability}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* MULTI-TURN SOCRATIC AI: THINK DEEPER (OPTIONAL) */}
              {evaluationResult.socraticChallenge && (
                <>
                  {!temperamentProfile && !isTurn2Expanded ? (
                    <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold uppercase tracking-wider text-xs mb-1">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Think deeper (optional)</span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400">
                          Reflect on a tailored follow-up question to test your heart's reaction under pressure.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsTurn2Expanded(true)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <span>Think deeper (+20 XP)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-stone-50 dark:from-indigo-950/50 dark:via-[#10141f] dark:to-stone-900 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-indigo-200/50 dark:border-indigo-900/40">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <h4 className="text-xs sm:text-sm font-mono font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                            Think deeper: Follow-up question
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-bold">
                            Reflection Drill
                          </span>
                          {!temperamentProfile && (
                            <button
                              type="button"
                              onClick={() => setIsTurn2Expanded(false)}
                              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1"
                              aria-label="Collapse challenge"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Socratic Probe */}
                      <div className="p-3.5 rounded-xl bg-stone-50/80 dark:bg-black/40 text-xs sm:text-sm text-stone-800 dark:text-indigo-100 font-reading leading-relaxed italic border-l-2 border-indigo-400 text-left space-y-1">
                        <div className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider not-italic flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          <span>Mentor Socratic Question (AI Reflection • Not Scripture)</span>
                        </div>
                        <p className="mt-0.5">"{evaluationResult.socraticChallenge}"</p>
                      </div>

                      {/* Turn 2 Interactive Form */}
                      {!temperamentProfile && (
                        <form onSubmit={handleSubmitSocraticTurn2} className="space-y-3">
                          <label htmlFor="turn2-input" className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-semibold">
                            Your Response To This Counter-Challenge:
                          </label>
                          <textarea
                            id="turn2-input"
                            value={turn2Text}
                            onChange={e => setTurn2Text(e.target.value)}
                            placeholder="Address the challenge directly... (e.g., 'I will meet him privately at 8:30 AM before the team call. I will say: I noticed you presented the slides without mentioning our joint work...')"
                            rows={3}
                            className="w-full p-3 rounded-xl bg-stone-100/70 dark:bg-stone-950 text-stone-900 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600 text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all font-sans leading-relaxed"
                          />

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-stone-500 font-mono">
                              {turn2Text.length > 0 ? `${turn2Text.length} chars` : 'Test your tactical maturity'}
                            </span>
                            <button
                              type="submit"
                              disabled={!turn2Text.trim() || isEvaluatingTurn2}
                              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                isEvaluatingTurn2
                                  ? 'bg-indigo-600/80 text-white cursor-wait animate-pulse'
                                  : turn2Text.trim()
                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm cursor-pointer font-bold'
                                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed'
                              }`}
                            >
                              {isEvaluatingTurn2 ? (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 animate-spin text-white" />
                                  <span>Discerning Temperament...</span>
                                </>
                              ) : (
                                <>
                                  <span>Lock In Play & Evaluate Temperament (+40 XP)</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}

                  {/* Temperament Profile Results */}
                  {temperamentProfile && (
                    <div className="p-4 rounded-xl bg-stone-100/70 dark:bg-black/50 mt-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-mono text-amber-800 dark:text-amber-400 uppercase tracking-wider block font-bold">
                            Biblical Tactical Temperament:
                          </span>
                          <span className="text-sm font-serif font-bold text-stone-900 dark:text-parchment-50">
                            {temperamentProfile.archetypeTitle}
                          </span>
                        </div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold font-mono">
                          {temperamentProfile.archetype}
                        </span>
                      </div>

                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                        {temperamentProfile.archetypeDescription}
                      </p>

                      {turn2Feedback && (
                        <div className="p-2.5 rounded-lg bg-indigo-100/70 dark:bg-indigo-950/40 text-xs text-indigo-900 dark:text-indigo-200 italic">
                          {turn2Feedback}
                        </div>
                      )}

                      {/* 4 Virtue Spectrum Bars */}
                      <div className="grid grid-cols-2 gap-2.5 pt-2 text-[11px] font-mono">
                        <div>
                          <div className="flex justify-between text-stone-500 dark:text-stone-400 mb-1">
                            <span>Grace / Mercy:</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">{temperamentProfile.graceScore}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${temperamentProfile.graceScore}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-stone-500 dark:text-stone-400 mb-1">
                            <span>Truth / Steel:</span>
                            <span className="text-red-700 dark:text-red-400 font-bold">{temperamentProfile.truthScore}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-900 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${temperamentProfile.truthScore}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-stone-500 dark:text-stone-400 mb-1">
                            <span>Prudence / Strategy:</span>
                            <span className="text-amber-800 dark:text-amber-400 font-bold">{temperamentProfile.prudenceScore}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-900 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${temperamentProfile.prudenceScore}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-stone-500 dark:text-stone-400 mb-1">
                            <span>Courage / Action:</span>
                            <span className="text-cyan-700 dark:text-cyan-400 font-bold">{temperamentProfile.courageScore}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-900 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${temperamentProfile.courageScore}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

              {/* Grid: Human Validation vs The Flesh Trap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Human Validation */}
                <div className="p-4 rounded-xl bg-stone-100/70 dark:bg-stone-900/60 text-xs md:text-sm">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Why This Reaction Is 100% Human:</span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                    {evaluationResult.humanValidation}
                  </p>
                </div>

                {/* The Trap */}
                <div className="p-4 rounded-xl bg-red-500/10 dark:bg-red-950/30 text-xs md:text-sm">
                  <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>The Hidden Trap If You Pull This Trigger:</span>
                  </div>
                  <p className="text-red-900 dark:text-red-200/90 leading-relaxed">
                    {evaluationResult.theFleshTrap}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TACTICAL PLAYBOOK */}
          {activeEvalTab === 'playbook' && (
            <div className="space-y-6">
              {/* The Biblical Redirection (High Road Play) */}
              <div className="p-5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/25">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs mb-2">
                  <Shield className="w-4 h-4" />
                  <span>The Biblical Pivot (Restrained Power):</span>
                </div>
                <p className="text-xs md:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed mb-4">
                  {evaluationResult.biblicalPlayRedirect}
                </p>

                {/* Scripture Anchor Card with Audio Button */}
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/90">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400">
                      📖 {evaluationResult.scriptureReference}
                    </span>

                    <button
                      onClick={handleSpeakScripture}
                      className="flex items-center gap-1 text-[11px] font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-amber-400 transition-all bg-stone-200/60 hover:bg-stone-200 dark:bg-stone-900 px-2.5 py-1 rounded-lg"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeakingScripture ? 'Stop Audio' : 'Listen'}</span>
                    </button>
                  </div>

                  <p className="text-xs md:text-sm text-stone-900 dark:text-stone-200 font-reading italic leading-relaxed mb-2">
                    "{evaluationResult.scriptureText}"
                  </p>

                  <p className="text-xs text-amber-800 dark:text-amber-300/90 font-sans">
                    <strong className="text-amber-800 dark:text-amber-400">Street Meaning: </strong>
                    {evaluationResult.scriptureStreetMeaning}
                  </p>
                </div>
              </div>

              {/* LIVING CANON: TACTICAL NEXUS KNOWLEDGE GRAPH */}
              <TacticalNexusCard entityId={dilemma.id} onOpenEntity={onOpenNexus} />

              {/* 3 Tactical Moves For Tomorrow */}
              <div>
                <h4 className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
                  🎯 3 Tactical Battle Moves For Tomorrow Morning:
                </h4>
                <div className="space-y-2">
                  {evaluationResult.tacticalMoves.map((move, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded-lg bg-stone-100/70 dark:bg-stone-900/60 flex items-start gap-2.5 text-xs text-stone-700 dark:text-stone-300 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {i + 1}
                      </span>
                      <span>{move}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setEvaluationResult(null);
                    setUserText('');
                    setSelectedFeeling(null);
                    setTurn2Text('');
                    setTurn2Feedback(null);
                    setTemperamentProfile(null);
                    try {
                      const stored = localStorage.getItem('testament_dilemma_answers');
                      if (stored) {
                        const answers = JSON.parse(stored);
                        delete answers[dilemma.id];
                        localStorage.setItem('testament_dilemma_answers', JSON.stringify(answers));
                      }
                    } catch {
                      // ignore
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Answering Again</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveMode('playbook');
                    }}
                    className="text-xs px-4 py-2 rounded-xl bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 font-bold transition-all"
                  >
                    Compare In Playbook
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      // pick next dilemma
                      const currentIndex = filteredDilemmas.findIndex(d => d.id === dilemma.id);
                      const nextIndex = (currentIndex + 1) % filteredDilemmas.length;
                      handleSelectDilemma(filteredDilemmas[nextIndex].id);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="text-xs px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>Next Dilemma</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bottom Sentinel to trigger Campaign Next Task modal only when reaching the bottom */}
              <div ref={bottomSentinelRef} className="h-4 w-full pointer-events-none" aria-hidden="true" />
            </div>
          )}
        </div>
      )}

      {/* MODE 2: THE PLAYBOOK (SIDE-BY-SIDE ANALYSIS) */}
      {activeMode === 'playbook' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Inspect The Two Playbook Options:
            </h4>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Click either play to inspect the tactical outcome
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {dilemma.plays.map(play => {
              const isSelected = revealedPlayId === play.id;
              return (
                <div
                  key={play.id}
                  className={`p-5 rounded-2xl transition-all flex flex-col justify-between ${
                    isSelected
                      ? play.isRecommended
                        ? 'bg-emerald-500/15 dark:bg-emerald-950/40'
                        : 'bg-red-500/15 dark:bg-red-950/40'
                      : 'bg-stone-100/70 dark:bg-stone-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                        play.playType === 'The Biblical Play' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                      }`}>
                        {play.playType}
                      </span>
                      {play.isRecommended && (
                        <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ★ Recommended
                        </span>
                      )}
                    </div>

                    <h5 className="text-base font-serif font-bold text-stone-900 dark:text-parchment-50 mb-2">
                      {play.name}
                    </h5>

                    <p className="text-xs md:text-sm text-stone-700 dark:text-stone-300 leading-relaxed mb-4">
                      {play.action}
                    </p>

                    {/* Revealed outcome */}
                    {isSelected && (
                      <div className="space-y-3 pt-3 border-t border-stone-200/60 dark:border-stone-800/60">
                        <div className="p-3 bg-stone-200/50 dark:bg-stone-950/80 rounded-xl text-xs">
                          <strong className="text-stone-900 dark:text-stone-300 block mb-1">Expected Outcome: </strong>
                          <p className="text-stone-600 dark:text-stone-400">{play.outcome}</p>
                        </div>

                        <div className="p-3 bg-amber-500/10 dark:bg-amber-950/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 font-reading">
                          <strong className="text-amber-800 dark:text-amber-400 block mb-1">Biblical Foundation: </strong>
                          "{play.biblicalRoot}"
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-200/60 dark:border-stone-800/60">
                    <button
                      onClick={() => handleSelectPlaybookCard(play.id, play.isRecommended)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-stone-300/60 dark:bg-stone-800 text-stone-800 dark:text-stone-300'
                          : play.isRecommended
                            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm font-bold'
                            : 'bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span>{isSelected ? 'Analyzed' : `Select ${play.name}`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
