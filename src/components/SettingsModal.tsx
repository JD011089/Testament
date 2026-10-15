import React, { useState, useEffect } from 'react';
import { Type, Volume2, Mic, Check, Sun, Moon, Globe, BookOpen, Award, Bell } from 'lucide-react';
import { useFontSize, FONT_SCALE_STEPS, type FontScaleStep } from '../context/FontSizeContext';
import { useLanguage, type Language } from '../context/LanguageContext';
import { soundEngine, NARRATOR_VOICES, type NarratorProfile } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';
import { getStoredTheme, applyTheme, type AppTheme } from '../utils/theme';
import { getShowXpPreference, setShowXpPreference } from '../utils/userPreferences';
import { loadReadingPlace, saveReadingPlace } from '../utils/readingPlace';
import { BIBLE_TRANSLATIONS, type TranslationId } from '../utils/bibleService';
import {
  isSoundEnabled, setSoundEnabled, isHapticsEnabled, setHapticsEnabled
} from '../utils/feedback';

const SESSION_LENGTH_KEY = 'testament_session_length';
type SessionLength = '3min' | '10min' | 'deep';

function readSessionLength(): SessionLength {
  try {
    const raw = localStorage.getItem(SESSION_LENGTH_KEY);
    return raw === '10min' || raw === 'deep' ? raw : '3min';
  } catch {
    return '3min';
  }
}

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
  const modalRef = useModalLock(isOpen);
  const { currentStep, setFontScaleStep } = useFontSize();
  const { t, language, setLanguage } = useLanguage();
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<NarratorProfile>(() => soundEngine.getNarratorProfile());
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => getStoredTheme());
  const [showXp, setShowXp] = useState<boolean>(() => getShowXpPreference());
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [hapticsOn, setHapticsOn] = useState<boolean>(() => isHapticsEnabled());
  const [sessionLength, setSessionLength] = useState<SessionLength>(() => readSessionLength());
  const [currentTranslation, setCurrentTranslation] = useState<TranslationId>(() => {
    const place = loadReadingPlace();
    return place?.translation || 'web';
  });

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
        ref={modalRef}
        tabIndex={-1}
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

        {/* Theme (Daybreak / Vespers) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
            <div className="flex items-center gap-2">
              {currentTheme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
              <span>Theme</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">
              {currentTheme === 'dark' ? 'Vespers (Dark)' : 'Daybreak (Light)'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                applyTheme('light');
                setCurrentTheme('light');
              }}
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 min-h-[44px] cursor-pointer transition-all ${
                currentTheme === 'light'
                  ? 'bg-amber-500/20 border-amber-500 text-stone-900 font-bold shadow-xs'
                  : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Daybreak (Light)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                applyTheme('dark');
                setCurrentTheme('dark');
              }}
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 min-h-[44px] cursor-pointer transition-all ${
                currentTheme === 'dark'
                  ? 'bg-amber-500/20 border-amber-500 text-parchment-50 font-bold shadow-xs'
                  : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>Vespers (Dark)</span>
            </button>
          </div>
        </div>

        {/* Translation Selector */}
        <div className="space-y-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Bible Translation</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">
              {currentTranslation.toUpperCase()}
            </span>
          </div>
          <select
            value={currentTranslation}
            onChange={(e) => {
              const next = e.target.value as TranslationId;
              soundEngine.playClick();
              setCurrentTranslation(next);
              const currentPlace = loadReadingPlace();
              saveReadingPlace({
                bookId: currentPlace?.bookId || 'GEN',
                bookName: currentPlace?.bookName || 'Genesis',
                chapter: currentPlace?.chapter || 1,
                translation: next
              });
              window.dispatchEvent(new CustomEvent('testament-translation-changed', { detail: { translation: next } }));
            }}
            className="w-full p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm font-medium text-stone-900 dark:text-parchment-50 focus:outline-none min-h-[44px] cursor-pointer"
          >
            {BIBLE_TRANSLATIONS.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {tr.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language Selector */}
        <div className="space-y-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Language</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['en', 'es', 'fr'] as Language[]).map((langCode) => {
              const isSelected = language === langCode;
              const label = langCode === 'en' ? 'English 🇺🇸' : langCode === 'es' ? 'Español 🇪🇸' : 'Français 🇫🇷';
              return (
                <button
                  key={langCode}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setLanguage(langCode);
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold min-h-[44px] flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound & Haptics */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <div>
                <div className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">Sound</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">Short sound on every success</div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundOn}
              onClick={() => { const next = !soundOn; setSoundOn(next); setSoundEnabled(next); if (next) soundEngine.playSnap(); }}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${soundOn ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${soundOn ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <div>
                <div className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">Haptics</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">Gentle vibration on success</div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hapticsOn}
              onClick={() => { const next = !hapticsOn; setHapticsOn(next); setHapticsEnabled(next); }}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${hapticsOn ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${hapticsOn ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Session length */}
        <div className="space-y-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium text-xs sm:text-sm">
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Daily session length</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {([
              { id: '3min', label: '3 min' },
              { id: '10min', label: '10 min' },
              { id: 'deep', label: 'Deep' }
            ] as { id: SessionLength; label: string }[]).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setSessionLength(option.id);
                  try { localStorage.setItem(SESSION_LENGTH_KEY, option.id); } catch { /* ignore */ }
                  window.dispatchEvent(new CustomEvent('testament-session-length-changed', { detail: option.id }));
                }}
                aria-pressed={sessionLength === option.id}
                className={`py-2 rounded-xl text-xs font-semibold min-h-[44px] flex items-center justify-center transition-all cursor-pointer ${
                  sessionLength === option.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Show XP & Ranks Switch */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div>
              <div className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">Show XP and ranks</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">Keep learning calm and distraction-free</div>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showXp}
            onClick={() => {
              soundEngine.playSnap();
              const next = !showXp;
              setShowXp(next);
              setShowXpPreference(next);
            }}
            className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
              showXp ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                showXp ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Section 1: Text Size Picker */}
        <div className="space-y-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
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
          <a
            href="/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playClick()}
            className="w-full text-left text-xs p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium transition-colors cursor-pointer min-h-[44px] flex items-center justify-between"
          >
            <span>Privacy Policy</span>
            <span className="text-[10px] font-mono text-stone-400">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
};
