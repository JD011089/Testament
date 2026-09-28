/**
 * iOS home-screen PWAs ignore window.location.reload(), and they drop
 * location changes that happen in a timer after the tap. A same-document
 * link navigation with a fresh query is the reload WebKit actually performs.
 */

export const RELOAD_QUERY_KEY = 'testament_reload';
const GUARD_KEY = 'testament_sw_reloaded';
const GUARD_MS = 12000;

export function isIosDevice(userAgent = '', platform = '', maxTouchPoints = 0): boolean {
  const iOS = /iPad|iPhone|iPod/i.test(userAgent);
  const iPadOs = platform === 'MacIntel' && maxTouchPoints > 1;
  return iOS || iPadOs;
}

export function isIosDeviceNow(): boolean {
  if (typeof navigator === 'undefined') return false;
  return isIosDevice(navigator.userAgent || '', navigator.platform || '', navigator.maxTouchPoints || 0);
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true
    || window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches;
}

/** Home-screen iOS web apps need a real navigation, not location.reload(). */
export function needsGestureNavigation(): boolean {
  return isIosDeviceNow() && isStandaloneDisplay();
}

export function buildReloadUrl(href: string, now = Date.now()): string {
  const url = new URL(href);
  url.searchParams.set(RELOAD_QUERY_KEY, String(now));
  return url.toString();
}

export function stripReloadParam(href: string): string | null {
  const url = new URL(href);
  if (!url.searchParams.has(RELOAD_QUERY_KEY)) return null;
  url.searchParams.delete(RELOAD_QUERY_KEY);
  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ''}${url.hash}`;
}

export function markReloadGuard(now = Date.now()): void {
  try {
    localStorage.setItem(GUARD_KEY, String(now));
  } catch {
    // private mode
  }
}

export function reloadGuarded(now = Date.now()): boolean {
  try {
    const last = Number(localStorage.getItem(GUARD_KEY) || 0);
    return Number.isFinite(last) && now - last < GUARD_MS;
  } catch {
    return false;
  }
}

export function reloadAppDocument(): void {
  markReloadGuard();
  if (needsGestureNavigation()) {
    window.location.replace(buildReloadUrl(window.location.href));
    return;
  }
  window.location.reload();
}

export function clearReloadParamFromAddressBar(): void {
  if (typeof window === 'undefined') return;
  const next = stripReloadParam(window.location.href);
  if (!next) return;
  window.history.replaceState(window.history.state, '', next);
}
