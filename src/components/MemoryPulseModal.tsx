import React from 'react';
import { CalendarRemindersModal } from './CalendarRemindersModal';
import type { MemoryVerse } from '../types';

interface MemoryPulseModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVerse?: MemoryVerse | null;
  onOpenWordForge?: (verseId: string) => void;
}

/**
 * Legacy wrapper forwarding to CalendarRemindersModal.
 * Push notifications are replaced by native calendar reminders.
 */
export const MemoryPulseModal: React.FC<MemoryPulseModalProps> = ({
  isOpen,
  onClose,
  targetVerse,
  onOpenWordForge
}) => {
  return (
    <CalendarRemindersModal
      isOpen={isOpen}
      onClose={onClose}
      initialType="recall"
      targetVerse={targetVerse}
      onOpenWordForge={onOpenWordForge}
    />
  );
};
