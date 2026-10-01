import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Clock, 
  Brain, 
  Smartphone, 
  Sparkles,
  Plus,
  Trash2,
  BookMarked
} from 'lucide-react';
import { useModalLock } from '../utils/useModalLock';
import type { MemoryVerse, RecallPromptStyle, NotificationSettings } from '../types';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  requestNotificationPermission, 
  getNotificationPermission, 
  sendTestMemoryNotification, 
  setActiveMemoryVerse,
  getNextScheduledReminder,
  formatSlot12h,
  syncNextAlarmToServiceWorker,
  saveCustomScheduledSlots,
  getTrainingVerseQueue
} from '../utils/notificationEngine';
import { sendTestUpdateNotification } from '../utils/pwaUpdateEngine';
import { getAllVerses, getVerseById } from '../utils/verseRegistry';
import { soundEngine } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

interface MemoryPulseModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVerse?: MemoryVerse | null;
  onOpenWordForge?: (verseId: string) => void;
}

export const MemoryPulseModal: React.FC<MemoryPulseModalProps> = ({
  isOpen,
  onClose,
  targetVerse,
  onOpenWordForge
}) => {
  const { t } = useLanguage();
  const modalRef = useModalLock(isOpen);
  const [settings, setSettings] = useState<NotificationSettings>(() => getNotificationSettings());
  const [permission, setPermission] = useState<NotificationPermission>(() => getNotificationPermission());
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);
  const [selectedVerseId, setSelectedVerseId] = useState<string>(() => {
    return targetVerse?.id || getNotificationSettings().activeVerseId || 'verse-1';
  });
  const [showVerseSelector, setShowVerseSelector] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevTargetVerseId, setPrevTargetVerseId] = useState(targetVerse?.id);

  const allVerses = getAllVerses();
  const activeVerse = getVerseById(selectedVerseId) || allVerses[0];

  if (isOpen !== prevIsOpen || targetVerse?.id !== prevTargetVerseId) {
    setPrevIsOpen(isOpen);
    setPrevTargetVerseId(targetVerse?.id);
    if (isOpen) {
      setPermission(getNotificationPermission());
      setSettings(getNotificationSettings());
      if (targetVerse?.id) {
        setSelectedVerseId(targetVerse.id);
      }
      setTestSentMessage(null);
    }
  }

  const nextReminder = getNextScheduledReminder();

  const handleRequestPermission = async () => {
    soundEngine.playClick();
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    if (granted) {
      soundEngine.playVictory();
      setSettings(prev => ({ ...prev, enabled: true }));
    }
  };

  const trainingQueue = getTrainingVerseQueue();

  const handleUpdateSlotTime = (index: number, newTime: string) => {
    if (!newTime) return;
    soundEngine.playSnap();
    const existing = [...(settings.scheduledSlots || [])];
    existing[index] = newTime;
    const updated = saveCustomScheduledSlots(existing);
    setSettings(updated);
  };

  const handleAddCustomSlot = () => {
    soundEngine.playSnap();
    const existing = settings.scheduledSlots || [];
    const newTime = existing.length > 0 ? '16:00' : '09:00';
    const updated = saveCustomScheduledSlots([...existing, newTime]);
    setSettings(updated);
  };

  const handleRemoveCustomSlot = (index: number) => {
    soundEngine.playSnap();
    const existing = settings.scheduledSlots || [];
    if (existing.length <= 1) return;
    const updated = existing.filter((_, i) => i !== index);
    const updatedSettings = saveCustomScheduledSlots(updated);
    setSettings(updatedSettings);
  };

  const handlePromptStyleChange = (style: RecallPromptStyle) => {
    soundEngine.playSnap();
    setSettings(prev => ({ ...prev, recallStyle: style }));
  };

  const handleSendTest = async (withDelay = false) => {
    soundEngine.playClick();
    setIsSendingTest(true);
    setTestSentMessage(withDelay ? 'Lock your screen! Reminder in 4 seconds...' : 'Reminder dispatched!');

    // First ensure permission is active
    if (permission !== 'granted') {
      const granted = await requestNotificationPermission();
      setPermission(getNotificationPermission());
      if (!granted) {
        setIsSendingTest(false);
        setTestSentMessage('Please allow notifications in browser first.');
        return;
      }
    }

    // Save active verse first
    setActiveMemoryVerse(selectedVerseId, {
      frequencyPerDay: settings.frequencyPerDay,
      startHour: settings.startHour,
      endHour: settings.endHour,
      recallStyle: settings.recallStyle
    });

    const success = await sendTestMemoryNotification(withDelay ? 4 : 0);
    setIsSendingTest(false);
    if (success) {
      soundEngine.playVictory();
      setTestSentMessage(withDelay ? 'Dispatched! Check lock screen.' : 'Notification sent to your device!');
    } else {
      setTestSentMessage('Unable to display. Check browser notification permissions.');
    }
  };

  const handleTestUpdatePush = async () => {
    soundEngine.playClick();
    setIsSendingTest(true);
    setTestSentMessage('Dispatching update notification...');

    if (permission !== 'granted') {
      const granted = await requestNotificationPermission();
      setPermission(getNotificationPermission());
      if (!granted) {
        setIsSendingTest(false);
        setTestSentMessage('Please allow notifications in browser first.');
        return;
      }
    }

    const success = await sendTestUpdateNotification();
    setIsSendingTest(false);
    if (success) {
      soundEngine.playVictory();
      setTestSentMessage('✓ Update notification dispatched! Tap to test reload.');
    } else {
      setTestSentMessage('Unable to display. Check system notification settings.');
    }
  };

  const handleSaveAndActivate = async () => {
    soundEngine.playVictory();
    if (permission !== 'granted') {
      const granted = await requestNotificationPermission();
      setPermission(getNotificationPermission());
      if (!granted) {
        setTestSentMessage('Please allow notifications in browser first.');
        return;
      }
    }
    const updated = setActiveMemoryVerse(selectedVerseId, {
      frequencyPerDay: settings.frequencyPerDay,
      startHour: settings.startHour,
      endHour: settings.endHour,
      recallStyle: settings.recallStyle
    });
    saveNotificationSettings({
      ...updated,
      enabled: true
    });
    await syncNextAlarmToServiceWorker();
    onClose();
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
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain"
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
          className="relative w-full max-w-lg h-[100dvh] sm:h-auto sm:max-h-[92vh] bg-white dark:bg-ink-raised border-0 sm:border border-amber-400 dark:border-amber-500/40 rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl overflow-hidden my-auto flex flex-col text-left text-stone-900 dark:text-parchment-100 outline-none"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-stone-200/60 dark:border-stone-800 bg-stone-50 dark:bg-gradient-to-r dark:from-stone-900 dark:via-[#131720] dark:to-stone-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-800 dark:text-amber-400">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50 leading-tight">
                  {t('pulse.title')}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">
                  {t('pulse.subtitle')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-parchment-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-800 dark:text-parchment-100 scrollbar-none">
            
            {/* Target Verse Focus Card */}
            <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-ink-overlay relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300">
                    {t('pulse.activeTarget')}
                  </span>
                  {activeVerse.heroName && (
                    <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      {t('pulse.fromHero', { hero: activeVerse.heroName })}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setShowVerseSelector(!showVerseSelector)}
                  className="text-xs text-amber-800 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-semibold underline underline-offset-2"
                >
                  {showVerseSelector ? t('pulse.hideList') : t('pulse.changeVerse')}
                </button>
              </div>

              <h4 className="text-base sm:text-lg font-serif font-bold text-amber-800 dark:text-amber-300">
                {activeVerse.reference}
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 italic my-1.5 leading-relaxed">
                "{activeVerse.text}"
              </p>

              {/* Verse Selector Dropdown */}
              {showVerseSelector && (
                <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-800 max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  <span className="text-[11px] uppercase font-mono font-bold text-stone-500 dark:text-stone-400 block mb-1">
                    Select any verse from quests or arsenal:
                  </span>
                  {allVerses.map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        soundEngine.playSnap();
                        setSelectedVerseId(v.id);
                        setShowVerseSelector(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        v.id === selectedVerseId
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'bg-stone-200/60 dark:bg-stone-900/80 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="truncate mr-2">
                        {v.heroName ? `[${v.heroName}] ` : ''}{v.reference}
                      </span>
                      <span className="text-[11px] opacity-75 shrink-0">{v.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Permission Banner */}
            {permission !== 'granted' && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-800 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="text-stone-900 dark:text-parchment-100 font-semibold">
                    Browser notification permission required
                  </p>
                  <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                    Allow notifications so Testament can deliver your spaced recall prompts at scheduled intervals.
                  </p>
                  <button
                    onClick={handleRequestPermission}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Enable Push Notifications</span>
                  </button>
                </div>
              </div>
            )}

            {/* Custom Daily Reminder Schedule (User Freedom: No Forced Times) */}
            <div className="space-y-3 p-4 rounded-2xl bg-stone-100/70 dark:bg-ink-overlay border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900 dark:text-parchment-100 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Your Custom Reminder Times</span>
                  </h5>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    You choose the exact times you want to be reminded. No forced schedules.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50">
                  {(settings.scheduledSlots || []).length} Daily
                </span>
              </div>

              {/* Slot list with native time pickers */}
              <div className="space-y-2">
                {(settings.scheduledSlots || []).map((slot, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-stone-500 dark:text-stone-400 w-16">
                        Slot {idx + 1}:
                      </span>
                      <input
                        type="time"
                        value={slot}
                        onChange={(e) => handleUpdateSlotTime(idx, e.target.value)}
                        className="bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-parchment-100 text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="text-xs font-mono text-amber-800 dark:text-amber-400 font-bold ml-1">
                        ({formatSlot12h(slot)})
                      </span>
                    </div>

                    {(settings.scheduledSlots || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomSlot(idx)}
                        title="Remove this reminder time"
                        className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Slot Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleAddCustomSlot}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Reminder Time</span>
                </button>

                {nextReminder && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-800 dark:text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Next: <strong>{nextReminder.label}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Verses in Daily Rotation (Multi-verse training queue) */}
            <div className="space-y-2 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                    Verses in Rotation ({trainingQueue.length})
                  </h5>
                </div>
                <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                  Rotates per prompt
                </span>
              </div>

              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                Reminders rotate through all your saved training verses across your daily times, so each reminder tests a different scripture throughout the day.
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {trainingQueue.map((verse) => (
                  <span
                    key={verse.id}
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs"
                  >
                    <span>⚔️</span>
                    <span>{verse.reference}</span>
                  </span>
                ))}
              </div>

              {trainingQueue.length <= 1 && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 italic pt-1">
                  Tip: Bookmark or practice verses in Word Forge or the 66-Book Canon to add them to your daily training rotation.
                </p>
              )}
            </div>

            {/* Recall Prompt Style */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Gentle Recall Prompt Style
              </label>

              <div className="space-y-1.5 text-xs">
                {[
                  {
                    id: 'cue' as RecallPromptStyle,
                    title: 'Opening Cue (Recommended)',
                    desc: 'Shows the first few words to jog memory, asks you to finish the rest.'
                  },
                  {
                    id: 'cloze' as RecallPromptStyle,
                    title: 'First-Letter Cloze',
                    desc: 'Blanks out letters: "H___ I n__ c________..." for active cognitive retrieval.'
                  },
                  {
                    id: 'stealth' as RecallPromptStyle,
                    title: 'Stealth Challenge',
                    desc: 'Shows only the reference: asks you to recite in silence before checking.'
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handlePromptStyleChange(item.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      settings.recallStyle === item.id
                        ? 'bg-amber-500/20 text-stone-950 dark:text-parchment-50 font-semibold shadow-xs'
                        : 'bg-stone-100/70 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="font-semibold text-xs text-amber-800 dark:text-amber-300">{item.title}</div>
                    <div className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 leading-snug">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Reminder Trigger & Status */}
            <div className="p-3.5 rounded-2xl bg-stone-100/70 dark:bg-stone-900/90 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800 dark:text-stone-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                  <span>Verify on Your Device</span>
                </span>
                {testSentMessage && (
                  <span className="text-[11px] font-mono text-amber-800 dark:text-amber-400 animate-pulse">
                    {testSentMessage}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => handleSendTest(false)}
                  disabled={isSendingTest}
                  className="p-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                  <span>Test Verse Now</span>
                </button>

                <button
                  onClick={() => handleSendTest(true)}
                  disabled={isSendingTest}
                  title="Sends in 4 seconds so you can lock your screen or switch apps"
                  className="p-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                  <span>Lock Screen (4s)</span>
                </button>

                <button
                  onClick={handleTestUpdatePush}
                  disabled={isSendingTest}
                  title="Simulate the system push notification for new app updates"
                  className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-stone-950 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                  <span>Test Update Push</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-500 leading-normal">
                Tip: On iPhone/iPad, add Testament to your Home Screen first to receive notifications on your lock screen just like native apps.
              </p>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-stone-200/60 dark:border-stone-800 bg-stone-50 dark:bg-ink flex items-center justify-between gap-3 shrink-0">
            {onOpenWordForge ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                  onOpenWordForge(selectedVerseId);
                }}
                className="text-xs text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1 font-medium transition-colors"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>{t('arsenal.practice')}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              >
                {t('pulse.cancel')}
              </button>

              <button
                onClick={handleSaveAndActivate}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('pulse.activate')}</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
