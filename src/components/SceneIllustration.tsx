import React, { useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface SceneIllustrationProps {
  theme: 'valley_battlefield' | 'cave_refuge' | 'desert_canyon' | 'courtyard_fire' | 'prison_cell' | 'sea_storm' | 'palace_hall' | 'red_sea' | 'mount_carmel';
  className?: string;
}

interface SceneMeta {
  src: string;
  location: string;
  description: string;
}

const SCENE_DATA: Record<string, SceneMeta> = {
  valley_battlefield: {
    src: '/images/valley_battlefield.jpg',
    location: 'Valley of Elah • Frontline',
    description: 'David facing the 9-foot champion Goliath across the mountain ravine.'
  },
  cave_refuge: {
    src: '/images/cave_refuge.jpg',
    location: 'Cave of Adullam • The Outlaw Haven',
    description: 'David and his 400 battle-worn outlaws gathered around the limestone campfire.'
  },
  desert_canyon: {
    src: '/images/desert_canyon.jpg',
    location: 'Dothan Wilderness • The Dry Cistern',
    description: 'The ancient stone cistern under the blistering sun as merchants approach.'
  },
  courtyard_fire: {
    src: '/images/courtyard_fire.jpg',
    location: 'Jerusalem • High Priest Courtyard',
    description: 'Peter in the shadows of the charcoal fire as the rooster perches on the arch.'
  },
  prison_cell: {
    src: '/images/prison_cell.jpg',
    location: 'Philippi • Inner Roman Dungeon',
    description: 'Paul and Silas bound in heavy wooden stocks singing at midnight.'
  },
  red_sea: {
    src: '/images/red_sea.jpg',
    location: 'The Red Sea • The Impossible Stand',
    description: 'Moses raising his staff as towering oceanic walls part with the supernatural pillar of fire.'
  },
  mount_carmel: {
    src: '/images/mount_carmel.jpg',
    location: 'Mount Carmel • The Consuming Fire',
    description: 'Supernatural fire strikes the water-soaked altar in front of 450 stunned false prophets.'
  },
  palace_hall: {
    src: '/images/palace_hall.jpg',
    location: 'Imperial Citadel • Susa & Babylon',
    description: 'The towering columns and golden throne rooms where decrees are signed and kings are confronted.'
  },
  sea_storm: {
    src: '/images/sea_storm.jpg',
    location: 'Mediterranean Sea • The Tempest',
    description: 'Towering dark waves battering the ship as lightning cracks across the midnight sky.'
  }
};

export const SceneIllustration: React.FC<SceneIllustrationProps> = ({ theme, className = '' }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const scene = SCENE_DATA[theme] || {
    src: '/images/valley_battlefield.jpg',
    location: 'Biblical Chronicles',
    description: 'An interactive historical journey.'
  };

  return (
    <>
      <div 
        className={`group relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-amber-900/40 bg-stone-950 shadow-2xl transition-all duration-300 hover:border-amber-500/60 ${className}`}
      >
        {!isLoaded && (
          <div className="absolute inset-0 bg-stone-900 animate-pulse flex items-center justify-center text-xs text-stone-500 font-mono">
            Loading artwork...
          </div>
        )}

        <img
          src={scene.src}
          alt={scene.location}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-transparent to-black/30 pointer-events-none" />

        <div className="absolute top-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-amber-600/40 text-[11px] font-mono tracking-wider uppercase text-amber-300 shadow-md">
          {scene.location}
        </div>

        <button
          onClick={() => setIsLightboxOpen(true)}
          title="Inspect Artwork"
          className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/70 hover:bg-amber-600 hover:text-black text-stone-300 backdrop-blur-md border border-stone-700/60 transition-all opacity-90 group-hover:opacity-100 shadow-md flex items-center gap-1.5 text-xs font-semibold"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Zoom Artwork</span>
        </button>
      </div>

      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto flex flex-col items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="max-w-5xl w-full flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full rounded-2xl overflow-hidden border-2 border-amber-600/40 shadow-glow-gold">
              <img
                src={scene.src}
                alt={scene.location}
                className="w-full max-h-[80vh] object-contain bg-black"
              />
            </div>
            <div className="text-center">
              <h3 className="text-base md:text-lg font-serif font-bold text-parchment-50">
                {scene.location}
              </h3>
              <p className="text-xs md:text-sm text-stone-400 mt-0.5">
                {scene.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
