import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  UserCheck, 
  UserPlus, 
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';
import { 
  CHARACTER_ARCS, 
  getFollowedCharacterIds, 
  toggleFollowCharacter, 
  type CharacterMoment 
} from '../data/characterArcs';

interface CharacterArcModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCharacterId?: string;
  initialMomentIndex?: number;
}

export const CharacterArcModal: React.FC<CharacterArcModalProps> = ({
  isOpen,
  onClose,
  initialCharacterId = 'peter',
  initialMomentIndex = 0
}) => {
  const modalRef = useModalLock(isOpen);
  const [selectedCharId, setSelectedCharId] = useState<string>(initialCharacterId);
  const [momentIndex, setMomentIndex] = useState<number>(initialMomentIndex);
  const [followedIds, setFollowedIds] = useState<string[]>(() => getFollowedCharacterIds());
  const [expandedDeeper, setExpandedDeeper] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      if (initialCharacterId) setSelectedCharId(initialCharacterId);
      if (typeof initialMomentIndex === 'number') setMomentIndex(initialMomentIndex);
      setExpandedDeeper(false);
      setFollowedIds(getFollowedCharacterIds());
    }
  }, [isOpen, initialCharacterId, initialMomentIndex]);

  const activeArc = CHARACTER_ARCS.find((c) => c.id === selectedCharId) || CHARACTER_ARCS[0];
  const moments = activeArc.moments;
  const currentMoment: CharacterMoment | undefined = moments[momentIndex] || moments[0];
  const isFollowing = followedIds.includes(activeArc.id);

  const handleToggleFollow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    soundEngine.playSnap();
    toggleFollowCharacter(id);
    setFollowedIds(getFollowedCharacterIds());
  };

  const handleSelectCharacter = (id: string) => {
    soundEngine.playClick();
    setSelectedCharId(id);
    setMomentIndex(0);
    setExpandedDeeper(false);
  };

  const handleNextMoment = () => {
    soundEngine.playClick();
    if (momentIndex < moments.length - 1) {
      setMomentIndex((prev) => prev + 1);
      setExpandedDeeper(false);
    }
  };

  const handlePrevMoment = () => {
    soundEngine.playClick();
    if (momentIndex > 0) {
      setMomentIndex((prev) => prev - 1);
      setExpandedDeeper(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-black/60 dark:bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="people-modal-title"
        >
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-3xl bg-white dark:bg-stone-900 border-0 sm:border border-stone-200 dark:border-stone-800 shadow-none sm:shadow-2xl flex flex-col text-left overflow-hidden relative outline-none"
          >
            {/* MODAL HEADER */}
            <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 bg-stone-50 dark:bg-stone-900/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                  {activeArc.avatarIcon}
                </div>
                <div>
                  <h2 
                    id="people-modal-title"
                    className="text-lg font-serif font-bold text-stone-900 dark:text-parchment-50"
                  >
                    People • Character Arcs
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Follow their real human journey moment by moment
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors"
                aria-label="Close people viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CHARACTER SELECTOR PILLS */}
            <div className="px-4 sm:px-6 py-2.5 border-b border-stone-200 dark:border-stone-800/80 bg-stone-100/70 dark:bg-stone-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
              {CHARACTER_ARCS.map((c) => {
                const isSelected = c.id === selectedCharId;
                const isFollowed = followedIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCharacter(c.id)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                        : 'bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-amber-500/40'
                    }`}
                  >
                    <span>{c.avatarIcon}</span>
                    <span>{c.name}</span>
                    {isFollowed && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* MAIN ARC CONTENT */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Character Bio & Follow action */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base sm:text-lg font-serif font-black text-stone-900 dark:text-parchment-50">
                      {activeArc.name}
                    </h3>
                    <span className="text-[11px] font-mono text-amber-800 dark:text-amber-400 font-semibold">
                      {moments.length} moments
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 font-reading leading-relaxed">
                    {activeArc.bio}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleToggleFollow(e, activeArc.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    isFollowing
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow arc</span>
                    </>
                  )}
                </button>
              </div>

              {/* ACTIVE MOMENT CARD */}
              {currentMoment && (
                <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-850/80 border border-stone-200/80 dark:border-stone-800 space-y-4">
                  {/* Step Tracker */}
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-mono text-amber-800 dark:text-amber-400 font-bold uppercase tracking-wider">
                      Moment {currentMoment.order} of {moments.length}
                    </span>
                    <span className="font-mono text-[11px] bg-stone-200/70 dark:bg-stone-800 px-2 py-0.5 rounded-md text-stone-800 dark:text-stone-200">
                      {currentMoment.passageReference}
                    </span>
                  </div>

                  {/* Moment Title */}
                  <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50 leading-snug">
                    {currentMoment.title}
                  </h4>

                  {/* What Happened (2-3 sentences) */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">
                      What Unfolded
                    </span>
                    <p className="text-xs sm:text-sm font-reading text-stone-800 dark:text-parchment-100 leading-relaxed">
                      {currentMoment.whatHappened}
                    </p>
                  </div>

                  {/* The Human Angle */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border-l-2 border-amber-500/80 text-xs text-stone-800 dark:text-parchment-100 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold block">
                      The Human Angle
                    </span>
                    <p className="font-reading leading-relaxed italic">
                      {currentMoment.humanAngle}
                    </p>
                  </div>

                  {/* Reader Connection Line */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">
                      Connection to Your Life
                    </span>
                    <p className="text-xs sm:text-sm font-reading text-stone-900 dark:text-stone-200 leading-relaxed font-medium">
                      "{currentMoment.readerConnection}"
                    </p>
                  </div>

                  {/* Go Deeper (Collapsed by default, progressive disclosure) */}
                  <div className="pt-2 border-t border-stone-200/50 dark:border-stone-800/50">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playSnap();
                        setExpandedDeeper(!expandedDeeper);
                      }}
                      className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 flex items-center gap-1.5 py-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{expandedDeeper ? 'Hide deeper context' : 'Go deeper (cultural context & parallels)'}</span>
                      {expandedDeeper ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {expandedDeeper && (
                      <div className="mt-2.5 p-3 rounded-xl bg-stone-100/80 dark:bg-stone-900/80 space-y-2 text-xs animate-in fade-in duration-200">
                        <div>
                          <span className="font-bold text-stone-700 dark:text-stone-300 block mb-0.5">
                            Cultural Context:
                          </span>
                          <p className="text-stone-600 dark:text-stone-400 font-reading leading-relaxed">
                            {currentMoment.goDeeper.culturalContext}
                          </p>
                        </div>
                        {currentMoment.goDeeper.crossReference && (
                          <div className="pt-1 text-[11px] font-mono text-amber-800 dark:text-amber-400">
                            {currentMoment.goDeeper.crossReference}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER: MOMENT STEPPING NAVIGATION */}
            <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                disabled={momentIndex === 0}
                onClick={handlePrevMoment}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  momentIndex === 0
                    ? 'text-stone-400 dark:text-stone-600 cursor-not-allowed'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800 cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous moment</span>
              </button>

              <span className="text-xs font-mono text-stone-500 dark:text-stone-400 hidden sm:block">
                {momentIndex + 1} / {moments.length}
              </span>

              <button
                type="button"
                disabled={momentIndex === moments.length - 1}
                onClick={handleNextMoment}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  momentIndex === moments.length - 1
                    ? 'text-stone-400 dark:text-stone-600 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs cursor-pointer'
                }`}
              >
                <span>Next moment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
