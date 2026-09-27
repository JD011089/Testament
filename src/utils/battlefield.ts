import { getCampaignDateKey } from '../data/dailyCampaigns';

const KEY = 'testament_todays_battlefield';

/** Today's check-in only. A saved id from another day is ignored. */
export const getTodayBattlefieldId = (): string | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const today = getCampaignDateKey();
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw) as { id?: unknown; date?: unknown };
      if (parsed?.date === today && typeof parsed.id === 'string') return parsed.id;
      return null;
    }
    localStorage.setItem(KEY, JSON.stringify({ id: raw, date: today }));
    return raw;
  } catch {
    return null;
  }
};

export const setTodayBattlefieldId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(KEY, JSON.stringify({ id, date: getCampaignDateKey() }));
    } else {
      localStorage.removeItem(KEY);
    }
    window.dispatchEvent(new CustomEvent('testament-battlefield-changed', { detail: { battlefieldId: id } }));
  } catch {
    // ignore quota failures
  }
};
