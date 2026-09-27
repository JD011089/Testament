import type { NavTab } from '../components/Navigation';

export const TAB_PATHS: Record<NavTab, string> = {
  dashboard: '/',
  library: '/library',
  wordforge: '/memorize',
  dilemmas: '/dilemmas',
  arsenal: '/saved',
};

export function tabFromPath(pathname: string): NavTab {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/library') return 'library';
  if (path === '/memorize' || path === '/wordforge') return 'wordforge';
  if (path === '/dilemmas') return 'dilemmas';
  if (path === '/saved' || path === '/arsenal') return 'arsenal';
  return 'dashboard';
}

export function pathForTab(tab: NavTab): string {
  return TAB_PATHS[tab];
}
