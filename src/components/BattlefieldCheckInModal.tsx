import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Swords, 
  Briefcase, 
  HeartCrack, 
  Flame, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw 
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';
import { useLanguage } from '../context/LanguageContext';

export interface BattlefieldOption {
  id: string;
  title: string;
  subtitle: string;
  icon: 'briefcase' | 'heart' | 'flame' | 'compass' | 'swords';
  suggestedQuestId: string;
  suggestedDilemmaId: string;
  psalmReference: string;
  colorBorder: string;
  colorBg: string;
}

export const BATTLEFIELD_OPTIONS: BattlefieldOption[] = [
  {
    id: 'workplace-politics',
    title: 'Workplace Politics & Authority Tension',
    subtitle: 'Dealing with credit theft, difficult superiors, or toxic office dynamics.',
    icon: 'briefcase',
    suggestedQuestId: 'david-journey',
    suggestedDilemmaId: 'dilemma-credit-thief',
    psalmReference: 'Psalm 59 (When Saul sent men to watch David)',
    colorBorder: 'border-amber-500/60',
    colorBg: 'from-amber-950/40'
  },
  {
    id: 'anxiety-overwhelm',
    title: 'Anxiety, Burnout & Heavy Overwhelm',
    subtitle: 'Depleted energy, high-stress pressure, feeling like quitting.',
    icon: 'flame',
    suggestedQuestId: 'elijah-journey',
    suggestedDilemmaId: 'dilemma-burnout-home',
    psalmReference: 'Psalm 46 (God is our refuge and strength)',
    colorBorder: 'border-blue-500/60',
    colorBg: 'from-blue-950/40'
  },
  {
    id: 'betrayal-relational',
    title: 'Betrayal, Slander & Relational Friction',
    subtitle: 'Stung by friends, family conflict, or someone talking behind your back.',
    icon: 'heart',
    suggestedQuestId: 'joseph-journey',
    suggestedDilemmaId: 'dilemma-friend-betrayal',
    psalmReference: 'Psalm 55 (When a companion betrays trust)',
    colorBorder: 'border-red-500/60',
    colorBg: 'from-red-950/40'
  },
  {
    id: 'high-stakes-decision',
    title: 'High-Stakes Decision & Moral Courage',
    subtitle: 'Standing at a critical crossroad; pressure to compromise integrity.',
    icon: 'compass',
    suggestedQuestId: 'peter-journey',
    suggestedDilemmaId: 'dilemma-group-chat-pressure',
    psalmReference: 'Proverbs 3:5-6 & Psalm 27 (Whom shall I fear?)',
    colorBorder: 'border-purple-500/60',
    colorBg: 'from-purple-950/40'
  },
  {
    id: 'spiritual-dryness',
    title: 'Spiritual Dryness & Lethargy',
    subtitle: 'Feeling distant from God, going through the motions, needing fresh fire.',
    icon: 'swords',
    suggestedQuestId: 'david-journey',
    suggestedDilemmaId: 'dilemma-envy-spiral',
    psalmReference: 'Psalm 63 (My soul thirsts for You in a parched land)',
    colorBorder: 'border-emerald-500/60',
    colorBg: 'from-emerald-950/40'
  }
];

interface BattlefieldCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBattlefieldId: string | null;
  onSelectBattlefield: (battlefieldId: string | null) => void;
}

export const BattlefieldCheckInModal: React.FC<BattlefieldCheckInModalProps> = ({
  isOpen,
  onClose,
  activeBattlefieldId,
  onSelectBattlefield
}) => {
  const { t, language } = useLanguage();
  const modalRef = useModalLock(isOpen);
  if (!isOpen) return null;

  const getBattlefieldTitle = (id: string, fallback: string) => {
    switch (id) {
      case 'workplace-politics': return t('battlefield.workplace');
      case 'anxiety-overwhelm': return t('battlefield.anxiety');
      case 'betrayal-relational': return t('battlefield.betrayal');
      case 'high-stakes-decision': return t('battlefield.decision');
      case 'spiritual-dryness': return t('battlefield.dryness');
      default: return fallback;
    }
  };

  const getBattlefieldSubtitle = (id: string, fallback: string) => {
    switch (id) {
      case 'workplace-politics': return t('battlefield.workplaceDesc');
      case 'anxiety-overwhelm': return t('battlefield.anxietyDesc');
      case 'betrayal-relational': return t('battlefield.betrayalDesc');
      case 'high-stakes-decision': return t('battlefield.decisionDesc');
      case 'spiritual-dryness': return t('battlefield.drynessDesc');
      default: return fallback;
    }
  };

  const getBattlefieldPsalmReference = (id: string, fallback: string) => {
    if (language === 'es') {
      switch (id) {
        case 'workplace-politics': return 'Salmo 59 (Cuando Saúl envió a vigilar a David)';
        case 'anxiety-overwhelm': return 'Salmo 46 (Dios es nuestro refugio y fortaleza)';
        case 'betrayal-relational': return 'Salmo 55 (Cuando un compañero traiciona la confianza)';
        case 'high-stakes-decision': return 'Salmo 25 (Encamíname en tu verdad)';
        case 'spiritual-dryness': return 'Salmo 63 (Dios, Dios mío eres tú; te buscaré)';
        default: return fallback;
      }
    }
    if (language === 'fr') {
      switch (id) {
        case 'workplace-politics': return 'Psaume 59 (Quand Saül envoya surveiller David)';
        case 'anxiety-overwhelm': return 'Psaume 46 (Dieu est notre refuge et notre force)';
        case 'betrayal-relational': return 'Psaume 55 (Quand un compagnon trahit la confiance)';
        case 'high-stakes-decision': return 'Psaume 25 (Conduis-moi dans ta vérité)';
        case 'spiritual-dryness': return 'Psaume 63 (Ô Dieu! tu es mon Dieu, je te cherche)';
        default: return fallback;
      }
    }
    return fallback;
  };

  const handleSelect = (id: string) => {
    soundEngine.playSnap();
    onSelectBattlefield(id);
    onClose();
  };

  const handleReset = () => {
    soundEngine.playClick();
    onSelectBattlefield(null);
    onClose();
  };

  const renderIcon = (type: BattlefieldOption['icon']) => {
    switch (type) {
      case 'briefcase':
        return <Briefcase className="w-5 h-5 text-amber-400" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-blue-400" />;
      case 'heart':
        return <HeartCrack className="w-5 h-5 text-red-400" />;
      case 'compass':
        return <Compass className="w-5 h-5 text-purple-400" />;
      case 'swords':
        return <Swords className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-white dark:bg-ink-raised border-0 sm:border-2 border-amber-400 dark:border-amber-500/50 rounded-none sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-none sm:shadow-2xl relative text-left overflow-y-auto outline-none"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400 mb-1.5">
              <Swords className="w-4 h-4" />
              <span>{t('battlefield.modalTitle')}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-parchment-50">
              {t('battlefield.modalHeading')}
            </h3>
            <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 mt-1">
              {t('battlefield.modalDesc')}
            </p>
          </div>

          {/* Battlefield Options List */}
          <div className="space-y-3 mb-6">
            {BATTLEFIELD_OPTIONS.map((opt) => {
              const isSelected = activeBattlefieldId === opt.id;
              const title = getBattlefieldTitle(opt.id, opt.title);
              const subtitle = getBattlefieldSubtitle(opt.id, opt.subtitle);

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full p-4 rounded-2xl text-left transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? `bg-amber-500/15 ring-2 ring-amber-400/50`
                      : 'bg-stone-100/70 dark:bg-stone-900/60 hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/40 shrink-0 mt-0.5">
                    {renderIcon(opt.icon)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-serif font-bold text-sm md:text-base text-stone-900 dark:text-stone-100">
                        {title}
                      </h4>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t('battlefield.active')}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                      {subtitle}
                    </p>
                    <div className="text-[11px] font-mono text-amber-800 dark:text-amber-300/80 mt-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                      <span>{t('battlefield.fieldArmor', { ref: getBattlefieldPsalmReference(opt.id, opt.psalmReference) })}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Reset & Close */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200/60 dark:border-stone-800 text-xs">
            {activeBattlefieldId ? (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('battlefield.resetRotation')}</span>
              </button>
            ) : (
              <span className="text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                {t('battlefield.generalRotation')}
              </span>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all"
            >
              {t('battlefield.done')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
