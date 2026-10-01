import React, { useState } from 'react';
import { getConnectedNexusItems, type ConnectedNexusItem } from '../data/nexusGraph';
import { Network, ExternalLink, ChevronDown, ChevronUp, Shield, BookOpen, Scroll, UserCheck } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

interface TacticalNexusCardProps {
  entityId: string;
  onOpenEntity?: (type: string, id: string) => void;
}

export const TacticalNexusCard: React.FC<TacticalNexusCardProps> = ({ entityId, onOpenEntity }) => {
  const { t } = useLanguage();
  const items: ConnectedNexusItem[] = getConnectedNexusItems(entityId);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  if (items.length === 0) return null;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'psalm':
        return <Scroll className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />;
      case 'proverb':
        return <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'dossier':
        return <UserCheck className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
      case 'dilemma':
        return <Shield className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
      default:
        return <Network className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
    }
  };

  const getRelationshipBadgeStyle = (rel: string) => {
    switch (rel) {
      case 'written_during':
        return 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
      case 'antagonist_profile':
      case 'theological_precedent':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'wisdom_principle':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'modern_parallel':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      default:
        return 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700';
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-900 border border-cyan-300/80 dark:border-cyan-800/60 shadow-sm p-4 sm:p-5 transition-all">
      {/* Header bar */}
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => {
          soundEngine.playClick();
          setIsOpen(!isOpen);
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300/70 dark:border-cyan-800 flex items-center justify-center">
            <Network className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-50">
                {t('nexus.title', { count: items.length })}
              </h4>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800/50">
                {items.length} Linked
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Cross-referenced prayers, doctrine, and parallels directly tied to this event.
            </p>
          </div>
        </div>

        <button 
          type="button"
          aria-label={isOpen ? t('nexus.collapse') : t('nexus.expand')}
          className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
          {/* Responsive, roomy grid - no cramped scroll container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {items.map(({ connection, target }) => (
              <div 
                key={target.id}
                className="p-4 rounded-xl bg-stone-50/80 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800/80 hover:border-cyan-400/60 dark:hover:border-cyan-700/60 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md font-bold border ${getRelationshipBadgeStyle(connection.relationship)}`}>
                      {connection.badgeLabel}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
                      {getIconForType(target.type)}
                      <span>{target.label}</span>
                    </div>
                  </div>

                  <h5 className="font-serif font-bold text-stone-900 dark:text-parchment-100 text-sm mb-1.5 leading-snug">
                    {target.title}
                  </h5>

                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
                    {connection.contextNote}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-stone-200/70 dark:border-stone-850">
                  <span className="text-xs font-mono font-medium text-amber-700 dark:text-amber-400 truncate max-w-[200px]">
                    {target.scriptureRef || target.label}
                  </span>
                  {onOpenEntity && (
                    <button 
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        onOpenEntity(target.type, target.id);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-100/80 hover:bg-cyan-200 dark:bg-cyan-950 dark:hover:bg-cyan-900 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/80 flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>Open Intel</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
