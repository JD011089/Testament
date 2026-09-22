import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MemoryVerse } from '../types';
import { MEMORY_VERSES } from '../data/verses';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  Eye, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  ShieldCheck, 
  Flame, 
  ArrowRight
} from 'lucide-react';

interface WordForgeProps {
  memorizedVerses: string[];
  onVerseMastered: (verseId: string) => void;
}

export const WordForge: React.FC<WordForgeProps> = ({ 
  memorizedVerses, 
  onVerseMastered 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);
  const [assembledWords, setAssembledWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<{ id: string; word: string }[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const categories = ['All', 'Courage & Facing Giants', 'Pressure & Anxiety', 'Anger & Self-Control', 'Restoration After Failure', 'Endurance & Brotherhood'];

  const filteredVerses = selectedCategory === 'All' 
    ? MEMORY_VERSES 
    : MEMORY_VERSES.filter(v => v.category === selectedCategory);

  const currentVerse: MemoryVerse = filteredVerses[activeVerseIndex] || MEMORY_VERSES[0];
  const targetWords = currentVerse.text.split(/\s+/);

  useEffect(() => {
    resetPuzzle();
  }, [currentVerse.id]);

  const resetPuzzle = () => {
    const words = targetWords.map((word, idx) => ({ id: `${word}-${idx}`, word }));
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setAssembledWords([]);
    setIsCompleted(false);
    setShowHint(false);
  };

  const handleSelectWord = (item: { id: string; word: string }) => {
    soundEngine.playSnap();
    const newAssembled = [...assembledWords, item.word];
    setAssembledWords(newAssembled);
    setAvailableWords(prev => prev.filter(w => w.id !== item.id));

    if (newAssembled.length === targetWords.length) {
      const isCorrect = newAssembled.join(' ') === targetWords.join(' ');
      if (isCorrect) {
        handleSuccess();
      }
    }
  };

  const handleRemoveWord = (indexToRemove: number) => {
    soundEngine.playClick();
    const wordToRemove = assembledWords[indexToRemove];
    const newAssembled = assembledWords.filter((_, idx) => idx !== indexToRemove);
    setAssembledWords(newAssembled);
    setAvailableWords(prev => [...prev, { id: `${wordToRemove}-${Date.now()}`, word: wordToRemove }]);
    setIsCompleted(false);
  };

  const handleSuccess = () => {
    setIsCompleted(true);
    soundEngine.playVictory();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.75 },
      colors: ['#ea580c', '#f59e0b', '#10b981', '#fbbf24']
    });
    onVerseMastered(currentVerse.id);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      soundEngine.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      soundEngine.speakVerse(
        `${currentVerse.reference}. ${currentVerse.text}. ${currentVerse.plainEnglishSummary}`,
        () => setIsSpeaking(false)
      );
    }
  };

  const isWordCorrectAtIndex = (idx: number) => {
    return assembledWords[idx] === targetWords[idx];
  };

  const handleNextVerse = () => {
    soundEngine.playClick();
    setActiveVerseIndex(prev => (prev + 1) % filteredVerses.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-40 sm:pb-48 text-left">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-amber-500 mb-1">
          <Flame className="w-4 h-4" />
          <span>The Word Forge • Scripture Retention</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-serif font-black text-parchment-50">
          Lock Truth Into Memory
        </h1>
        <p className="text-xs md:text-sm text-stone-400 mt-1">
          Tactile word assembly designed for adult retention. Assemble the verse by tapping words in sequence.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              soundEngine.playClick();
              setSelectedCategory(cat);
              setActiveVerseIndex(0);
            }}
            className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-amber-600 text-black font-bold shadow-sm'
                : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* WIDESCREEN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: VERSE CARD & SUMMARY */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 md:p-6 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-serif font-bold text-amber-400">
                  {currentVerse.reference}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-400 font-mono">
                  {currentVerse.translation}
                </span>
                {memorizedVerses.includes(currentVerse.id) && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Mastered</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSpeak}
                  title="Listen to Verse"
                  className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-amber-600 hover:text-black transition-colors"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    soundEngine.playSnap();
                    setShowHint(!showHint);
                  }}
                  title="Toggle Hint"
                  className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                    showHint 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                      : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Hint</span>
                </button>
                <button
                  onClick={resetPuzzle}
                  title="Reset Puzzle"
                  className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800 text-xs md:text-sm text-stone-300 italic mb-3">
              "{currentVerse.plainEnglishSummary}"
            </div>

            <div className="text-xs text-stone-400">
              <strong className="text-amber-400">Takeaway for Today: </strong>
              {currentVerse.keyTakeaway}
            </div>

            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 rounded-lg bg-amber-950/40 border border-amber-900/50 text-xs text-amber-200 font-reading leading-relaxed"
                >
                  <strong>Full Verse Reference: </strong> {currentVerse.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: WORKBENCH & WORD BANK (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Assembly Work Area */}
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-stone-400 mb-2 flex items-center justify-between">
              <span>Your Forged Verse ({assembledWords.length}/{targetWords.length} words)</span>
              {assembledWords.length > 0 && (
                <span className="text-[11px] text-stone-500 italic">Tap any word to return it</span>
              )}
            </div>

            <div className="min-h-[140px] md:min-h-[160px] p-4 md:p-5 rounded-2xl bg-[#0b0e12] border-2 border-dashed border-stone-800 flex flex-wrap items-center content-start gap-2.5 shadow-inner">
              {assembledWords.length === 0 ? (
                <div className="w-full text-center text-stone-600 text-sm py-10 font-reading italic">
                  Tap the word tiles below to forge the scripture...
                </div>
              ) : (
                assembledWords.map((word, idx) => {
                  const isCorrect = isWordCorrectAtIndex(idx);
                  return (
                    <motion.button
                      key={`assembled-${idx}`}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={() => handleRemoveWord(idx)}
                      className={`px-3.5 py-2 rounded-xl text-sm md:text-base font-reading font-medium transition-all shadow-sm ${
                        isCorrect
                          ? 'bg-amber-600/25 border border-amber-500/80 text-parchment-50 hover:bg-red-950/40 hover:border-red-500'
                          : 'bg-red-950/40 border border-red-500 text-red-200'
                      }`}
                    >
                      {word}
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>

          {/* Available Words Bank */}
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-stone-400 mb-2">
              Available Words
            </div>
            <div className="p-4 md:p-5 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-wrap gap-2.5 min-h-[120px]">
              {availableWords.map((item) => (
                <motion.button
                  key={item.id}
                  layout
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectWord(item)}
                  className="px-4 py-2.5 rounded-xl text-sm md:text-base font-reading font-medium bg-[#1a1f29] border border-stone-700 text-parchment-200 hover:border-amber-500 hover:bg-stone-800 shadow-sm active:bg-amber-700"
                >
                  {item.word}
                </motion.button>
              ))}
              {availableWords.length === 0 && !isCompleted && (
                <div className="text-xs text-stone-500 italic py-2">
                  All words placed. Check the sequence above!
                </div>
              )}
            </div>
          </div>

          {/* Success Card */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-emerald-950/90 to-stone-900 border-2 border-emerald-500/50 shadow-glow-gold text-left"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Scripture Locked in Memory! (+40 XP)</span>
                </div>
                <p className="text-base md:text-lg font-reading text-emerald-100 italic mb-3">
                  "{currentVerse.text}"
                </p>
                <div className="text-xs text-emerald-300 font-medium">
                  <strong>Takeaway for Today: </strong> {currentVerse.keyTakeaway}
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-900/40 flex justify-end">
                  <button
                    onClick={handleNextVerse}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>Next Verse</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pager Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-800">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveVerseIndex(prev => (prev - 1 + filteredVerses.length) % filteredVerses.length);
              }}
              className="text-xs font-medium text-stone-400 hover:text-stone-200 px-3.5 py-2 rounded-lg bg-stone-900 border border-stone-800"
            >
              Previous Verse
            </button>

            <span className="text-xs font-mono text-stone-500">
              Verse {activeVerseIndex + 1} of {filteredVerses.length}
            </span>

            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveVerseIndex(prev => (prev + 1) % filteredVerses.length);
              }}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 px-3.5 py-2 rounded-lg bg-stone-900 border border-amber-900/40"
            >
              Next Verse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
