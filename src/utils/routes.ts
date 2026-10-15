import type { NavTab } from '../components/Navigation';

export type AppTab = NavTab | 'not-found';

export const TAB_PATHS: Record<NavTab, string> = {
  today: '/',
  dashboard: '/explore',
  map: '/map',
  library: '/library',
  game: '/game',
  practice: '/practice',
  wordforge: '/practice',
  dilemmas: '/map',
  arsenal: '/saved',
  deck: '/deck',
};

export function tabFromPath(pathname: string): AppTab {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return 'today';
  if (path === '/explore') return 'dashboard';
  if (path === '/map') return 'map';
  if (path === '/library' || path.startsWith('/read/')) return 'library';
  if (path === '/game' || path.startsWith('/game/')) return 'game';
  if (path === '/practice' || path.startsWith('/practice/')) return 'practice';
  if (path === '/memorize' || path === '/wordforge') return 'practice';
  if (path === '/dilemmas') return 'map';
  if (path === '/deck') return 'deck';
  if (path === '/saved' || path === '/arsenal') return 'deck';
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
