import React from 'react';
import { Compass, Brain, Shield, ShieldAlert, Car, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export type NavTab = 'dashboard' | 'wordforge' | 'dilemmas' | 'arsenal';

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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0f14]/95 backdrop-blur-lg border-t border-stone-800/90 px-3 py-2">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <button
          onClick={() => {
            soundEngine.playClick();
            onSelectTab('dashboard');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
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
            onSelectTab('wordforge');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
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
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
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
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
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
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-stone-400 hover:text-amber-400 transition-all"
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] md:text-[11px]">Drive Audio</span>
        </button>

        <button
          onClick={onToggleAmbience}
          title={currentAmbience === 'none' ? 'Play Ambience' : 'Mute Ambience'}
          className={`hidden sm:flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
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
    </div>
  );
};
