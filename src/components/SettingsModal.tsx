import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BookOpen, Globe, Mic, Clock, Bell, Volume2, Smartphone, PenLine, Users, Target,
  HelpCircle, ShieldCheck, ChevronLeft, ChevronRight, Check, Play, Square, Flame,
  Car, Wind, Sparkles, X,
} from 'lucide-react';
import { useFontSize, FONT_SCALE_STEPS, type FontScaleStep } from '../context/FontSizeContext';
import { useLanguage, type Language } from '../context/LanguageContext';
import { soundEngine, NARRATOR_VOICES, type NarratorProfile } from '../utils/audio';
import { getStoredTheme, applyTheme, type AppTheme } from '../utils/theme';
import { loadReadingPlace, saveReadingPlace } from '../utils/readingPlace';
import { BIBLE_TRANSLATIONS, getDefaultTranslationForLanguage, type TranslationId } from '../utils/bibleService';
import { getCompletedStoryIds } from '../utils/storyProgress';
import { readDeck } from '../utils/deck';
import { APP_VERSION } from '../config/version';
import {
  isSoundEnabled, setSoundEnabled, isHapticsEnabled, setHapticsEnabled
} from '../utils/feedback';

const SESSION_LENGTH_KEY = 'testament_session_length';
type SessionLength = '3min' | '10min' | 'deep';
export type Ambience = 'none' | 'campfire' | 'wind' | 'sanctuary';

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
  onOpenCollection?: () => void;
  onOpenHowItWorks?: () => void;
  onOpenLearnerMode?: () => void;
  onOpenDriveMode?: () => void;
  onOpenWhatsNew?: () => void;
  activeLearnerMode?: string;
  streakCount?: number;
  currentAmbience?: Ambience;
  onSetAmbience?: (ambience: Ambience) => void;
}

const VOICE_PREVIEW_BY_LANG: Record<Language, string> = {
  en: 'The Lord is my strength and my shield; in Him my heart trusts.',
  es: 'El Señor es mi fuerza y mi escudo; en Él confía mi corazón.',
  fr: 'L\'Éternel est ma force et mon bouclier; en lui mon cœur se confie.',
};

const AMBIENCE_OPTIONS: { id: Ambience; label: string; hint: string }[] = [
  { id: 'none', label: 'Off', hint: 'Silence' },
  { id: 'campfire', label: 'Campfire', hint: 'Crackling fire at night' },
  { id: 'wind', label: 'Desert wind', hint: 'Soft wind over the hills' },
  { id: 'sanctuary', label: 'Sanctuary', hint: 'Quiet, echoing hall' },
];

type SheetId = 'translation' | 'language' | 'voice' | 'ambience' | null;

/* ---------- small building blocks ---------- */

const Group: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <section className="mt-7">
    <h2 className="px-2 pb-2 text-[11px] font-bold tracking-[0.13em] uppercase text-fg-muted">{label}</h2>
    <div className="rounded-3xl bg-surface-raised border border-line shadow-[0_1px_2px_rgba(10,15,30,0.04),0_10px_30px_-14px_rgba(10,15,30,0.18)] overflow-hidden divide-y divide-line">
      {children}
    </div>
  </section>
);

/** Tinted rounded-square icon, iOS-settings style. */
const RowIcon: React.FC<{ tone: string; children: React.ReactNode }> = ({ tone, children }) => (
  <span className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 text-white ${tone}`} aria-hidden="true">
    {children}
  </span>
);

const TONES = {
  lapis: 'bg-[#23408E] dark:bg-[#3A5BB5]',
  gold: 'bg-[#B8862B]',
  plum: 'bg-[#7A4E8C]',
  teal: 'bg-[#2E7D6B]',
  clay: 'bg-[#B5523B]',
  slate: 'bg-[#636A7C]',
};

interface RowProps {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  value?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  trailing?: React.ReactNode;
}

const Row: React.FC<RowProps> = ({ icon, title, hint, value, onClick, href, trailing }) => {
  const inner = (
    <>
      {icon}
      <span className="flex-1 min-w-0 text-left">
        <span className="block text-[15px] font-semibold text-fg leading-snug">{title}</span>
        {hint && <span className="block text-xs text-fg-muted leading-snug mt-0.5">{hint}</span>}
      </span>
      {value !== undefined && <span className="text-sm font-semibold text-fg-muted truncate max-w-[45%]">{value}</span>}
      {trailing ?? ((onClick || href) && (
        href
          ? <span className="text-sm text-fg-muted" aria-hidden="true">↗</span>
          : <ChevronRight className="w-4 h-4 text-fg-muted/70 shrink-0" aria-hidden="true" />
      ))}
    </>
  );
  const cls = 'w-full flex items-center gap-3 px-4 py-3 min-h-[56px] transition-colors';
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => soundEngine.playClick()} className={`${cls} hover:bg-stone-100/70 dark:hover:bg-stone-850/70 cursor-pointer`}>
        {inner}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={() => { soundEngine.playClick(); onClick(); }} className={`${cls} hover:bg-stone-100/70 dark:hover:bg-stone-850/70 cursor-pointer`}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
};

const Switch: React.FC<{ on: boolean; onToggle: () => void; label: string }> = ({ on, onToggle, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={onToggle}
    style={{ minHeight: 44, minWidth: 52 }}
    className="inline-flex items-center justify-center shrink-0 cursor-pointer"
  >
    <span className={`w-12 h-7 rounded-full p-1 transition-colors ${on ? 'bg-accent' : 'bg-stone-300 dark:bg-stone-700'}`}>
      <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </span>
  </button>
);

/** Bottom sheet on phones, centered card on larger screens. */
const Sheet: React.FC<{ title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }> = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
    <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-[2px] cursor-default" />
    <div className="relative w-full sm:max-w-md max-h-[85dvh] overflow-y-auto bg-surface-raised rounded-t-[28px] sm:rounded-[28px] px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-20px_50px_rgba(0,0,0,0.25)] animate-[sheetUp_.22s_ease-out]">
      <div className="w-10 h-1.5 rounded-full bg-line mx-auto mb-4 sm:hidden" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-title-2 text-fg">{title}</h3>
          {subtitle && <p className="text-sm text-fg-muted mt-1">{subtitle}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 min-h-0 rounded-full flex items-center justify-center text-fg-muted hover:bg-stone-100 dark:hover:bg-stone-850 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  </div>
);

const Choice: React.FC<{ selected: boolean; title: string; hint?: string; onSelect: () => void; leading?: React.ReactNode; serif?: boolean }> = ({ selected, title, hint, onSelect, leading, serif }) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-2xl border-[1.5px] transition-colors ${
      selected ? 'border-accent bg-amber-50 dark:bg-amber-500/10' : 'border-line hover:border-line-strong'
    }`}
  >
    {leading}
    <button type="button" onClick={onSelect} aria-pressed={selected} className="flex-1 min-w-0 text-left flex items-center gap-3 cursor-pointer min-h-[44px]">
      <span className="flex-1 min-w-0">
        <span className={`block text-base font-semibold text-fg ${serif ? 'font-serif' : ''}`}>{title}</span>
        {hint && <span className="block text-xs text-fg-muted mt-0.5">{hint}</span>}
      </span>
      {selected && (
        <span className="w-6 h-6 rounded-full bg-accent text-accent-on flex items-center justify-center shrink-0">
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  </div>
);

/* ---------- page ---------- */

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
  onOpenOnboarding,
  onOpenReminders,
  onOpenJournal,
  onOpenPeople,
  onOpenCollection,
  onOpenHowItWorks,
  onOpenLearnerMode,
  onOpenDriveMode,
  onOpenWhatsNew,
  activeLearnerMode,
  streakCount = 0,
  currentAmbience = 'none',
  onSetAmbience,
}) => {
  const backRef = useRef<HTMLButtonElement>(null);
  const { currentStep, setFontScaleStep } = useFontSize();
  const { t, language, setLanguage } = useLanguage();
  const [sheet, setSheet] = useState<SheetId>(null);
  const [previewingVoice, setPreviewingVoice] = useState<NarratorProfile | null>(null);
  const [currentVoice, setCurrentVoice] = useState<NarratorProfile>(() => soundEngine.getNarratorProfile());
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => getStoredTheme());
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [hapticsOn, setHapticsOn] = useState<boolean>(() => isHapticsEnabled());
  const [sessionLength, setSessionLength] = useState<SessionLength>(() => readSessionLength());
  const [currentTranslation, setCurrentTranslation] = useState<TranslationId>(() => {
    const place = loadReadingPlace();
    return place?.translation || 'web';
  });

  const stats = useMemo(() => {
    let stories = 0;
    let cards = 0;
    try { stories = getCompletedStoryIds().length; } catch { /* ignore */ }
    try { cards = readDeck().length; } catch { /* ignore */ }
    return { stories, cards };
  }, []);

  useEffect(() => {
    const handleVoiceChange = (e: Event) => {
      const customEvent = e as CustomEvent<NarratorProfile>;
      if (customEvent.detail) setCurrentVoice(customEvent.detail);
    };
    window.addEventListener('testament-voice-changed', handleVoiceChange);
    return () => window.removeEventListener('testament-voice-changed', handleVoiceChange);
  }, []);

  useEffect(() => {
    setCurrentTranslation(getDefaultTranslationForLanguage(language));
  }, [language]);

  useEffect(() => () => soundEngine.stopSpeaking(), []);

  const stopPreview = React.useCallback(() => {
    soundEngine.stopSpeaking();
    setPreviewingVoice(null);
  }, []);

  const closeSheet = React.useCallback(() => {
    stopPreview();
    setSheet(null);
  }, [stopPreview]);

  const handleBack = React.useCallback(() => {
    stopPreview();
    onBack();
  }, [onBack, stopPreview]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (sheet) closeSheet();
      else handleBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack, closeSheet, sheet]);

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

  const previewVoice = (voiceId: NarratorProfile) => {
    if (previewingVoice === voiceId) {
      stopPreview();
      return;
    }
    soundEngine.stopSpeaking();
    soundEngine.setNarratorProfile(voiceId);
    setCurrentVoice(voiceId);
    setPreviewingVoice(voiceId);
    soundEngine.speakVerse(VOICE_PREVIEW_BY_LANG[language] ?? VOICE_PREVIEW_BY_LANG.en, () => {
      setPreviewingVoice((v) => (v === voiceId ? null : v));
    });
  };

  const selectVoice = (voiceId: NarratorProfile) => {
    stopPreview();
    soundEngine.playClick();
    soundEngine.setNarratorProfile(voiceId);
    setCurrentVoice(voiceId);
  };

  const selectTranslation = (next: TranslationId) => {
    soundEngine.playClick();
    setCurrentTranslation(next);
    const currentPlace = loadReadingPlace();
    saveReadingPlace({
      bookId: currentPlace?.bookId || 'GEN',
      bookName: currentPlace?.bookName || 'Genesis',
      chapter: currentPlace?.chapter || 1,
      translation: next,
    });
    window.dispatchEvent(new CustomEvent('testament-translation-changed', { detail: { translation: next } }));
  };

  const setTheme = (theme: AppTheme) => {
    soundEngine.playClick();
    applyTheme(theme);
    setCurrentTheme(theme);
  };

  const languageLabel = (code: Language) =>
    code === 'en' ? t('settings.langEn') : code === 'es' ? t('settings.langEs') : t('settings.langFr');
  const stepIndex = Math.max(0, FONT_SCALE_STEPS.findIndex((s) => s.step === currentStep));
  const ambienceLabel = AMBIENCE_OPTIONS.find((a) => a.id === currentAmbience)?.label ?? 'Off';

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto overscroll-contain bg-surface text-fg">
      <header className="sticky top-0 z-10 bg-surface/90 backdrop-blur-md">
        <div className="max-w-xl mx-auto flex items-center gap-1 px-3 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
          <button
            ref={backRef}
            type="button"
            onClick={handleBack}
            className="w-11 h-11 rounded-full flex items-center justify-center text-fg-muted hover:bg-stone-100 dark:hover:bg-stone-850 transition-colors cursor-pointer"
            aria-label={t('story.back')}
          >
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
          </button>
          <h1 id="settings-page-title" className="text-title-1 text-fg truncate">
            {t('dashboard.settings')}
          </h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 sm:px-6 pb-[max(3rem,env(safe-area-inset-bottom))]">
        {/* Profile / progress card */}
        <button
          type="button"
          onClick={() => { soundEngine.playClick(); onOpenCollection?.(); }}
          disabled={!onOpenCollection}
          className="mt-3 w-full text-left rounded-3xl p-4 flex items-center gap-4 text-white dark:text-[#1A1306] bg-[linear-gradient(135deg,#1D3679_0%,#2F4FA3_70%,#4664B8_100%)] dark:bg-[linear-gradient(135deg,#E2B65E_0%,#D3A24C_60%,#9C7A3C_120%)] shadow-[0_14px_30px_-14px_rgba(35,64,142,0.7)] dark:shadow-[0_14px_30px_-14px_rgba(226,182,94,0.5)] cursor-pointer disabled:cursor-default"
        >
          <span className="w-14 h-14 rounded-full bg-white/20 dark:bg-black/10 border-2 border-white/35 dark:border-black/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" aria-hidden="true" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-serif text-lg font-bold">Your journey</span>
            <span className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs font-semibold opacity-90">
              <span className="inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-current" aria-hidden="true" />{streakCount} {streakCount === 1 ? 'day' : 'days'}</span>
              <span>{stats.stories} {stats.stories === 1 ? 'story' : 'stories'}</span>
              <span>{stats.cards} {stats.cards === 1 ? 'card' : 'cards'}</span>
            </span>
          </span>
          {onOpenCollection && <ChevronRight className="w-5 h-5 opacity-80 shrink-0" aria-hidden="true" />}
        </button>

        {/* Appearance */}
        <Group label="Appearance">
          <div className="grid grid-cols-2 gap-3 p-4" role="radiogroup" aria-label={t('settings.theme')}>
            {([
              { id: 'light' as AppTheme, label: t('settings.themeLight'), bg: '#F3F1EB', bar: '#121A2E', bar2: '#CBC5B6', dot: '#23408E' },
              { id: 'dark' as AppTheme, label: t('settings.themeDark'), bg: '#0A0F1E', bar: '#EEE7D6', bar2: '#344269', dot: '#E2B65E' },
            ]).map((opt) => {
              const on = currentTheme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setTheme(opt.id)}
                  className={`rounded-2xl p-2 border-[1.5px] text-center cursor-pointer transition-all ${
                    on ? 'border-accent ring-1 ring-accent text-accent-text' : 'border-line text-fg-secondary hover:border-line-strong'
                  }`}
                >
                  <span className="relative block h-16 rounded-xl overflow-hidden" style={{ background: opt.bg }} aria-hidden="true">
                    <span className="absolute left-2.5 right-8 top-3 h-1.5 rounded-full" style={{ background: opt.bar }} />
                    <span className="absolute left-2.5 right-14 top-6 h-1.5 rounded-full" style={{ background: opt.bar2 }} />
                    <span className="absolute right-2.5 bottom-2.5 w-6 h-3 rounded-full" style={{ background: opt.dot }} />
                  </span>
                  <span className="block mt-2 text-xs font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[15px] font-semibold">{t('fontSize.title')}</span>
              <span className="text-xs font-bold text-accent-text">{FONT_SCALE_STEPS[stepIndex]?.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-fg-muted" aria-hidden="true">A</span>
              <input
                type="range"
                min={0}
                max={FONT_SCALE_STEPS.length - 1}
                step={1}
                value={stepIndex}
                onChange={(e) => {
                  const next = FONT_SCALE_STEPS[Number(e.target.value)];
                  if (next) setFontScaleStep(next.step as FontScaleStep);
                }}
                aria-label={t('fontSize.title')}
                aria-valuetext={FONT_SCALE_STEPS[stepIndex]?.label}
                className="flex-1 h-11 accent-[rgb(var(--color-accent))] cursor-pointer"
              />
              <span className="text-xl font-bold text-fg-muted" aria-hidden="true">A</span>
            </div>
          </div>
        </Group>

        {/* Reading & listening */}
        <Group label="Reading & listening">
          <Row
            icon={<RowIcon tone={TONES.lapis}><BookOpen className="w-4 h-4" /></RowIcon>}
            title={t('settings.translation')}
            value={currentTranslation.toUpperCase()}
            onClick={() => setSheet('translation')}
          />
          <Row
            icon={<RowIcon tone={TONES.teal}><Globe className="w-4 h-4" /></RowIcon>}
            title={t('settings.language')}
            value={languageLabel(language).replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '').trim()}
            onClick={() => setSheet('language')}
          />
          <Row
            icon={<RowIcon tone={TONES.plum}><Mic className="w-4 h-4" /></RowIcon>}
            title={t('settings.narrationVoice')}
            value={NARRATOR_VOICES[currentVoice]?.name}
            onClick={() => setSheet('voice')}
          />
          {onOpenDriveMode && (
            <Row
              icon={<RowIcon tone={TONES.slate}><Car className="w-4 h-4" /></RowIcon>}
              title={t('nav.driveMode')}
              hint="Listen hands-free on the go"
              onClick={onOpenDriveMode}
            />
          )}
        </Group>

        {/* Daily rhythm */}
        <Group label="Daily rhythm">
          <Row
            icon={<RowIcon tone={TONES.gold}><Clock className="w-4 h-4" /></RowIcon>}
            title="Session"
            trailing={
              <div className="grid grid-cols-3 gap-0.5 p-0.5 rounded-xl bg-stone-100 dark:bg-stone-850 w-[168px] shrink-0" role="radiogroup" aria-label={t('settings.sessionLength')}>
                {([
                  { id: '3min', label: '3 min' },
                  { id: '10min', label: '10 min' },
                  { id: 'deep', label: 'Deep' },
                ] as { id: SessionLength; label: string }[]).map((option) => {
                  const on = sessionLength === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        soundEngine.playClick();
                        setSessionLength(option.id);
                        try { localStorage.setItem(SESSION_LENGTH_KEY, option.id); } catch { /* ignore */ }
                        window.dispatchEvent(new CustomEvent('testament-session-length-changed', { detail: option.id }));
                      }}
                      className={`min-h-[36px] rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
                        on ? 'bg-surface-raised dark:bg-stone-700 text-fg shadow-sm' : 'text-fg-muted'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            }
          />
          {onOpenReminders && (
            <Row
              icon={<RowIcon tone={TONES.clay}><Bell className="w-4 h-4" /></RowIcon>}
              title={t('notifications.settingsLink')}
              onClick={onOpenReminders}
            />
          )}
          {onSetAmbience && (
            <Row
              icon={<RowIcon tone={TONES.teal}><Wind className="w-4 h-4" /></RowIcon>}
              title="Ambient sound"
              value={ambienceLabel}
              onClick={() => setSheet('ambience')}
            />
          )}
          <Row
            icon={<RowIcon tone={TONES.lapis}><Volume2 className="w-4 h-4" /></RowIcon>}
            title={t('settings.sound')}
            hint={t('settings.soundHint')}
            trailing={
              <Switch
                on={soundOn}
                label={t('settings.sound')}
                onToggle={() => { const next = !soundOn; setSoundOn(next); setSoundEnabled(next); if (next) soundEngine.playSnap(); }}
              />
            }
          />
          <Row
            icon={<RowIcon tone={TONES.teal}><Smartphone className="w-4 h-4" /></RowIcon>}
            title={t('settings.haptics')}
            hint={t('settings.hapticsHint')}
            trailing={
              <Switch
                on={hapticsOn}
                label={t('settings.haptics')}
                onToggle={() => { const next = !hapticsOn; setHapticsOn(next); setHapticsEnabled(next); }}
              />
            }
          />
        </Group>

        {/* Your journey */}
        {(onOpenJournal || onOpenPeople || onOpenLearnerMode || onOpenOnboarding) && (
          <Group label="Your journey">
            {onOpenJournal && (
              <Row icon={<RowIcon tone={TONES.plum}><PenLine className="w-4 h-4" /></RowIcon>} title="Decision journal" onClick={onOpenJournal} />
            )}
            {onOpenPeople && (
              <Row icon={<RowIcon tone={TONES.gold}><Users className="w-4 h-4" /></RowIcon>} title="People & character arcs" onClick={onOpenPeople} />
            )}
            {(onOpenLearnerMode || onOpenOnboarding) && (
              <Row
                icon={<RowIcon tone={TONES.teal}><Target className="w-4 h-4" /></RowIcon>}
                title="My plan"
                hint={activeLearnerMode ? `Learner mode · ${activeLearnerMode}` : 'Learner mode and daily plan'}
                onClick={() => (onOpenLearnerMode ?? onOpenOnboarding)?.()}
              />
            )}
            {onOpenLearnerMode && onOpenOnboarding && (
              <Row icon={<RowIcon tone={TONES.lapis}><Sparkles className="w-4 h-4" /></RowIcon>} title="Set up my plan again" onClick={onOpenOnboarding} />
            )}
          </Group>
        )}

        {/* About */}
        <Group label="About">
          {onOpenHowItWorks && (
            <Row icon={<RowIcon tone={TONES.slate}><HelpCircle className="w-4 h-4" /></RowIcon>} title="How Testament works" onClick={onOpenHowItWorks} />
          )}
          <Row icon={<RowIcon tone={TONES.slate}><ShieldCheck className="w-4 h-4" /></RowIcon>} title="Privacy" href="/privacy.html" />
        </Group>

        <p className="text-center text-xs text-fg-muted mt-8">
          Testament {APP_VERSION}
          {onOpenWhatsNew && (
            <>
              {' · '}
              <button type="button" onClick={() => { soundEngine.playClick(); onOpenWhatsNew(); }} className="min-h-0 underline underline-offset-2 hover:text-fg cursor-pointer">
                What's new
              </button>
            </>
          )}
        </p>
      </div>

      {/* ---------- sheets ---------- */}
      {sheet === 'translation' && (
        <Sheet title={t('settings.translation')} onClose={closeSheet}>
          {BIBLE_TRANSLATIONS.map((tr) => (
            <Choice key={tr.id} selected={currentTranslation === tr.id} title={tr.label} onSelect={() => selectTranslation(tr.id as TranslationId)} />
          ))}
        </Sheet>
      )}

      {sheet === 'language' && (
        <Sheet title={t('settings.language')} onClose={closeSheet}>
          {(['en', 'es', 'fr'] as Language[]).map((code) => (
            <Choice
              key={code}
              selected={language === code}
              title={languageLabel(code)}
              onSelect={() => { soundEngine.playClick(); setLanguage(code); }}
            />
          ))}
        </Sheet>
      )}

      {sheet === 'voice' && (
        <Sheet title={t('settings.narrationVoice')} subtitle="Tap play to hear a voice, then pick one." onClose={closeSheet}>
          {(Object.keys(NARRATOR_VOICES) as NarratorProfile[]).map((vKey) => {
            const meta = NARRATOR_VOICES[vKey];
            const playing = previewingVoice === vKey;
            return (
              <Choice
                key={vKey}
                serif
                selected={currentVoice === vKey}
                title={meta.name}
                hint={meta.subtitle}
                onSelect={() => selectVoice(vKey)}
                leading={
                  <button
                    type="button"
                    onClick={() => previewVoice(vKey)}
                    aria-label={playing ? `Stop ${meta.name} preview` : `Preview ${meta.name}`}
                    className="w-10 h-10 min-h-0 rounded-full bg-amber-100 dark:bg-amber-500/15 text-accent-text flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    {playing ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                }
              />
            );
          })}
          <p className="text-xs leading-5 text-fg-muted pt-2">
            Narration uses the most natural voice installed on your device. For the best sound, use Microsoft Edge, Safari, or your phone's browser.
          </p>
        </Sheet>
      )}

      {sheet === 'ambience' && onSetAmbience && (
        <Sheet title="Ambient sound" subtitle="Plays quietly in the background while you read." onClose={closeSheet}>
          {AMBIENCE_OPTIONS.map((opt) => (
            <Choice
              key={opt.id}
              selected={currentAmbience === opt.id}
              title={opt.label}
              hint={opt.hint}
              onSelect={() => onSetAmbience(opt.id)}
            />
          ))}
        </Sheet>
      )}
    </div>
  );
};
