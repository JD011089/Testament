import type { NavTab } from '../components/Navigation';

export type AppTab = NavTab | 'not-found';

export const TAB_PATHS: Record<NavTab, string> = {
  dashboard: '/',
  library: '/library',
  game: '/game',
  practice: '/practice',
  wordforge: '/practice',
  dilemmas: '/practice',
  arsenal: '/saved',
};

export function tabFromPath(pathname: string): AppTab {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return 'dashboard';
  if (path === '/library' || path.startsWith('/read/')) return 'library';
  if (path === '/game' || path.startsWith('/game/')) return 'game';
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

/** Story Swipes deep link: /story/<storyId> */
export function storyIdFromPath(pathname: string): string | null {
  const match = pathname.replace(/\/+$/, '').match(/^\/story\/([a-z0-9-]+)$/i);
  return match ? match[1] : null;
}

export function pathForStory(storyId: string): string {
  return `/story/${storyId}`;
}
