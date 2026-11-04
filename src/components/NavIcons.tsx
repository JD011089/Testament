import React from 'react';

/**
 * Custom nav icons (Lapis & Gold redesign). Outline when idle; the main
 * shape fills in softly when the tab is active so "where am I" is obvious.
 */
interface NavIconProps {
  active?: boolean;
  className?: string;
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const fill = (active: boolean | undefined, opacity: number) =>
  active ? { fill: 'currentColor', fillOpacity: opacity, stroke: 'none' } : { fill: 'none', stroke: 'none' };

/** Today: sunrise over the horizon. */
export const TodayIcon: React.FC<NavIconProps> = ({ active, className }) => (
  <svg {...base} className={className}>
    <path d="M6.5 16.5a5.5 5.5 0 0 1 11 0z" {...fill(active, 0.28)} />
    <path d="M6.5 16.5a5.5 5.5 0 0 1 11 0" />
    <path d="M2.5 16.5h19M7 20h10" />
    <path d="M12 4.5v2.5M5.3 7.8l1.7 1.7M18.7 7.8 17 9.5M3 12.5h1.5M19.5 12.5H21" />
  </svg>
);

/** Journey: a dotted path leading to a pin. */
export const JourneyIcon: React.FC<NavIconProps> = ({ active, className }) => (
  <svg {...base} className={className}>
    <path d="M17 2.8a3.3 3.3 0 0 1 3.3 3.3c0 2.5-3.3 5.6-3.3 5.6s-3.3-3.1-3.3-5.6A3.3 3.3 0 0 1 17 2.8z" {...fill(active, 0.28)} />
    <path d="M17 2.8a3.3 3.3 0 0 1 3.3 3.3c0 2.5-3.3 5.6-3.3 5.6s-3.3-3.1-3.3-5.6A3.3 3.3 0 0 1 17 2.8z" />
    <circle cx="17" cy="6.1" r="1" />
    <path d="M5 20.5c3.5 0 2.5-4.5 6.5-4.5s4.5-2.4 4-4.2" strokeDasharray="0.1 3.2" />
    <circle cx="5" cy="20.5" r="1.6" />
  </svg>
);

/** Bible: an open book with a ribbon bookmark. */
export const BibleIcon: React.FC<NavIconProps> = ({ active, className }) => (
  <svg {...base} className={className}>
    <path d="M12 6.2C9.8 4.8 6.6 4.3 3.5 4.7v14c3.1-.4 6.3.1 8.5 1.6 2.2-1.5 5.4-2 8.5-1.6v-14c-3.1-.4-6.3.1-8.5 1.5z" {...fill(active, 0.2)} />
    <path d="M12 6.2C9.8 4.8 6.6 4.3 3.5 4.7v14c3.1-.4 6.3.1 8.5 1.6 2.2-1.5 5.4-2 8.5-1.6v-14c-3.1-.4-6.3.1-8.5 1.5z" />
    <path d="M12 6.2v14" />
    <path d="M15.5 5.2v6.3l1.5-1.2 1.5 1.2V4.8" fill={active ? 'currentColor' : 'none'} />
  </svg>
);

/** Collection: fanned cards with a star. */
export const CollectionIcon: React.FC<NavIconProps> = ({ active, className }) => (
  <svg {...base} className={className}>
    <path d="M7.2 5.6 4.3 6.4a1.8 1.8 0 0 0-1.3 2.2l3 11a1.8 1.8 0 0 0 2.2 1.3l1.6-.4" />
    <rect x="9" y="2.8" width="11" height="15.5" rx="2" {...fill(active, 0.24)} />
    <rect x="9" y="2.8" width="11" height="15.5" rx="2" />
    <path d="m14.5 7.4 1 2.1 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" />
  </svg>
);
