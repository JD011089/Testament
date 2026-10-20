import { useMemo, useState } from 'react';
import { celebrate } from '../../utils/feedback';
import { markFirstRunDone, saveReminderTime } from '../../utils/firstRun';
import { useLanguage } from '../../context/LanguageContext';
import { useModalLock } from '../../utils/useModalLock';
import { Play, Layers, Bell, Sparkles } from 'lucide-react';

interface FirstRunProps {
  onDone: () => void;
}

export function FirstRun({ onDone }: FirstRunProps) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [reminder, setReminder] = useState('08:00');
  const rootRef = useModalLock(true);
  const screens = useMemo(() => [
    { icon: <Play className="w-8 h-8" />, title: t('firstRun.s1.title'), body: t('firstRun.s1.body') },
    { icon: <Layers className="w-8 h-8" />, title: t('firstRun.s2.title'), body: t('firstRun.s2.body') },
    { icon: <Bell className="w-8 h-8" />, title: t('firstRun.s3.title'), body: t('firstRun.s3.body') },
  ], [t]);
  const isLast = index === screens.length - 1;
  const screen = screens[index];

  const finish = () => {
    if (isLast) {
      saveReminderTime(reminder);
    }
    celebrate('tap');
    if (isLast) {
      markFirstRunDone();
      onDone();
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 bg-bg text-fg flex flex-col overscroll-none touch-pan-y">
      <div className="flex-1 max-w-md mx-auto w-full px-6 flex flex-col justify-center gap-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/15 border border-accent/40 flex items-center justify-center text-accent">
          {screen.icon}
        </div>
        <h1 className="text-title-1 font-serif text-fg">{screen.title}</h1>
        <p className="text-body text-fg-muted">{screen.body}</p>

        {isLast && (
          <label className="space-y-2 text-left">
            <span className="text-small text-fg-muted">{t('firstRun.reminderLabel')}</span>
            <input
              type="time"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-line bg-surface-raised px-3 text-body text-fg"
            />
          </label>
        )}
      </div>

      <div className="px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] max-w-sm mx-auto w-full space-y-3">
        <div className="flex items-center justify-center gap-2" aria-hidden="true">
          {screens.map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i === index ? 'bg-accent' : 'bg-line'}`} />
          ))}
        </div>
        <button type="button" onClick={finish} className="btn-primary w-full inline-flex items-center justify-center gap-2">
          {isLast ? <><Sparkles className="w-4 h-4" /> {t('firstRun.start')}</> : t('firstRun.next')}
        </button>
        <button type="button" onClick={() => { markFirstRunDone(); onDone(); }} className="btn-quiet mx-auto">
          {t('firstRun.skip')}
        </button>
      </div>
    </div>
  );
}
