import React, { useState } from 'react';
import type { StoryQuest } from '../types';
import { STORY_QUESTS } from '../data/stories';
import { soundEngine } from '../utils/audio';
import { 
  Flame, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Clock, 
  BookOpen, 
  Brain, 
  Wind, 
  Music,
  Shield,
  Coffee,
  X,
  BookA,
  Zap,
  ShieldAlert,
  Car,
  Download,
  Play,
  Pause
} from 'lucide-react';

interface DashboardProps {
  onSelectQuest: (quest: StoryQuest) => void;
  onOpenWordForge: () => void;
  onOpenArsenal: () => void;
  onOpenTimeline: () => void;
  onOpenDossiers: () => void;
  onOpenStreetTranslator: () => void;
  onOpenDilemmas: () => void;
  onOpenDriveMode: () => void;
  completedActs: string[];
  memorizedVerses: string[];
  unlockedRelics?: string[];
  streakCount: number;
  xp: number;
  currentAmbience: 'none' | 'campfire' | 'wind' | 'sanctuary';
  onToggleAmbience: (type: 'campfire' | 'wind' | 'sanctuary') => void;
}

const QUEST_IMAGES: Record<string, string> = {
  'david-journey': '/images/valley_battlefield.jpg',
  'joseph-journey': '/images/desert_canyon.jpg',
  'peter-journey': '/images/courtyard_fire.jpg',
  'paul-journey': '/images/prison_cell.jpg',
  'moses-journey': '/images/red_sea.jpg',
  'elijah-journey': '/images/mount_carmel.jpg',
};

const ALL_RELICS = [
  { id: 'david-stones', name: '5 Smooth Stones', character: 'David', icon: '🪨', desc: 'Courage with your authentic tools.' },
  { id: 'joseph-ring', name: 'Pharaoh’s Signet Ring', character: 'Joseph', icon: '💍', desc: 'Quiet integrity turns into authority.' },
  { id: 'moses-staff', name: 'The Shepherd’s Staff', character: 'Moses', icon: '🪵', desc: 'Standing firm when panic surrounds you.' },
  { id: 'elijah-mantle', name: 'Weathered Mantle', character: 'Elijah', icon: '🧥', desc: 'Hearing the gentle whisper in burnout.' },
  { id: 'peter-brazier', name: 'Charcoal Brazier', character: 'Peter', icon: '🔥', desc: 'Grace transforms failure into mission.' },
  { id: 'paul-stocks', name: 'Broken Stocks', character: 'Paul', icon: '⛓️', desc: 'An unshakable soul in chains.' },
];

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectQuest,
  onOpenWordForge,
  onOpenArsenal,
  onOpenTimeline = () => {},
  onOpenDossiers = () => {},
  onOpenStreetTranslator = () => {},
  onOpenDilemmas = () => {},
  onOpenDriveMode = () => {},
  completedActs,
  memorizedVerses,
  unlockedRelics = [],
  streakCount,
  xp,
  currentAmbience,
  onToggleAmbience
}) => {
  const [activeTrack, setActiveTrack] = useState<string>('All');
  const [showMorningBriefing, setShowMorningBriefing] = useState<boolean>(false);
  const [isPlayingBriefing, setIsPlayingBriefing] = useState<boolean>(false);

  const getRankTitle = (points: number) => {
    if (points >= 500) return 'Iron Pillar';
    if (points >= 300) return 'Mighty Man of Adullam';
    if (points >= 150) return 'Story Explorer';
    return 'Seeker';
  };

  const tracks = ['All', 'Underdog & Purpose', 'Grace After Failure', 'High-Pressure Crisis'];

  const filteredQuests = activeTrack === 'All'
    ? STORY_QUESTS
    : STORY_QUESTS.filter(q => q.starterTrack === activeTrack);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-40 sm:pb-48 text-left">
      {/* Top Banner Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-[#11141a] border border-stone-800 shadow-md mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-glow-gold bg-stone-950 shrink-0">
            <img 
              src="/icons/icon-192.png" 
              alt="Testament Emblem" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-parchment-100">Testament</h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 font-mono font-bold">
                {getRankTitle(xp)}
              </span>
            </div>
            <p className="text-xs text-stone-400">The Living Word • Authentic Bible Journey</p>
          </div>
        </div>

        {/* Action Controls & Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowMorningBriefing(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-semibold hover:bg-amber-600 hover:text-black transition-all shadow-glow-ember"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>3-Min Morning Briefing</span>
          </button>

          <button
            onClick={onOpenDriveMode}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold hover:border-amber-500/60 hover:text-amber-400 transition-all"
          >
            <Car className="w-3.5 h-3.5 text-amber-500" />
            <span>Drive Audio</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              window.dispatchEvent(new CustomEvent('open-pwa-install'));
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold hover:border-amber-500/60 hover:text-amber-400 transition-all"
            title="Install Testament App"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>Install App</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20" />
            <span className="text-xs font-mono font-bold text-parchment-100">{streakCount} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-300">{xp} XP</span>
          </div>
        </div>
      </div>

      {/* WIDESCREEN DESKTOP GRID: MAIN STAGE (col 8) + SIDEBAR (col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* MAIN STAGE (65-70% on Desktop) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Cinematic Hero Study Table Banner */}
          <div className="rounded-2xl overflow-hidden border-2 border-amber-700/40 shadow-2xl relative bg-[#0e1117]">
            <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-stone-950">
              <img 
                src="/images/hero_banner.jpg" 
                alt="Ancient study table with scripture and shield" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1117] via-stone-950/50 to-transparent" />
            </div>

            <div className="p-5 md:p-6 relative">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Daily Truth For The Trenches</span>
              </div>

              <h3 className="text-xl md:text-3xl font-serif font-black text-parchment-50 mb-2">
                "Iron sharpens iron, and one man sharpens another."
              </h3>

              <p className="text-xs md:text-sm text-parchment-200/90 leading-relaxed mb-4 max-w-2xl">
                Friction creates edge. When you try to carry all your stress, financial weight, and family worries alone without brothers who tell you the truth, you go dull. Don't fight in isolation.
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                <span className="text-xs font-mono text-amber-500 font-semibold">Proverbs 27:17</span>
                <button
                  onClick={onOpenWordForge}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <span>Lock this into memory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* LEARNER'S TOOLKIT (Visual & Non-Academic Learning Accelerators) */}
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 mb-3">
              The Learner’s Toolkit • Anti-Textbook Accelerators
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenTimeline();
                }}
                className="p-4 rounded-2xl bg-[#141822] border border-stone-800 hover:border-amber-500/70 hover:bg-[#181d2a] transition-all text-left group shadow-sm"
              >
                <Clock className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-parchment-50">60-Sec Timeline</div>
                <div className="text-[10px] text-stone-400 mt-0.5">The Bible in 6 eras</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenDossiers();
                }}
                className="p-4 rounded-2xl bg-[#141822] border border-stone-800 hover:border-amber-500/70 hover:bg-[#181d2a] transition-all text-left group shadow-sm"
              >
                <Zap className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-parchment-50">Character Dossiers</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Superpowers & flaws</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenStreetTranslator();
                }}
                className="p-4 rounded-2xl bg-[#141822] border border-stone-800 hover:border-amber-500/70 hover:bg-[#181d2a] transition-all text-left group shadow-sm"
              >
                <BookA className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-parchment-50">Street Translator</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Zero religious jargon</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenDilemmas();
                }}
                className="p-4 rounded-2xl bg-[#141822] border border-stone-800 hover:border-amber-500/70 hover:bg-[#181d2a] transition-all text-left group shadow-sm"
              >
                <ShieldAlert className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-parchment-50">"What’s the Play?"</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Real-life simulator</div>
              </button>
            </div>
          </div>

          {/* Curated Starter Tracks (Recommendation Filters) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-amber-500 mb-1">
                  <Compass className="w-4 h-4" />
                  <span>Curated Paths & Deep Dives</span>
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-black text-parchment-50">
                  Choose Your Journey
                </h3>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {tracks.map(track => (
                  <button
                    key={track}
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveTrack(track);
                    }}
                    className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                      activeTrack === track
                        ? 'bg-amber-600 text-black font-bold shadow-sm'
                        : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {track}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-COLUMN GRID OF ILLUSTRATED QUEST CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredQuests.map((quest) => {
                const completedCount = quest.acts.filter(a => completedActs.includes(a.id)).length;
                const isFullyComplete = completedCount === quest.acts.length;
                const questImage = QUEST_IMAGES[quest.id] || '/images/valley_battlefield.jpg';

                return (
                  <div
                    key={quest.id}
                    className="flex flex-col justify-between rounded-2xl bg-[#12151b] border border-stone-800 hover:border-amber-600/60 transition-all shadow-lg overflow-hidden group"
                  >
                    {/* Visual Illustration Thumbnail */}
                    <div className="relative h-44 w-full shrink-0 overflow-hidden bg-stone-950">
                      <img 
                        src={questImage} 
                        alt={quest.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#12151b] via-transparent to-transparent" />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-amber-600/30 text-[10px] font-mono text-amber-400 uppercase">
                        {quest.heroName}
                      </div>

                      {quest.starterTrack && (
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-amber-950/80 backdrop-blur-md border border-amber-800/40 text-[9px] font-mono text-amber-300 uppercase">
                          {quest.starterTrack}
                        </div>
                      )}
                    </div>

                    {/* Quest Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
                          <span>{quest.testament}</span>
                          <span>•</span>
                          <span>{quest.historicalPeriod}</span>
                        </div>

                        <h4 className="text-lg font-serif font-bold text-parchment-50 group-hover:text-amber-400 transition-colors">
                          {quest.title}
                        </h4>

                        <p className="text-xs text-stone-400 font-medium">
                          {quest.subtitle}
                        </p>

                        <p className="text-xs text-stone-300 italic pt-2 line-clamp-2">
                          "{quest.summary}"
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-stone-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          <span>{quest.estimatedMinutes} min</span>
                          <span>•</span>
                          <span>{completedCount}/{quest.acts.length} Acts</span>
                        </div>

                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            onSelectQuest(quest);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs flex items-center gap-1 transition-all shadow-glow-gold"
                        >
                          <span>{completedCount === 0 ? 'Start' : isFullyComplete ? 'Replay' : 'Continue'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex gap-1 px-5 pb-3">
                      {quest.acts.map((act) => (
                        <div
                          key={act.id}
                          className={`h-1.5 rounded-full flex-1 transition-colors ${
                            completedActs.includes(act.id) ? 'bg-amber-500' : 'bg-stone-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (30-35% on Desktop) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* THE ARMORY: RELICS OF FAITH */}
          <div className="p-5 rounded-2xl bg-[#13161c] border border-stone-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-serif font-bold text-parchment-50">
                  The Armory • Relics of Faith
                </h4>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {unlockedRelics.length}/{ALL_RELICS.length} Unlocked
              </span>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              Tangible trophies earned by completing the legendary trials.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {ALL_RELICS.map((relic) => {
                const isUnlocked = unlockedRelics.includes(relic.id);
                return (
                  <div
                    key={relic.id}
                    title={isUnlocked ? `${relic.name}: ${relic.desc}` : `Locked (Complete ${relic.character}'s journey)`}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isUnlocked
                        ? 'bg-amber-950/30 border-amber-600/50 text-parchment-100 shadow-sm'
                        : 'bg-stone-900/50 border-stone-800/80 text-stone-600 opacity-60'
                    }`}
                  >
                    <div className="text-xl mb-1">{relic.icon}</div>
                    <div className="text-xs font-bold truncate text-parchment-100">
                      {isUnlocked ? relic.name : '??? Locked'}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {relic.character}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WORD FORGE FAST-LAUNCH CARD */}
          <div className="p-5 rounded-2xl bg-[#12151b] border border-stone-800 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-serif font-bold text-parchment-50">
                The Word Forge
              </h4>
            </div>
            <p className="text-xs text-stone-400 mb-3">
              Tactile scripture memory with word tiles. Practice verses for stress, anger, and purpose.
            </p>
            <div className="text-xs font-mono text-amber-400 mb-3">
              {memorizedVerses.length} Scriptures Mastered
            </div>
            <button
              onClick={onOpenWordForge}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-parchment-100 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Launch Word Forge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SCRIPTURE ARSENAL CARD */}
          <div className="p-5 rounded-2xl bg-[#12151b] border border-stone-800 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-stone-400" />
              <h4 className="text-sm font-serif font-bold text-parchment-50">
                The Scripture Arsenal
              </h4>
            </div>
            <p className="text-xs text-stone-400 mb-3">
              Curated verses with plain-English breakdowns and personal reflection journal.
            </p>
            <button
              onClick={onOpenArsenal}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-parchment-100 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Open Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ATMOSPHERIC AUDIO SOUNDSCAPE */}
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-300">
                <Music className="w-4 h-4 text-amber-500" />
                <span>Ambient Soundscape</span>
              </div>
              {currentAmbience !== 'none' && (
                <span className="text-[10px] font-mono text-amber-400 uppercase">
                  Playing: {currentAmbience}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onToggleAmbience('campfire')}
                className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  currentAmbience === 'campfire'
                    ? 'bg-amber-600 border-amber-500 text-black font-bold'
                    : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Campfire</span>
              </button>

              <button
                onClick={() => onToggleAmbience('wind')}
                className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  currentAmbience === 'wind'
                    ? 'bg-amber-600 border-amber-500 text-black font-bold'
                    : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Breeze</span>
              </button>

              <button
                onClick={() => onToggleAmbience('sanctuary')}
                className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  currentAmbience === 'sanctuary'
                    ? 'bg-amber-600 border-amber-500 text-black font-bold'
                    : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Drone</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-MINUTE MORNING BRIEFING MODAL */}
      {showMorningBriefing && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto flex items-start sm:items-center justify-center p-4"
          onClick={() => setShowMorningBriefing(false)}
        >
          <div 
            className="max-w-lg w-full p-6 rounded-2xl bg-[#141820] border-2 border-amber-600/50 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-lg">
                <Coffee className="w-5 h-5" />
                <span>Today's 3-Minute Morning Briefing</span>
              </div>
              <button 
                onClick={() => setShowMorningBriefing(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                <strong className="text-amber-400">1. Real Moment: </strong>
                Moses stood at the edge of the Red Sea with 600 chariots charging behind him. He had no army, just a staff and a command to "be still."
              </div>

              <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-900/40">
                <strong className="text-amber-300">2. Truth for the Pocket: </strong>
                "The Lord will fight for you; you need only to be still." — Exodus 14:14
              </div>

              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                <strong className="text-amber-400">3. Your Call Today: </strong>
                When an unexpected crisis or stressful email arrives today, do not react with panic or impulsive anger. Take 3 deep breaths and stand firm.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (isPlayingBriefing) {
                    soundEngine.stopSpeaking();
                    setIsPlayingBriefing(false);
                  } else {
                    setIsPlayingBriefing(true);
                    soundEngine.speakVerse(
                      "Today's 3-Minute Morning Briefing. Act 1: Real Moment. Moses stood at the edge of the Red Sea with six hundred iron chariots charging behind him. He had no army, just a shepherd's staff, and a command to be still. Act 2: Truth for the Pocket. The Lord will fight for you; you need only to be still. Exodus 14:14. Act 3: Your Call Today. When an unexpected crisis or stressful message arrives today, do not react with impulsive anger or panic. Take three deep breaths, stand firm, and let the Lord fight the battle.",
                      () => setIsPlayingBriefing(false),
                      '/audio/morning_briefing.mp3'
                    );
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isPlayingBriefing
                    ? 'bg-amber-600 text-stone-950 font-extrabold border-amber-500 shadow-glow-gold'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                {isPlayingBriefing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-500" />}
                <span>{isPlayingBriefing ? 'Pause Audio' : 'Listen (Studio Voice)'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.stopSpeaking();
                  setIsPlayingBriefing(false);
                  soundEngine.playVictory();
                  setShowMorningBriefing(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs shadow-glow-gold"
              >
                Anchor Set • Let's Go
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
