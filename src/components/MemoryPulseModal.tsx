import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Clock, 
  Brain, 
  Smartphone
} from 'lucide-react';
import type { MemoryVerse, RecallPromptStyle, NotificationSettings } from '../types';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  requestNotificationPermission, 
  getNotificationPermission, 
  sendTestMemoryNotification, 
  calculateDailySlots,
  setActiveMemoryVerse
} from '../utils/notificationEngine';
import { getAllVerses, getVerseById } from '../utils/verseRegistry';
import { soundEngine } from '../utils/audio';

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

  // Update calculated slots live when frequency or hours change
  const currentSlots = calculateDailySlots(
    settings.frequencyPerDay,
    settings.startHour,
    settings.endHour
  );

  const handleRequestPermission = async () => {
    soundEngine.playClick();
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    if (granted) {
      soundEngine.playVictory();
      setSettings(prev => ({ ...prev, enabled: true }));
    }
  };

  const handleFrequencyChange = (freq: number) => {
    soundEngine.playSnap();
    const updatedSlots = calculateDailySlots(freq, settings.startHour, settings.endHour);
    setSettings(prev => ({
      ...prev,
      frequencyPerDay: freq,
      scheduledSlots: updatedSlots
    }));
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

  const handleSaveAndActivate = () => {
    soundEngine.playVictory();
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
    onClose();
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 === 0 ? 12 : hour % 12;
    return `${h}:00 ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#0e1117] border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-glow-gold overflow-hidden my-auto max-h-[92vh] flex flex-col text-left"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-[#131720] to-stone-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-parchment-50 leading-tight">
                  Spaced Memory Pulse
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-400">
                  Non-invasive daily active-recall notifications
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-parchment-100 hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-parchment-100 scrollbar-none">
            
            {/* Target Verse Focus Card */}
            <div className="p-4 rounded-2xl bg-[#141822] border border-amber-500/30 relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Active Memory Target
                  </span>
                  {activeVerse.heroName && (
                    <span className="text-[10px] font-mono text-stone-400">
                      from {activeVerse.heroName}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setShowVerseSelector(!showVerseSelector)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
                >
                  {showVerseSelector ? 'Hide List' : 'Change Verse'}
                </button>
              </div>

              <h4 className="text-base sm:text-lg font-serif font-bold text-amber-300">
                {activeVerse.reference}
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 italic my-1.5 leading-relaxed">
                "{activeVerse.text}"
              </p>

              {/* Verse Selector Dropdown */}
              {showVerseSelector && (
                <div className="mt-3 pt-3 border-t border-stone-800 max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block mb-1">
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
                          ? 'bg-amber-600 text-black font-bold'
                          : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300'
                      }`}
                    >
                      <span className="truncate mr-2">
                        {v.heroName ? `[${v.heroName}] ` : ''}{v.reference}
                      </span>
                      <span className="text-[10px] opacity-75 shrink-0">{v.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Permission Banner */}
            {permission !== 'granted' && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="text-parchment-100 font-semibold">
                    Browser notification permission required
                  </p>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    Allow notifications so Testament can deliver your spaced recall prompts at scheduled intervals.
                  </p>
                  <button
                    onClick={handleRequestPermission}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Enable Push Notifications</span>
                  </button>
                </div>
              </div>
            )}

            {/* Frequency Selector: How many times a day? */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-300 flex items-center justify-between">
                <span>Reminders Per Day</span>
                <span className="text-amber-400 font-bold">{settings.frequencyPerDay} times daily</span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map(freq => (
                  <button
                    key={freq}
                    onClick={() => handleFrequencyChange(freq)}
                    className={`py-2 px-1 rounded-xl text-center border text-xs font-bold transition-all ${
                      settings.frequencyPerDay === freq
                        ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="text-sm font-black">{freq}x</div>
                    <div className="text-[9px] font-normal opacity-80">
                      {freq === 2 ? 'Morning/Eve' : freq === 3 ? 'Spaced (Rec)' : freq === 4 ? 'Steady' : 'Sprint'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Waking Hours Span */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-stone-300">
                <span className="font-bold uppercase tracking-wider">Waking Hours Window</span>
                <span className="text-amber-400 font-semibold">
                  {formatHour(settings.startHour)} – {formatHour(settings.endHour)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                  <label className="text-[10px] text-stone-400 block mb-1">Start Time</label>
                  <select
                    value={settings.startHour}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const updatedSlots = calculateDailySlots(settings.frequencyPerDay, val, settings.endHour);
                      setSettings(prev => ({ ...prev, startHour: val, scheduledSlots: updatedSlots }));
                    }}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {[6, 7, 8, 9, 10].map(h => (
                      <option key={h} value={h}>{formatHour(h)}</option>
                    ))}
                  </select>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                  <label className="text-[10px] text-stone-400 block mb-1">Quiet Cutoff (End)</label>
                  <select
                    value={settings.endHour}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const updatedSlots = calculateDailySlots(settings.frequencyPerDay, settings.startHour, val);
                      setSettings(prev => ({ ...prev, endHour: val, scheduledSlots: updatedSlots }));
                    }}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {[19, 20, 21, 22, 23].map(h => (
                      <option key={h} value={h}>{formatHour(h)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real-time schedule badges */}
              <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-stone-400">Scheduled:</span>
                {currentSlots.map((slot, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700">
                    {slot}
                  </span>
                ))}
              </div>
            </div>

            {/* Recall Prompt Style */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-300">
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
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      settings.recallStyle === item.id
                        ? 'bg-amber-600/20 border-amber-500 text-parchment-50 ring-1 ring-amber-500'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-amber-300">{item.title}</div>
                    <div className="text-[11px] text-stone-400 mt-0.5 leading-snug">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Reminder Trigger & Status */}
            <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verify on Your Device</span>
                </span>
                {testSentMessage && (
                  <span className="text-[11px] font-mono text-amber-400 animate-pulse">
                    {testSentMessage}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleSendTest(false)}
                  disabled={isSendingTest}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send Test Now</span>
                </button>

                <button
                  onClick={() => handleSendTest(true)}
                  disabled={isSendingTest}
                  title="Sends in 4 seconds so you can lock your screen or switch apps"
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test in 4s (Lock Screen)</span>
                </button>
              </div>

              <p className="text-[10px] text-stone-500 leading-normal">
                Tip: On iPhone/iPad, add Testament to your Home Screen first to receive notifications on your lock screen just like native apps.
              </p>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-stone-800 bg-[#0b0e13] flex items-center justify-between gap-3 shrink-0">
            {onOpenWordForge ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                  onOpenWordForge(selectedVerseId);
                }}
                className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1 font-medium transition-colors"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Practice in Word Forge</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveAndActivate}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-glow-amber flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Activate Reminders</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
