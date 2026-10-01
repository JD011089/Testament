import React, { useState, useEffect } from 'react';
import { CHARACTER_DOSSIERS } from '../data/dossiers';
import type { CharacterDossier } from '../data/dossiers';
import { soundEngine } from '../utils/audio';
import { X, ShieldAlert, Zap, Award, ArrowRight } from 'lucide-react';
import { useModalLock } from '../utils/useModalLock';
import { ArtImage } from './ArtImage';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacterQuest: (questId: string) => void;
  initialCharacterId?: string | null;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  isOpen,
  onClose,
  onSelectCharacterQuest,
  initialCharacterId
}) => {
  const modalRef = useModalLock(isOpen);
  const [selectedCharIndex, setSelectedCharIndex] = useState<number>(0);

  useEffect(() => {
    if (isOpen && initialCharacterId) {
      const idx = CHARACTER_DOSSIERS.findIndex(c => c.id === initialCharacterId);
      if (idx !== -1) {
        setSelectedCharIndex(idx);
      }
    }
  }, [isOpen, initialCharacterId]);

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

  const character: CharacterDossier = CHARACTER_DOSSIERS[selectedCharIndex];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain p-0 sm:p-6 flex items-start sm:items-center justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-modal-title"
        className="max-w-4xl w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-white dark:bg-ink-raised border-0 sm:border-2 border-amber-400 dark:border-amber-600/50 rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl overflow-hidden flex flex-col my-auto outline-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-500 mb-1">
              <Zap className="w-4 h-4" />
              <span>Character Dossiers • Flawed Men, Real Impact</span>
            </div>
            <h2 id="dossier-modal-title" className="text-xl md:text-2xl font-serif font-black text-stone-900 dark:text-parchment-50">
              The Warriors, Outlaws & Prophets
            </h2>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close character dossier modal"
            className="p-2 rounded-xl bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Selector Pills */}
        <div className="flex gap-2 p-3 bg-stone-100/70 dark:bg-stone-900/70 border-b border-stone-200/60 dark:border-stone-800/80 overflow-x-auto scrollbar-none px-4 md:px-6">
          {CHARACTER_DOSSIERS.map((char, idx) => (
            <button
              key={char.id}
              onClick={() => {
                soundEngine.playSnap();
                setSelectedCharIndex(idx);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl transition-all text-xs font-semibold ${
                selectedCharIndex === idx
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-200/60 dark:bg-stone-950/60 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              {char.name}
            </button>
          ))}
        </div>

        {/* Dossier Body */}
        <div className="flex-1 min-h-0 p-5 md:p-8 overflow-y-auto space-y-6 text-left pb-12">
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Image Thumbnail */}
            <div className="w-full md:w-56 h-48 rounded-2xl overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-950">
              <ArtImage
                src={character.image}
                alt={character.name}
                width={1376}
                height={768}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile Core */}
            <div className="space-y-2 flex-1">
              <span className="text-xs font-mono text-amber-800 dark:text-amber-400 uppercase tracking-widest font-bold">
                {character.era}
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-black text-stone-900 dark:text-parchment-50">
                {character.name}
              </h3>
              <div className="inline-block px-3 py-1 rounded-md bg-amber-500/15 text-xs font-mono text-amber-800 dark:text-amber-300">
                Code: {character.codename}
              </div>
              <p className="text-xs md:text-sm text-stone-700 dark:text-stone-300 pt-1">
                <strong>Career Track: </strong> {character.occupation}
              </p>
            </div>
          </div>

          {/* Superpower vs Major Flaws Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-ink-raised">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
                <Award className="w-4 h-4" />
                <span>Superpower</span>
              </div>
              <p className="text-xs md:text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed font-medium">
                {character.superpower}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 dark:bg-ink-raised">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Major Flaws & Screw-Ups</span>
              </div>
              <ul className="text-xs text-red-900 dark:text-red-200/90 space-y-1 list-disc list-inside">
                {character.majorFlaws.map((flaw, idx) => (
                  <li key={idx}>{flaw}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Defining Moment */}
          <div className="p-4 rounded-xl bg-stone-100/70 dark:bg-stone-900 text-xs md:text-sm text-stone-700 dark:text-stone-300">
            <strong className="text-amber-800 dark:text-amber-400 block mb-1">Defining Moment: </strong>
            {character.definingMoment}
          </div>

          {/* Real Talk Lesson for Men Today */}
          <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-950/25 text-xs md:text-sm">
            <strong className="text-amber-800 dark:text-amber-300 block mb-1">Real Talk Lesson For You Today: </strong>
            <p className="text-stone-800 dark:text-parchment-200 leading-relaxed italic">
              "{character.realTalkLesson}"
            </p>
          </div>

          {/* Jump to Quest button */}
          <div className="pt-4 border-t border-stone-200/60 dark:border-stone-800 flex justify-end">
            <button
              onClick={() => {
                soundEngine.playClick();
                onSelectCharacterQuest(character.relatedQuestId);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Play {character.name}'s Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
