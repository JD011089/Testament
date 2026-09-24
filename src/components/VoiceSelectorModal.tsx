import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Mic, Play, Pause } from 'lucide-react';
import { soundEngine, NARRATOR_VOICES, type NarratorProfile } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_TEXT = "The Lord is my strength and my shield; in Him my heart trusts, and I am helped.";

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({ isOpen, onClose }) => {
  const [selectedVoice, setSelectedVoice] = useState<NarratorProfile>(() => soundEngine.getNarratorProfile());
  const [previewingVoice, setPreviewingVoice] = useState<NarratorProfile | null>(null);

  const modalRef = useModalLock(isOpen);

  useEffect(() => {
    const handleVoiceChange = (e: Event) => {
      const customEvent = e as CustomEvent<NarratorProfile>;
      if (customEvent.detail) {
        setSelectedVoice(customEvent.detail);
      }
    };

    window.addEventListener('testament-voice-changed', handleVoiceChange);
    return () => window.removeEventListener('testament-voice-changed', handleVoiceChange);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      soundEngine.stopSpeaking();
      setPreviewingVoice(null);
    }
  }, [isOpen]);

  const handleSelectVoice = (voiceId: NarratorProfile) => {
    soundEngine.stopSpeaking();
    setPreviewingVoice(null);
    soundEngine.setNarratorProfile(voiceId);
    setSelectedVoice(voiceId);
  };

  const handlePlaySample = (voiceId: NarratorProfile, e: React.MouseEvent) => {
    e.stopPropagation();

    if (previewingVoice === voiceId) {
      soundEngine.stopSpeaking();
      setPreviewingVoice(null);
      return;
    }

    soundEngine.stopSpeaking();
    setPreviewingVoice(voiceId);

    // Temporarily switch voice to preview sample
    soundEngine.setNarratorProfile(voiceId);
    setSelectedVoice(voiceId);

    soundEngine.speakVerse(SAMPLE_TEXT, () => {
      setPreviewingVoice(null);
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain">
        {/* Click outside backdrop */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg rounded-3xl bg-white dark:bg-[#12151d] border border-stone-200 dark:border-amber-500/40 shadow-2xl p-5 sm:p-6 text-left focus:outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-100">
                  Scripture Reading Voice
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Select your voice for Bible reading, briefings & quests
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              aria-label="Close"
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Voice Cards */}
          <div className="py-4 space-y-3">
            {(Object.keys(NARRATOR_VOICES) as NarratorProfile[]).map((key) => {
              const voice = NARRATOR_VOICES[key];
              const isSelected = selectedVoice === key;
              const isPreviewing = previewingVoice === key;

              return (
                <div
                  key={key}
                  onClick={() => handleSelectVoice(key)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-left flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-50/70 dark:bg-amber-500/15 border-amber-500 shadow-xs'
                      : 'bg-stone-50/60 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 hover:border-amber-400/60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}>
                      {key === 'cinematic' ? '🎬' : key === 'brotherhood' ? '🤝' : key === 'scholar' ? '📜' : '🕊️'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-serif font-bold text-stone-900 dark:text-parchment-100">
                          {voice.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {voice.subtitle}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                        {voice.description}
                      </p>
                    </div>
                  </div>

                  {/* Play Sample Button */}
                  <button
                    onClick={(e) => handlePlaySample(key, e)}
                    className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all mt-0.5 ${
                      isPreviewing
                        ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold shadow-xs'
                        : 'bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-250 dark:border-stone-700'
                    }`}
                    title={isPreviewing ? 'Stop sample' : 'Listen to voice sample'}
                  >
                    {isPreviewing ? (
                      <>
                        <Pause className="w-3.5 h-3.5 animate-pulse" />
                        <span>Sample</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-amber-500" />
                        <span>Sample</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
              Applied app-wide to chapters, briefings & quests
            </span>
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-xs"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
