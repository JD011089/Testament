import { useEffect, useState } from 'react';
import { Bell, BellOff, Check, RefreshCw, Sparkles, Sun, Brain } from 'lucide-react';
import { FullPage } from './FullPage';
import { useLanguage } from '../context/LanguageContext';
import { soundEngine } from '../utils/audio';
import {
  getNotificationPermission,
  getNotificationPrefs,
  requestNotificationPermission,
  rescheduleNotificationAlarms,
  saveNotificationPrefs,
  sendTestDeviceNotification,
  type NotificationPermissionState,
  type NotificationPrefs,
} from '../utils/notificationPrefs';
import { formatTime12h } from '../utils/calendarReminders';
import { sendTestUpdateNotification } from '../utils/pwaUpdateEngine';

interface NotificationSettingsModalProps {
  onClose: () => void;
}

export function NotificationSettingsModal({ onClose }: NotificationSettingsModalProps) {
  const { t } = useLanguage();
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => getNotificationPrefs());
  const [permission, setPermission] = useState<NotificationPermissionState>(() => getNotificationPermission());
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPrefs(getNotificationPrefs());
    setPermission(getNotificationPermission());
    setToast(null);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  };

  const persist = async (patch: Partial<NotificationPrefs>) => {
    const next = saveNotificationPrefs(patch);
    setPrefs(next);
    await rescheduleNotificationAlarms(next);
    return next;
  };

  const enableDeviceNotifications = async () => {
    setBusy(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result === 'granted') {
        soundEngine.playVictory();
        const next = await persist({
          appUpdates: true,
          dailyMission: prefs.dailyMission || prefs.memoryPulse ? prefs.dailyMission : true,
        });
        await rescheduleNotificationAlarms(next);
        showToast(t('notifications.enabled'));
      } else if (result === 'denied') {
        soundEngine.playSnap();
        showToast(t('notifications.denied'));
      } else if (result === 'unsupported') {
        showToast(t('notifications.unsupported'));
      }
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (key: 'appUpdates' | 'dailyMission' | 'memoryPulse') => {
    soundEngine.playClick();
    if (permission !== 'granted') {
      await enableDeviceNotifications();
      if (getNotificationPermission() !== 'granted') return;
    }
    await persist({ [key]: !prefs[key] });
  };

  const handleTime = async (key: 'morningTime' | 'recallTime', value: string) => {
    if (!value) return;
    soundEngine.playClick();
    await persist({ [key]: value });
  };

  const handleTest = async () => {
    setBusy(true);
    try {
      if (permission !== 'granted') {
        await enableDeviceNotifications();
      }
      const ok = await sendTestDeviceNotification();
      showToast(ok ? t('notifications.testSent') : t('notifications.testFailed'));
    } finally {
      setBusy(false);
    }
  };

  const handleTestUpdate = async () => {
    setBusy(true);
    try {
      if (permission !== 'granted') {
        await enableDeviceNotifications();
      }
      if (!prefs.appUpdates) await persist({ appUpdates: true });
      const ok = await sendTestUpdateNotification();
      showToast(ok ? t('notifications.updateTestSent') : t('notifications.testFailed'));
    } finally {
      setBusy(false);
    }
  };

  const permissionLabel =
    permission === 'granted'
      ? t('notifications.permGranted')
      : permission === 'denied'
        ? t('notifications.permDenied')
        : permission === 'unsupported'
          ? t('notifications.unsupported')
          : t('notifications.permDefault');

  return (
    <FullPage title={t('notifications.title')} titleId="notification-settings-title" onBack={onClose}>
      <div className="space-y-6">
        <p className="text-base text-stone-600 dark:text-stone-300">
          {t('notifications.subtitle')}
        </p>

        <div
          className={`rounded-2xl border px-3.5 py-3 flex items-center justify-between gap-3 ${
            permission === 'granted'
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : permission === 'denied'
                ? 'border-red-400/40 bg-red-500/10'
                : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {permission === 'granted' ? (
              <Bell className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            ) : (
              <BellOff className="w-4 h-4 text-stone-500 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-stone-900 dark:text-parchment-50">{permissionLabel}</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">{t('notifications.usesDevice')}</div>
            </div>
          </div>
          {permission !== 'granted' && permission !== 'unsupported' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void enableDeviceNotifications()}
              className="btn-primary text-xs shrink-0 !min-h-10 px-3"
            >
              {t('notifications.enable')}
            </button>
          )}
          {permission === 'granted' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5" /> {t('notifications.on')}
            </span>
          )}
        </div>

        {permission === 'denied' && (
          <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
            {t('notifications.deniedHint')}
          </p>
        )}

        <div className="space-y-2">
          <ToggleRow
            icon={<RefreshCw className="w-4 h-4" />}
            title={t('notifications.appUpdates')}
            hint={t('notifications.appUpdatesHint')}
            checked={prefs.appUpdates}
            disabled={permission === 'unsupported'}
            onToggle={() => void toggle('appUpdates')}
          />
          <ToggleRow
            icon={<Sun className="w-4 h-4" />}
            title={t('notifications.dailyMission')}
            hint={t('notifications.dailyMissionHint', { time: formatTime12h(prefs.morningTime) })}
            checked={prefs.dailyMission}
            disabled={permission === 'unsupported'}
            onToggle={() => void toggle('dailyMission')}
          />
          {prefs.dailyMission && (
            <label className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 dark:border-stone-800 px-3 py-2 ml-2">
              <span className="text-xs text-stone-600 dark:text-stone-300">{t('notifications.morningTime')}</span>
              <input
                type="time"
                value={prefs.morningTime}
                onChange={(e) => void handleTime('morningTime', e.target.value)}
                className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 px-2 py-1.5 text-xs font-mono min-h-[40px]"
              />
            </label>
          )}
          <ToggleRow
            icon={<Brain className="w-4 h-4" />}
            title={t('notifications.memoryPulse')}
            hint={t('notifications.memoryPulseHint', { time: formatTime12h(prefs.recallTime) })}
            checked={prefs.memoryPulse}
            disabled={permission === 'unsupported'}
            onToggle={() => void toggle('memoryPulse')}
          />
          {prefs.memoryPulse && (
            <label className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 dark:border-stone-800 px-3 py-2 ml-2">
              <span className="text-xs text-stone-600 dark:text-stone-300">{t('notifications.recallTime')}</span>
              <input
                type="time"
                value={prefs.recallTime}
                onChange={(e) => void handleTime('recallTime', e.target.value)}
                className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 px-2 py-1.5 text-xs font-mono min-h-[40px]"
              />
            </label>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            disabled={busy || permission === 'unsupported'}
            onClick={() => void handleTest()}
            className="btn-secondary flex-1 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('notifications.sendTest')}
          </button>
          <button
            type="button"
            disabled={busy || permission === 'unsupported'}
            onClick={() => void handleTestUpdate()}
            className="btn-quiet flex-1 text-xs border border-stone-200 dark:border-stone-800"
          >
            {t('notifications.sendUpdateTest')}
          </button>
        </div>

        {toast && (
          <p className="text-center text-base font-medium text-amber-800 dark:text-amber-300 animate-fadeIn">
            {toast}
          </p>
        )}
      </div>
    </FullPage>
  );
}

function ToggleRow({
  icon,
  title,
  hint,
  checked,
  disabled,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 px-3.5 py-3 flex items-center justify-between gap-3">
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="mt-0.5 text-amber-700 dark:text-amber-400 shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-stone-900 dark:text-parchment-50">{title}</div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{hint}</div>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onToggle}
        className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 disabled:opacity-40 ${
          checked ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
