import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  X, 
  Clock, 
  Check, 
  ExternalLink, 
  Download, 
  Sparkles,
  Sun,
  Brain
} from 'lucide-react';
import { useModalLock } from '../utils/useModalLock';
import type { MemoryVerse } from '../types';
import { 
  getCalendarReminderPrefs, 
  saveCalendarReminderPrefs, 
  getGoogleCalendarUrl, 
  downloadCalendarIcs,
  formatTime12h,
  type ReminderType 
} from '../utils/calendarReminders';
import { soundEngine } from '../utils/audio';

interface CalendarRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ReminderType;
  targetVerse?: MemoryVerse | null;
  onOpenWordForge?: (verseId: string) => void;
}

export const CalendarRemindersModal: React.FC<CalendarRemindersModalProps> = ({
  isOpen,
  onClose,
  initialType = 'morning',
  targetVerse,
  onOpenWordForge
}) => {
  const modalRef = useModalLock(isOpen);
  const [activeTab, setActiveTab] = useState<ReminderType>(initialType);
  const [morningTime, setMorningTime] = useState<string>('07:00');
  const [recallTime, setRecallTime] = useState<string>('12:30');
  const [feedback, setFeedback] = useState<{ type: 'google' | 'ics'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const prefs = getCalendarReminderPrefs();
      setMorningTime(prefs.morningTime);
      setRecallTime(prefs.recallTime);
      setActiveTab(initialType);
      setFeedback(null);
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const handleTimeChange = (type: ReminderType, newTime: string) => {
    if (!newTime) return;
    if (type === 'morning') {
      setMorningTime(newTime);
      saveCalendarReminderPrefs({ morningTime: newTime });
    } else {
      setRecallTime(newTime);
      saveCalendarReminderPrefs({ recallTime: newTime });
    }
  };

  const handleAddToGoogle = (type: ReminderType) => {
    soundEngine.playClick();
    const time = type === 'morning' ? morningTime : recallTime;
    const url = getGoogleCalendarUrl(type, { 
      time, 
      verseRef: targetVerse?.reference 
    });
    setFeedback({
      type: 'google',
      message: 'Opening Google Calendar to save your recurring reminder.'
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadIcs = (type: ReminderType) => {
    soundEngine.playVictory();
    const time = type === 'morning' ? morningTime : recallTime;
    downloadCalendarIcs(type, { 
      time, 
      verseRef: targetVerse?.reference 
    });
    setFeedback({
      type: 'ics',
      message: 'Downloaded calendar file (.ics). Open it to add to Apple or Outlook Calendar.'
    });
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-reminders-title"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-lg bg-parchment-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden text-stone-900 dark:text-parchment-100 my-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Calendar aria-hidden="true" className="w-5 h-5" />
              </div>
              <div>
                <h2 id="calendar-reminders-title" className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50 leading-tight">
                  Daily Calendar Reminders
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                  Calm, recurring calendar slots. No push spam, zero guilt.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close reminders modal"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 bg-stone-200/70 dark:bg-stone-800/80 rounded-2xl mb-5 text-xs font-semibold" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'morning'}
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('morning');
                setFeedback(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'morning'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-parchment-50 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Sun aria-hidden="true" className="w-3.5 h-3.5 text-amber-500" />
              <span>Today's Mission</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'recall'}
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('recall');
                setFeedback(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'recall'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-parchment-50 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Brain aria-hidden="true" className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verse Recall</span>
            </button>
          </div>

          {/* Active Reminder Content */}
          {activeTab === 'morning' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-100/80 dark:bg-stone-850/60 border border-stone-200/70 dark:border-stone-800/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold block">
                      Daily Morning Routine
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-parchment-100 mt-0.5">
                      Today's Mission — Testament
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300 bg-stone-200 dark:bg-stone-800 px-2.5 py-1 rounded-lg">
                    {formatTime12h(morningTime)}
                  </span>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 italic">
                  &ldquo;No 40-minute reading plans. Just today's mission.&rdquo;
                </p>

                {/* Time Picker */}
                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between gap-2">
                  <label htmlFor="morning-time-input" className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Clock aria-hidden="true" className="w-3.5 h-3.5 text-stone-400" />
                    <span>Reminder time:</span>
                  </label>
                  <input
                    id="morning-time-input"
                    type="time"
                    value={morningTime}
                    onChange={(e) => handleTimeChange('morning', e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs font-mono font-bold text-stone-900 dark:text-parchment-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">Presets:</span>
                  {['06:30', '07:00', '08:00', '09:00'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleTimeChange('morning', preset)}
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                        morningTime === preset
                          ? 'bg-amber-500 text-stone-950 font-bold border-amber-500'
                          : 'bg-stone-200/50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300/50 dark:border-stone-700 hover:border-amber-400'
                      }`}
                    >
                      {formatTime12h(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleAddToGoogle('morning')}
                  className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <ExternalLink aria-hidden="true" className="w-4 h-4" />
                  <span>Add to Google Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadIcs('morning')}
                  className="py-3 px-4 rounded-2xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-900 dark:text-parchment-100 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download aria-hidden="true" className="w-4 h-4" />
                  <span>Apple / Outlook (.ics)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-100/80 dark:bg-stone-850/60 border border-stone-200/70 dark:border-stone-800/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold block">
                      Daily Verse Recall
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-parchment-100 mt-0.5">
                      Still got yesterday's verse? — Testament
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300 bg-stone-200 dark:bg-stone-800 px-2.5 py-1 rounded-lg">
                    {formatTime12h(recallTime)}
                  </span>
                </div>

                {targetVerse && (
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/60 text-xs">
                    <span className="font-serif font-bold text-amber-800 dark:text-amber-400 block">
                      {targetVerse.reference}
                    </span>
                    <p className="text-stone-600 dark:text-stone-300 line-clamp-2 mt-0.5 italic">
                      &ldquo;{targetVerse.text}&rdquo;
                    </p>
                  </div>
                )}

                <p className="text-xs text-stone-600 dark:text-stone-300 italic">
                  &ldquo;Take 30 seconds to recall yesterday's verse.&rdquo;
                </p>

                {/* Time Picker */}
                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between gap-2">
                  <label htmlFor="recall-time-input" className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Clock aria-hidden="true" className="w-3.5 h-3.5 text-stone-400" />
                    <span>Reminder time:</span>
                  </label>
                  <input
                    id="recall-time-input"
                    type="time"
                    value={recallTime}
                    onChange={(e) => handleTimeChange('recall', e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs font-mono font-bold text-stone-900 dark:text-parchment-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">Presets:</span>
                  {['12:00', '12:30', '13:00', '18:00'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleTimeChange('recall', preset)}
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                        recallTime === preset
                          ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                          : 'bg-stone-200/50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300/50 dark:border-stone-700 hover:border-emerald-400'
                      }`}
                    >
                      {formatTime12h(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleAddToGoogle('recall')}
                  className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <ExternalLink aria-hidden="true" className="w-4 h-4" />
                  <span>Add to Google Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadIcs('recall')}
                  className="py-3 px-4 rounded-2xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-900 dark:text-parchment-100 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download aria-hidden="true" className="w-4 h-4" />
                  <span>Apple / Outlook (.ics)</span>
                </button>
              </div>

              {targetVerse && onOpenWordForge && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenWordForge(targetVerse.id);
                      onClose();
                    }}
                    className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    Practice {targetVerse.reference} now in WordForge →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Feedback Message */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-2xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-500/30"
            >
              <Check aria-hidden="true" className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{feedback.message}</span>
            </motion.div>
          )}

          {/* Calming Zero-Guilt Philosophy Note */}
          <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
            <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Recurring daily event. You can edit, adjust, or delete it anytime right inside your calendar app.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
