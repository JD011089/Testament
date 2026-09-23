import React from 'react';
import { Compass, BookOpen, Brain, Shield, ShieldAlert, Car, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export type NavTab = 'dashboard' | 'library' | 'wordforge' | 'dilemmas' | 'arsenal';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentAmbience: 'none' | 'campfire' | 'wind' | 'sanctuary';
  onToggleAmbience: () => void;
  onOpenDriveMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  currentAmbience,
  onToggleAmbience,
  onOpenDriveMode
}) => {
  return (
    <nav 
      role="navigation" 
      aria-label="Main Navigation" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0f14]/95 backdrop-blur-lg border-t border-stone-800/90 px-3 py-2"
    >
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <button
          onClick={() => {
            soundEngine.playClick();
            onSelectTab('dashboard');
          }}
          aria-current={currentTab === 'dashboard' ? 'page' : undefined}
          aria-label="Quests Dashboard"
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 py-1 px-2 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-amber-500 ${
            currentTab === 'dashboard'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] md:text-[11px]">Quests</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onSelectTab('library');
          }}
          aria-current={currentTab === 'library' ? 'page' : undefined}
          aria-label="66-Book Field Library"
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 py-1 px-2 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-amber-500 ${
            currentTab === 'library'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] md:text-[11px]">Library</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onSelectTab('wordforge');
          }}
          aria-current={currentTab === 'wordforge' ? 'page' : undefined}
          aria-label="Word Forge Scripture Memory"
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 py-1 px-2 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-amber-500 ${
            currentTab === 'wordforge'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Brain className="w-5 h-5" />
          <span className="text-[10px] md:text-[11px]">Word Forge</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onSelectTab('dilemmas');
          }}
          aria-current={currentTab === 'dilemmas' ? 'page' : undefined}
          aria-label="What's the Play Dilemma Simulator"
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 py-1 px-2.5 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-amber-500 ${
            currentTab === 'dilemmas'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[10px] md:text-[11px]">The Play?</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onSelectTab('arsenal');
          }}
          aria-current={currentTab === 'arsenal' ? 'page' : undefined}
          aria-label="The Scripture Arsenal"
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 py-1 px-2.5 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-amber-500 ${
            currentTab === 'arsenal'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] md:text-[11px]">The Arsenal</span>
        </button>

        <button
          onClick={onOpenDriveMode}
          title="Drive & Commute Audio"
          aria-label="Drive and Commute Audio"
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 py-1 px-2.5 rounded-xl text-stone-400 hover:text-amber-400 transition-all focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] md:text-[11px]">Drive Audio</span>
        </button>

        <button
          onClick={onToggleAmbience}
          title={currentAmbience === 'none' ? 'Play Ambience' : 'Mute Ambience'}
          aria-label={currentAmbience === 'none' ? 'Play Background Ambience' : `Mute Ambience (Playing ${currentAmbience})`}
          className={`hidden sm:flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 py-1 px-2.5 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-amber-500 ${
            currentAmbience !== 'none'
              ? 'text-amber-400 font-bold'
              : 'text-stone-500 hover:text-stone-300'
          }`}
        >
          {currentAmbience !== 'none' ? (
            <Volume2 className="w-5 h-5 text-amber-500" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
          <span className="text-[10px] md:text-[11px] capitalize">{currentAmbience !== 'none' ? currentAmbience : 'Audio'}</span>
        </button>
      </div>
    </nav>
  );
};
