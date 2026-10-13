import type { NavTab } from '../components/Navigation';

export type AppTab = NavTab | 'not-found';

export const TAB_PATHS: Record<NavTab, string> = {
  dashboard: '/',
  library: '/library',
  practice: '/practice',
  wordforge: '/practice',
  dilemmas: '/practice',
  arsenal: '/saved',
};

export function tabFromPath(pathname: string): AppTab {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return 'dashboard';
  if (path === '/library' || path.startsWith('/read/')) return 'library';
  if (path === '/practice' || path.startsWith('/practice/')) return 'practice';
  if (path === '/memorize' || path === '/wordforge') return 'practice';
  if (path === '/dilemmas') return 'practice';
  if (path === '/saved' || path === '/arsenal') return 'arsenal';
  if (path === '/privacy' || path === '/privacy.html') return 'dashboard';
  return 'not-found';
}

export function pathForTab(tab: AppTab): string {
  if (tab === 'not-found') return window.location.pathname;
  return TAB_PATHS[tab] || '/';
}
