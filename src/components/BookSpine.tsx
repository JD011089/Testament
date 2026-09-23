import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { CanonBook } from '../data/canon';
import { soundEngine } from '../utils/audio';

interface BookSpineProps {
  book: CanonBook;
  isSelected?: boolean;
  onSelect: () => void;
  tooltipAlign?: 'left' | 'center' | 'right';
}

// Map canonical divisions to authentic leather spine color themes
const DIVISION_SPINE_STYLES: Record<string, {
  gradient: string;
  ribColor: string;
  textColor: string;
  badgeBg: string;
  glowColor: string;
}> = {
  'Torah & Origins': {
    gradient: 'from-[#0d1b2a] via-[#1b263b] to-[#0a1128]',
    ribColor: 'border-blue-400/40 bg-blue-900/30',
    textColor: 'text-amber-200',
    badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
    glowColor: 'shadow-blue-900/40',
  },
  'War & Chronicles': {
    gradient: 'from-[#3a0f12] via-[#240b0d] to-[#1a080a]',
    ribColor: 'border-red-500/40 bg-red-950/40',
    textColor: 'text-amber-100',
    badgeBg: 'bg-red-950/80 text-red-300 border-red-800/60',
    glowColor: 'shadow-red-900/40',
  },
  'Wisdom & Soul Triage': {
    gradient: 'from-[#3d2a0c] via-[#2a1d08] to-[#1c1305]',
    ribColor: 'border-amber-400/50 bg-amber-900/40',
    textColor: 'text-amber-200',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
    glowColor: 'shadow-amber-800/40',
  },
  'Prophet Intelligence': {
    gradient: 'from-[#0b291e] via-[#071d15] to-[#04120d]',
    ribColor: 'border-emerald-500/40 bg-emerald-950/40',
    textColor: 'text-emerald-100',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    glowColor: 'shadow-emerald-900/40',
  },
  "The King's Manifesto": {
    gradient: 'from-[#2c1338] via-[#1d0b26] to-[#120717]',
    ribColor: 'border-purple-400/50 bg-purple-950/40',
    textColor: 'text-purple-100',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    glowColor: 'shadow-purple-900/40',
  },
  'Field Dispatches': {
    gradient: 'from-[#362111] via-[#24160b] to-[#170e07]',
    ribColor: 'border-amber-500/40 bg-amber-950/40',
    textColor: 'text-amber-100',
    badgeBg: 'bg-amber-950/80 text-amber-200 border-amber-800/60',
    glowColor: 'shadow-amber-950/50',
  },
  'The Cosmic Endgame': {
    gradient: 'from-[#1a1325] via-[#0e0a14] to-[#08050c]',
    ribColor: 'border-amber-400/60 bg-amber-950/50',
    textColor: 'text-amber-300 font-extrabold',
    badgeBg: 'bg-stone-900/90 text-amber-400 border-amber-500/60',
    glowColor: 'shadow-amber-500/30',
  },
};

// Distinct volume widths based on book size / chapter breadth
const getSpineWidth = (order: number, name: string): number => {
  // Massive tomes (Psalms, Genesis, Isaiah, Jeremiah, Luke, Ezekiel, Matthew)
  if (['Psalms', 'Genesis', 'Isaiah', 'Jeremiah', 'Ezekiel', 'Matthew', 'Luke', 'Acts', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings'].includes(name)) {
    return 48;
  }
  // Slender letters (1 chapter or tiny epistles)
  if (['Obadiah', 'Philemon', '2 John', '3 John', 'Jude', 'Titus', '2 Thessalonians', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai'].includes(name)) {
    return 30;
  }
  // Medium / standard books
  return 36 + ((order % 4) * 2);
};

// Subtle height variations (+/- 8px) for authentic organic bookshelf feeling
const getSpineHeight = (order: number): number => {
  return 205 + ((order % 5) * 4);
};

export const BookSpine: React.FC<BookSpineProps> = ({
  book,
  isSelected = false,
  onSelect,
  tooltipAlign = 'center'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const style = DIVISION_SPINE_STYLES[book.division] || DIVISION_SPINE_STYLES['Torah & Origins'];
  const width = getSpineWidth(book.order, book.name);
  const height = getSpineHeight(book.order);

  const handleMouseEnter = () => {
    setIsHovered(true);
    soundEngine.playBookSlide();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  let alignContainerClass = 'left-1/2 -translate-x-1/2';
  let caretClass = 'left-1/2 -translate-x-1/2';
  if (tooltipAlign === 'left') {
    alignContainerClass = 'left-0';
    caretClass = 'left-6';
  } else if (tooltipAlign === 'right') {
    alignContainerClass = 'right-0';
    caretClass = 'right-6';
  }

  return (
    <div className={`relative flex flex-col items-center select-none group ${isHovered || isSelected ? 'z-40' : 'z-10'}`}>
      {/* Floating Tactical Preview Tooltip */}
      {isHovered && (
        <div className={`absolute bottom-[calc(100%+20px)] z-50 pointer-events-none ${alignContainerClass}`}>
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="w-56 p-2.5 rounded-xl bg-stone-900/95 border border-amber-500/50 backdrop-blur-md shadow-2xl text-left relative"
          >
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold mb-0.5">
              <span>Vol #{String(book.order).padStart(2, '0')}</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[9px]">
                {book.testament}
              </span>
            </div>
            <h4 className="text-sm font-serif font-black text-parchment-100 leading-tight">
              {book.name}
            </h4>
            <p className="text-[11px] text-stone-300 line-clamp-1 italic mt-0.5">
              "{book.codename}"
            </p>
            <div className="text-[10px] text-amber-300/80 font-mono mt-1 flex items-center gap-1">
              <span>⚡ Click to pull & open codex</span>
            </div>

            {/* Downward pointing arrow caret */}
            <div className={`absolute -bottom-1.5 w-3 h-3 bg-stone-900 border-r border-b border-amber-500/50 rotate-45 ${caretClass}`} />
          </motion.div>
        </div>
      )}

      {/* The Physical 3D Book Spine */}
      <motion.button
        type="button"
        onClick={() => {
          soundEngine.playClick();
          onSelect();
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{
          y: -14,
          scale: 1.04,
          transition: { duration: 0.2, ease: 'easeOut' }
        }}
        whileTap={{ scale: 0.98 }}
        animate={isSelected ? { y: -20, scale: 1.06 } : { y: 0, scale: 1 }}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
        className={`relative rounded-t-[3px] rounded-b-[1px] bg-gradient-to-r ${style.gradient} border-x border-t border-stone-800/80 cursor-pointer shadow-lg transition-shadow flex flex-col justify-between items-center py-2.5 px-0.5 overflow-hidden ${
          isHovered || isSelected ? `shadow-2xl ring-1 ring-amber-400/60 ${style.glowColor}` : 'shadow-md'
        }`}
      >
        {/* Antique Book Leather Texture Grain Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-repeat" 
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '4px 4px'
          }}
        />

        {/* Vertical Spine Crease Light Reflection */}
        <div className="absolute top-0 bottom-0 left-1 w-[2px] bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-1 w-[2px] bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />

        {/* TOP EMBOSSED SPINE BAND (Rib) */}
        <div className="w-full flex flex-col items-center gap-1 z-10 shrink-0">
          <div className={`w-[90%] h-[3px] rounded-full border-t border-b ${style.ribColor} shadow-inner`} />
          <span className="text-[9px] font-mono font-black tracking-tighter text-amber-400/80">
            {String(book.order).padStart(2, '0')}
          </span>
        </div>

        {/* VERTICAL EMBOSSED BOOK TITLE */}
        <div className="flex-1 flex items-center justify-center my-1 overflow-hidden z-10 w-full px-0.5">
          <div 
            className="text-center font-serif font-black tracking-wider uppercase text-[11px] sm:text-xs select-none"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              maxHeight: `${height - 75}px`,
              letterSpacing: width > 34 ? '0.14em' : '0.08em',
              textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 1px rgba(245,158,11,0.4)'
            }}
          >
            <span className={style.textColor}>
              {book.name}
            </span>
          </div>
        </div>

        {/* BOTTOM EMBOSSED SPINE BAND (Rib) & TESTAMENT TAG */}
        <div className="w-full flex flex-col items-center gap-1 z-10 shrink-0">
          <span className={`text-[8px] font-mono font-extrabold uppercase px-1 py-0.2 rounded border ${style.badgeBg}`}>
            {book.testament}
          </span>
          <div className={`w-[90%] h-[3px] rounded-full border-t border-b ${style.ribColor} shadow-inner`} />
        </div>

        {/* Selected Indicator Light */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-amber-400 rounded-t-[3px] pointer-events-none animate-pulse" />
        )}
      </motion.button>

      {/* Book Base Shadow On Shelf */}
      <div 
        className={`h-2 rounded-full bg-black/70 blur-[2px] transition-all duration-200 mt-0.5 ${
          isHovered ? 'w-10 opacity-90 scale-110' : 'w-7 opacity-50'
        }`} 
      />
    </div>
  );
};
