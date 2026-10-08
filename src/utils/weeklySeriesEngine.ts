import { 
  WEEKLY_SERIES, 
  type WeeklySeries, 
  type SeriesMoment, 
  getWeeklySeriesById 
} from '../data/weeklySeries';
import { getTodayDateKey } from './dailyEngine';

const ACTIVE_SERIES_STORAGE_KEY = 'testament_active_series_state';

export interface ActiveSeriesState {
  seriesId: string;
  startDateKey: string; // YYYY-MM-DD when this series run began
  completedMomentIds: string[]; // List of completed moment IDs in this series
  lastCompletedDateKey?: string;
}

/**
 * Returns the currently active series state from localStorage, or null if no series is chosen.
 */
export function getActiveSeriesState(): ActiveSeriesState | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(ACTIVE_SERIES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveSeriesState;
    if (parsed && parsed.seriesId && getWeeklySeriesById(parsed.seriesId)) {
      return parsed;
    }
  } catch {
    // ignore parse error
  }
  return null;
}

/**
 * Saves active series state to localStorage.
 */
export function saveActiveSeriesState(state: ActiveSeriesState | null): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    if (!state) {
      localStorage.removeItem(ACTIVE_SERIES_STORAGE_KEY);
    } else {
      localStorage.setItem(ACTIVE_SERIES_STORAGE_KEY, JSON.stringify(state));
    }
    window.dispatchEvent(new CustomEvent('testament-series-changed', { detail: state }));
  } catch {
    // ignore
  }
}

/**
 * Starts or switches to a series.
 * Per spec: "User picks a series → it starts today at day 1 and runs to Sunday."
 * "Switching mid-week restarts the new series at day 1. Simple, predictable."
 */
export function startWeeklySeries(seriesId: string): ActiveSeriesState | null {
  const series = getWeeklySeriesById(seriesId);
  if (!series) return null;

  const todayKey = getTodayDateKey();
  const newState: ActiveSeriesState = {
    seriesId,
    startDateKey: todayKey,
    completedMomentIds: []
  };

  saveActiveSeriesState(newState);
  return newState;
}

/**
 * Clears the active series so the user returns to the default daily rotation.
 */
export function clearActiveSeries(): void {
  saveActiveSeriesState(null);
}

/**
 * Calculates how many calendar days have passed between two YYYY-MM-DD keys.
 */
function getDayDifference(startDateKey: string, targetDateKey: string): number {
  try {
    const [sY, sM, sD] = startDateKey.split('-').map(Number);
    const [tY, tM, tD] = targetDateKey.split('-').map(Number);
    const sDate = new Date(sY, sM - 1, sD).getTime();
    const tDate = new Date(tY, tM - 1, tD).getTime();
    const diffDays = Math.round((tDate - sDate) / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 0;
  }
}

/**
 * Returns which day (1 to 7) in the series applies today (or with dayOffset).
 */
export function getSeriesDayNumber(state: ActiveSeriesState, dayOffset = 0): number {
  const todayKey = getTodayDateKey();
  const diff = getDayDifference(state.startDateKey, todayKey) + dayOffset;
  // Day 1 is the start day; clamp between 1 and 7
  const dayNum = Math.min(Math.max(1, 1 + diff), 7);
  return dayNum;
}

/**
 * Returns today's series moment if an active series is selected, or null if no series is active.
 */
export function getActiveSeriesMoment(dayOffset = 0): SeriesMoment | null {
  const state = getActiveSeriesState();
  if (!state) return null;

  const series = getWeeklySeriesById(state.seriesId);
  if (!series || !series.moments.length) return null;

  const dayNumber = getSeriesDayNumber(state, dayOffset);
  const moment = series.moments.find(m => m.dayNumber === dayNumber) || series.moments[0];
  return moment;
}

/**
 * Marks a series moment completed.
 */
export function markSeriesMomentCompleted(momentId: string): void {
  const state = getActiveSeriesState();
  if (!state) return;

  if (!state.completedMomentIds.includes(momentId)) {
    state.completedMomentIds.push(momentId);
    state.lastCompletedDateKey = getTodayDateKey();
    saveActiveSeriesState(state);
  }
}

export interface SeriesOverviewItem {
  series: WeeklySeries;
  isActive: boolean;
  currentDay: number; // 1-7
  completedCount: number;
  progressPercent: number;
}

/**
 * Returns list of all series with current user progress for the Series Picker UI.
 */
export function getSeriesPickerList(): SeriesOverviewItem[] {
  const state = getActiveSeriesState();

  return WEEKLY_SERIES.map(series => {
    const isActive = state?.seriesId === series.id;
    const completedCount = isActive ? state.completedMomentIds.length : 0;
    const currentDay = isActive ? getSeriesDayNumber(state) : 1;
    const progressPercent = Math.round((completedCount / 7) * 100);

    return {
      series,
      isActive,
      currentDay,
      completedCount,
      progressPercent
    };
  });
}
