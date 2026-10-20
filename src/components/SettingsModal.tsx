import React, { useState, useEffect, useRef } from 'react';
import { Type, Volume2, Mic, Check, Sun, Moon, Globe, BookOpen, Award, Bell, ChevronLeft } from 'lucide-react';
import { useFontSize, FONT_SCALE_STEPS, type FontScaleStep } from '../context/FontSizeContext';
import { useLanguage, type Language } from '../context/LanguageContext';
import { soundEngine, NARRATOR_VOICES, type NarratorProfile } from '../utils/audio';
import { getStoredTheme, applyTheme, type AppTheme } from '../utils/theme';
import { getShowXpPreference, setShowXpPreference } from '../utils/userPreferences';
import { loadReadingPlace, saveReadingPlace } from '../utils/readingPlace';
import { BIBLE_TRANSLATIONS, getDefaultTranslationForLanguage, type TranslationId } from '../utils/bibleService';
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

interface SettingsPageProps {
  onBack: () => void;
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

const VOICE_PREVIEW_BY_LANG: Record<Language, string> = {
  en: 'The Lord is my strength and my shield; in Him my heart trusts.',
  es: 'El Señor es mi fuerza y mi escudo; en Él confía mi corazón.',
  fr: 'L\'Éternel est ma force et mon bouclier; en lui mon cœur se confie.',
};

const switchHitArea: React.CSSProperties = { minHeight: 44, minWidth: 52 };

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
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
  const backRef = useRef<HTMLButtonElement>(null);
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
    const next = getDefaultTranslationForLanguage(language);
    setCurrentTranslation(next);
  }, [language]);

  useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, []);

  const handleBack = React.useCallback(() => {
    soundEngine.stopSpeaking();
    setIsPreviewingVoice(false);
    onBack();
  }, [onBack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack]);

  useEffect(() => {
    backRef.current?.focus();
  }, []);

  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  const handlePreviewVoice = () => {
    if (isPreviewingVoice) {
      soundEngine.stopSpeaking();
      setIsPreviewingVoice(false);
      return;
    }

    soundEngine.stopSpeaking();
    setIsPreviewingVoice(true);
    soundEngine.speakVerse(VOICE_PREVIEW_BY_LANG[language] ?? VOICE_PREVIEW_BY_LANG.en, () => {
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
    <div className="fixed inset-0 z-30 overflow-y-auto overscroll-contain bg-surface text-stone-900 dark:text-parchment-50">
      <header className="sticky top-0 z-10 border-b border-stone-200 dark:border-stone-800 bg-surface/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 sm:px-8 pt-[max(0.75rem,env(safe-area-inset-top))] pb-4">
          <button
            ref={backRef}
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 min-h-[44px] pl-1 pr-3 -ml-1 rounded-full text-base font-semibold leading-6 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label={t('story.back')}
          >
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
            <span>{t('story.back')}</span>
          </button>
          <h1 id="settings-page-title" className="text-title-1 text-stone-900 dark:text-parchment-50 truncate">
            {t('dashboard.settings')}
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <section className="py-8 space-y-4">
          <div className="flex items-center justify-between gap-3 text-base leading-6 font-semibold text-stone-800 dark:text-stone-100">
            <div className="flex items-center gap-3">
              {currentTheme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-600" />}
              <span>{t('settings.theme')}</span>
            </div>
            <span className="text-sm font-mono font-bold leading-6 text-amber-700 dark:text-amber-400 uppercase">
              {currentTheme === 'dark' ? t('settings.themeDark') : t('settings.themeLight')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                applyTheme('light');
                setCurrentTheme('light');
              }}
              className={`btn-segment justify-center gap-2 min-h-[44px] text-sm sm:text-base rounded-2xl min-w-0 w-full ${
                currentTheme === 'light' ? 'btn-segment-selected' : ''
              }`}
            >
              <Sun className="w-4 h-4 text-amber-600" />
              <span>{t('settings.themeLight')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                applyTheme('dark');
                setCurrentTheme('dark');
              }}
              className={`btn-segment justify-center gap-2 min-h-[44px] text-sm sm:text-base rounded-2xl min-w-0 w-full ${
                currentTheme === 'dark' ? 'btn-segment-selected' : ''
              }`}
            >
              <Moon className="w-4 h-4 text-amber-400" />
              <span>{t('settings.themeDark')}</span>
            </button>
          </div>
        </section>

        <section className="py-8 space-y-4 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between gap-3 text-base leading-6 font-semibold text-stone-800 dark:text-stone-100">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>{t('settings.translation')}</span>
            </div>
            <span className="text-sm font-mono font-bold leading-6 text-amber-700 dark:text-amber-400 uppercase">
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
            className="w-full px-4 py-3 rounded-2xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-base leading-6 font-medium text-stone-900 dark:text-parchment-50 focus:outline-none min-h-[48px] cursor-pointer"
          >
            {BIBLE_TRANSLATIONS.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {tr.label}
              </option>
            ))}
          </select>
        </section>

        <section className="py-8 space-y-4 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3 text-base leading-6 font-semibold text-stone-800 dark:text-stone-100">
            <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>{t('settings.language')}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['en', 'es', 'fr'] as Language[]).map((langCode) => {
              const isSelected = language === langCode;
              const label = langCode === 'en' ? t('settings.langEn') : langCode === 'es' ? t('settings.langEs') : t('settings.langFr');
              return (
                <button
                  key={langCode}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setLanguage(langCode);
                  }}
                  className={`btn-segment justify-center min-h-[44px] text-sm sm:text-base py-2 min-w-0 w-full ${isSelected ? 'btn-segment-selected' : ''}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="py-8 space-y-5 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between gap-4 min-h-[44px]">
            <div className="flex items-center gap-3 min-w-0">
              <Volume2 className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="min-w-0">
                <div className="text-base leading-6 font-semibold text-stone-800 dark:text-stone-100">{t('settings.sound')}</div>
                <div className="text-sm leading-6 text-stone-500 dark:text-stone-400">{t('settings.soundHint')}</div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundOn}
              onClick={() => { const next = !soundOn; setSoundOn(next); setSoundEnabled(next); if (next) soundEngine.playSnap(); }}
              style={switchHitArea}
              className="inline-flex items-center justify-center shrink-0 cursor-pointer"
            >
              <span className={`w-12 h-7 rounded-full p-1 transition-colors ${soundOn ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'}`}>
                <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${soundOn ? 'translate-x-5' : 'translate-x-0'}`} />
              </span>
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 min-h-[44px]">
            <div className="flex items-center gap-3 min-w-0">
              <Bell className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="min-w-0">
                <div className="text-base leading-6 font-semibold text-stone-800 dark:text-stone-100">{t('settings.haptics')}</div>
                <div className="text-sm leading-6 text-stone-500 dark:text-stone-400">{t('settings.hapticsHint')}</div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hapticsOn}
              onClick={() => { const next = !hapticsOn; setHapticsOn(next); setHapticsEnabled(next); }}
              style={switchHitArea}
              className="inline-flex items-center justify-center shrink-0 cursor-pointer"
            >
              <span className={`w-12 h-7 rounded-full p-1 transition-colors ${hapticsOn ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'}`}>
                <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${hapticsOn ? 'translate-x-5' : 'translate-x-0'}`} />
              </span>
            </button>
          </div>
        </section>

        <section className="py-8 space-y-4 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3 text-base leading-6 font-semibold text-stone-800 dark:text-stone-100">
            <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>{t('settings.sessionLength')}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
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
                className={`rounded-full text-sm sm:text-base font-semibold min-h-[44px] px-2 flex items-center justify-center transition-all cursor-pointer ${
                  sessionLength === option.id
                    ? 'bg-accent text-accent-on font-bold shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="py-8 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between gap-4 min-h-[44px]">
            <div className="flex items-center gap-3 min-w-0">
              <Award className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="min-w-0">
                <div className="text-base leading-6 font-semibold text-stone-800 dark:text-stone-100">{t('settings.showXp')}</div>
                <div className="text-sm leading-6 text-stone-500 dark:text-stone-400">Keep learning calm and distraction-free</div>
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
              style={switchHitArea}
              className="inline-flex items-center justify-center shrink-0 cursor-pointer"
            >
              <span className={`w-12 h-7 rounded-full p-1 transition-colors ${showXp ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'}`}>
                <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${showXp ? 'translate-x-5' : 'translate-x-0'}`} />
              </span>
            </button>
          </div>
        </section>

        <section className="py-8 space-y-4 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-base leading-6 font-semibold text-stone-800 dark:text-stone-100">
              <Type className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>{t('fontSize.title')}</span>
            </div>
            <span className="text-sm font-mono font-bold leading-6 text-amber-700 dark:text-amber-400 uppercase">
              {currentStep}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-full bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
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
                  className={`rounded-full text-sm font-mono font-bold transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                    isSelected
                      ? 'bg-accent text-accent-on shadow-sm'
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

          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-stone-800 dark:text-stone-200">
            <p className="text-base sm:text-lg font-serif italic leading-relaxed">
              "{t('fontSize.preview')}"
            </p>
          </div>
        </section>

        <section className="py-8 space-y-4 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-base leading-6 font-semibold text-stone-800 dark:text-stone-100">
              <Mic className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>{t('settings.narrationVoice')}</span>
            </div>
            <button
              type="button"
              onClick={handlePreviewVoice}
              className="inline-flex items-center gap-2 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 text-sm font-bold leading-6 transition-colors cursor-pointer min-h-[44px]"
              aria-label={isPreviewingVoice ? "Stop voice preview" : "Preview narration voice"}
            >
              <Volume2 className={`w-4 h-4 ${isPreviewingVoice ? 'animate-pulse text-amber-600' : ''}`} />
              <span>{isPreviewingVoice ? 'Playing...' : 'Preview voice'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1 min-h-[64px] ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500/60 dark:bg-amber-500/20 text-stone-950 dark:text-parchment-50 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-base font-bold font-serif leading-6">{meta.name}</span>
                    {isCurrent && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
                  </div>
                  <span className="text-sm leading-6 text-stone-500 dark:text-stone-400">{meta.subtitle}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="py-8 space-y-2 border-t border-stone-200 dark:border-stone-800">
          {onOpenLearnerMode && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenLearnerMode();
              }}
              className="w-full text-left text-base leading-6 px-4 rounded-2xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition-colors cursor-pointer min-h-[48px] flex items-center justify-between gap-3"
            >
              <span>Learner mode</span>
              {activeLearnerMode && (
                <span className="text-xs font-mono uppercase bg-amber-500/15 text-amber-800 dark:text-amber-400 font-bold px-2 py-1 rounded-md">
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
                onOpenOnboarding();
              }}
              className="w-full text-left text-base leading-6 px-4 rounded-2xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition-colors cursor-pointer min-h-[48px] flex items-center"
            >
              Set up my plan
            </button>
          )}
          {onOpenReminders && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenReminders();
              }}
              className="w-full text-left text-base leading-6 px-4 rounded-2xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition-colors cursor-pointer min-h-[48px] flex items-center"
            >
              {t('notifications.settingsLink')}
            </button>
          )}
          {onOpenJournal && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenJournal();
              }}
              className="w-full text-left text-base leading-6 px-4 rounded-2xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition-colors cursor-pointer min-h-[48px] flex items-center"
            >
              Decision journal
            </button>
          )}
          {onOpenPeople && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenPeople();
              }}
              className="w-full text-left text-base leading-6 px-4 rounded-2xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition-colors cursor-pointer min-h-[48px] flex items-center"
            >
              People & character arcs
            </button>
          )}
          {onOpenRelics && relicsCount && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenRelics();
              }}
              className="w-full text-left text-base leading-6 px-4 rounded-2xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition-colors cursor-pointer min-h-[48px] flex items-center"
            >
              Collection ({relicsCount.unlocked}/{relicsCount.total})
            </button>
          )}
          {onOpenHowItWorks && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenHowItWorks();
              }}
              className="w-full text-left text-base leading-6 px-4 rounded-2xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition-colors cursor-pointer min-h-[48px] flex items-center"
            >
              How Testament works
            </button>
          )}
          <a
            href="/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playClick()}
            className="w-full text-left text-base leading-6 px-4 rounded-2xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition-colors cursor-pointer min-h-[48px] flex items-center justify-between gap-3"
          >
            <span>Privacy Policy</span>
            <span className="text-sm font-mono text-stone-400">↗</span>
          </a>
        </section>
      </div>
    </div>
  );
};
