import React, { useState } from 'react';
import { getConnectedNexusItems, type ConnectedNexusItem } from '../data/nexusGraph';
import { Network, ExternalLink, ChevronDown, ChevronUp, Shield, BookOpen, Scroll, UserCheck } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface TacticalNexusCardProps {
  entityId: string;
  onOpenEntity?: (type: string, id: string) => void;
}

export const TacticalNexusCard: React.FC<TacticalNexusCardProps> = ({ entityId, onOpenEntity }) => {
  const items: ConnectedNexusItem[] = getConnectedNexusItems(entityId);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  if (items.length === 0) return null;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'psalm':
        return <Scroll className="w-3.5 h-3.5 text-cyan-400" />;
      case 'proverb':
        return <BookOpen className="w-3.5 h-3.5 text-amber-400" />;
      case 'dossier':
        return <UserCheck className="w-3.5 h-3.5 text-red-400" />;
      case 'dilemma':
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Network className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="rounded-2xl bg-cyan-50/50 dark:bg-gradient-to-r dark:from-stone-900/95 dark:via-[#10141c] dark:to-stone-900/95 border border-cyan-200 dark:border-cyan-800/40 p-4 shadow-sm dark:shadow-lg">
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => {
          soundEngine.playClick();
          setIsOpen(!isOpen);
        }}
      >
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
          <h4 className="text-xs font-mono font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-widest">
            Tactical Nexus • Living Canon Intelligence ({items.length} links)
          </h4>
        </div>

        <button 
          type="button"
          aria-label={isOpen ? "Collapse tactical nexus" : "Expand tactical nexus"}
          className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white p-1"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-cyan-200/60 dark:border-stone-800/80 space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {items.map(({ connection, target }) => (
              <div 
                key={target.id}
                className="p-3 rounded-xl bg-white dark:bg-black/40 border border-stone-200 dark:border-stone-800/80 hover:border-cyan-500/50 transition-all text-xs flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40 font-bold">
                      {connection.badgeLabel}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                      {getIconForType(target.type)}
                      <span>{target.label}</span>
                    </div>
                  </div>

                  <h5 className="font-serif font-bold text-stone-900 dark:text-stone-200 text-xs mb-1">
                    {target.title}
                  </h5>

                  <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed mb-2 font-reading">
                    {connection.contextNote}
                  </p>
                </div>

                {target.scriptureRef && (
                  <div className="text-[10px] font-mono text-amber-700 dark:text-amber-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-900">
                    <span>{target.scriptureRef}</span>
                    {onOpenEntity && (
                      <button 
                        onClick={() => onOpenEntity(target.type, target.id)}
                        className="text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
