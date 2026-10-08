import React, { useState, useEffect } from 'react';
import { Type, Volume2, Mic, Check } from 'lucide-react';
import { useFontSize, FONT_SCALE_STEPS, type FontScaleStep } from '../context/FontSizeContext';
import { useLanguage } from '../context/LanguageContext';
import { soundEngine, NARRATOR_VOICES, type NarratorProfile } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOnboarding?: () => void;
  onOpenReminders?: () => void;
  onOpenJournal?: () => void;
  onOpenPeople?: () => void;
  onOpenRelics?: () => void;
  onOpenHowItWorks?: () => void;
  onOpenLearnerMode?: () => void;
  activeLearnerMode?: string;
  relicsCount?: { unlocked: number; total: number };
}

const VOICE_PREVIEW_TEXT = "The Lord is my strength and my shield; in Him my heart trusts.";

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenOnboarding,
  onOpenReminders,
  onOpenJournal,
  onOpenPeople,
  onOpenRelics,
  onOpenHowItWorks,
  onOpenLearnerMode,
  activeLearnerMode,
  relicsCount,
}) => {
  const { currentStep, setFontScaleStep } = useFontSize();
  const { t } = useLanguage();
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<NarratorProfile>(() => soundEngine.getNarratorProfile());

  useEffect(() => {
    const handleVoiceChange = (e: Event) => {
      const customEvent = e as CustomEvent<NarratorProfile>;
      if (customEvent.detail) {
        setCurrentVoice(customEvent.detail);
      }
    };
    window.addEventListener('testament-voice-changed', handleVoiceChange);
    return () => window.removeEventListener('testament-voice-changed', handleVoiceChange);
  }, []);

  useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, []);

  const handleClose = React.useCallback(() => {
    soundEngine.stopSpeaking();
    setIsPreviewingVoice(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handlePreviewVoice = () => {
    if (isPreviewingVoice) {
      soundEngine.stopSpeaking();
      setIsPreviewingVoice(false);
      return;
    }

    soundEngine.stopSpeaking();
    setIsPreviewingVoice(true);
    soundEngine.speakVerse(VOICE_PREVIEW_TEXT, () => {
      setIsPreviewingVoice(false);
    });
  };

  const handleSelectVoice = (voiceId: NarratorProfile) => {
    soundEngine.stopSpeaking();
    setIsPreviewingVoice(false);
    soundEngine.setNarratorProfile(voiceId);
    setCurrentVoice(voiceId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto overscroll-contain"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        className="w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 text-left my-auto space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <h2 id="settings-dialog-title" className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50">
              {t('dashboard.settings')}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Text Size Picker */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium text-xs sm:text-sm">
              <Type className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t('fontSize.title')}</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">
              {currentStep}
            </span>
          </div>

          {/* 5-step Segmented Scale */}
          <div className="grid grid-cols-5 gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
            {FONT_SCALE_STEPS.map((step) => {
              const isSelected = currentStep === step.step;
              return (
                <button
                  key={step.step}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setFontScaleStep(step.step as FontScaleStep);
                  }}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-sm scale-[1.02]'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Set text size to ${step.label}`}
                >
                  {step.label}
                </button>
              );
            })}
          </div>

          {/* Live Preview Line */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-stone-800 dark:text-stone-200">
            <p className="text-xs sm:text-sm font-serif italic leading-relaxed">
              "{t('fontSize.preview')}"
            </p>
          </div>
        </div>

        {/* Section 2: Voice & Narration */}
        <div className="space-y-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium text-xs sm:text-sm">
              <Mic className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Narration voice</span>
            </div>
            <button
              type="button"
              onClick={handlePreviewVoice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 text-xs font-bold transition-colors cursor-pointer min-h-[44px]"
              aria-label={isPreviewingVoice ? "Stop voice preview" : "Preview narration voice"}
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPreviewingVoice ? 'animate-pulse text-amber-600' : ''}`} />
              <span>{isPreviewingVoice ? 'Playing...' : 'Preview voice'}</span>
            </button>
          </div>

          {/* Voice choices */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(NARRATOR_VOICES) as NarratorProfile[]).map((vKey) => {
              const meta = NARRATOR_VOICES[vKey];
              const isCurrent = currentVoice === vKey;
              return (
                <button
                  key={vKey}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    handleSelectVoice(vKey);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between min-h-[48px] ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500/60 dark:bg-amber-500/20 text-stone-950 dark:text-parchment-50 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold font-serif">{meta.name}</span>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">{meta.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Navigation Quick Links */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-1">
          {onOpenLearnerMode && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onOpenLearnerMode();
              }}
              className="w-full text-left text-xs p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium transition-colors cursor-pointer min-h-[44px] flex items-center justify-between"
            >
              <span>Learner mode</span>
              {activeLearnerMode && (
                <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-800 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded-md">
                  {activeLearnerMode}
                </span>
              )}
            </button>
          )}
          {onOpenOnboarding && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onOpenOnboarding();
              }}
              className="w-full text-left text-xs p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              Set up my plan
            </button>
          )}
          {onOpenReminders && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onOpenReminders();
              }}
              className="w-full text-left text-xs p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              Reminders
            </button>
          )}
          {onOpenJournal && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onOpenJournal();
              }}
              className="w-full text-left text-xs p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              Decision journal
            </button>
          )}
          {onOpenPeople && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onOpenPeople();
              }}
              className="w-full text-left text-xs p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              People & character arcs
            </button>
          )}
          {onOpenRelics && relicsCount && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onOpenRelics();
              }}
              className="w-full text-left text-xs p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              Collection ({relicsCount.unlocked}/{relicsCount.total})
            </button>
          )}
          {onOpenHowItWorks && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onOpenHowItWorks();
              }}
              className="w-full text-left text-xs p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              How Testament works
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
