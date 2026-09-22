import React, { useState, useEffect } from 'react';
import { TIMELINE_ERAS } from '../data/timeline';
import type { TimelineEra } from '../data/timeline';
import { soundEngine } from '../utils/audio';
import { X, Clock, ArrowRight } from 'lucide-react';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEraQuest: (questId: string) => void;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  onSelectEraQuest
}) => {
  const [selectedEraIndex, setSelectedEraIndex] = useState<number>(0);

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

  const currentEra: TimelineEra = TIMELINE_ERAS[selectedEraIndex];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto p-3 sm:p-6 flex items-start sm:items-center justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="timeline-modal-title"
        className="max-w-4xl w-full bg-[#11141b] border-2 border-amber-600/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-500 mb-1">
              <Clock className="w-4 h-4" />
              <span>The 60-Second Big Picture Mental Map</span>
            </div>
            <h2 id="timeline-modal-title" className="text-xl md:text-2xl font-serif font-black text-parchment-50">
              The Entire Bible in 6 Simple Eras
            </h2>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close timeline modal"
            className="p-2 rounded-xl bg-stone-900 text-stone-400 hover:text-white border border-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrubbable Eras Bar */}
        <div className="flex gap-2 p-3 bg-stone-900/70 border-b border-stone-800/80 overflow-x-auto scrollbar-none px-4 md:px-6">
          {TIMELINE_ERAS.map((era, idx) => (
            <button
              key={era.id}
              onClick={() => {
                soundEngine.playSnap();
                setSelectedEraIndex(idx);
              }}
              className={`flex-shrink-0 text-left px-3.5 py-2 rounded-xl border transition-all ${
                selectedEraIndex === idx
                  ? 'bg-amber-600 text-black border-amber-500 font-bold shadow-glow-gold'
                  : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                Era {era.eraNumber}
              </div>
              <div className="text-xs font-semibold whitespace-nowrap">
                {era.title}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Era Deep Dive */}
        <div className="flex-1 min-h-0 p-5 md:p-8 overflow-y-auto space-y-6 text-left pb-12">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                Era {currentEra.eraNumber} • {currentEra.timeframe}
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-black text-parchment-50 mt-1">
                {currentEra.title}
              </h3>
              <p className="text-xs md:text-sm text-stone-400 font-medium mt-0.5">
                {currentEra.subtitle}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 text-sm text-stone-200 leading-relaxed font-reading">
            {currentEra.summary}
          </div>

          {/* Defining Moment Card */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs md:text-sm">
            <strong className="text-amber-400 block mb-1">Defining Breakthrough Moment: </strong>
            <span className="text-amber-100 italic">"{currentEra.definingMoment}"</span>
          </div>

          {/* Key Figures */}
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-stone-400 mb-2">
              Key Men & Women of this Era:
            </div>
            <div className="flex flex-wrap gap-2">
              {currentEra.keyFigures.map((fig, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-stone-900 border border-stone-800 text-xs font-semibold text-stone-300"
                >
                  {fig}
                </span>
              ))}
            </div>
          </div>

          {/* Connected Quests in this App */}
          {currentEra.questIds.length > 0 && (
            <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-400">Ready to step into this era?</span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onSelectEraQuest(currentEra.questIds[0]);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-gold"
              >
                <span>Jump to Story Quest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
