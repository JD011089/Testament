import React, { useState, useEffect } from 'react';
import { STREET_TRANSLATIONS } from '../data/streetTranslator';
import type { StreetTranslation } from '../data/streetTranslator';
import { soundEngine } from '../utils/audio';
import { X, BookA, Search, Sparkles } from 'lucide-react';
import { useModalLock } from '../utils/useModalLock';

interface StreetTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreetTranslatorModal: React.FC<StreetTranslatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const modalRef = useModalLock(isOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['All', 'Body & Action', 'Grief & Emotion', 'Law & Politics', 'Faith & Weapons'];

  const filtered = STREET_TRANSLATIONS.filter((item: StreetTranslation) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery = 
      item.ancientPhrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.streetTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.literalBiblicalContext.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain p-0 sm:p-6 flex items-start sm:items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="street-translator-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="max-w-4xl w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-white dark:bg-[#11141b] border-0 sm:border-2 border-amber-400 dark:border-amber-600/50 rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl overflow-hidden flex flex-col my-auto outline-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-1">
              <BookA className="w-4 h-4" />
              <span>Street Translator • No Religious Jargon</span>
            </div>
            <h2 id="street-translator-title" className="text-xl md:text-2xl font-serif font-black text-stone-900 dark:text-parchment-50">
              Ancient Customs → Modern Everyday Reality
            </h2>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close street translator modal"
            className="p-2 rounded-xl bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 md:p-6 bg-stone-50/70 dark:bg-stone-950/40 border-b border-stone-200/60 dark:border-stone-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search ancient terms (e.g. loins, sackcloth, coals, Sanhedrin)..."
              aria-label="Search ancient terms"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100/70 dark:bg-stone-900 text-sm text-stone-900 dark:text-parchment-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedCategory(cat);
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-stone-200/70 dark:bg-stone-900 text-stone-700 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 min-h-0 p-5 md:p-8 overflow-y-auto space-y-4 text-left pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(item => (
              <div 
                key={item.id}
                className="p-4 md:p-5 rounded-2xl bg-stone-100/70 dark:bg-[#141822] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-serif font-bold text-amber-700 dark:text-amber-400">
                      "{item.ancientPhrase}"
                    </span>
                    <span className="text-[10px] font-mono text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded bg-stone-200/70 dark:bg-stone-900">
                      {item.category}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 dark:text-stone-400 mb-3 leading-relaxed">
                    <strong className="text-stone-900 dark:text-stone-300">What they did then: </strong>
                    {item.literalBiblicalContext}
                  </div>

                  <div className="p-3 bg-amber-500/10 dark:bg-amber-950/40 rounded-xl text-xs md:text-sm text-amber-900 dark:text-amber-200 font-medium mb-3">
                    <div className="flex items-center gap-1 text-amber-800 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>The Street Translation:</span>
                    </div>
                    {item.streetTranslation}
                  </div>
                </div>

                <div className="text-[11px] text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-200/60 dark:border-stone-800/80">
                  <strong className="text-stone-900 dark:text-stone-300">Why it matters: </strong>
                  {item.whyItMattersToday}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-stone-500 text-sm">
              No translations found matching "{searchQuery}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
