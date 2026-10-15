import type { InteractionConfig } from '../../../types/story';

export interface InteractionProps<C extends InteractionConfig> {
  config: C;
  disabled?: boolean;
  onComplete: () => void;
}