import { Phase } from './enums';
import { ChainEntry } from './chain';

/**
 * A room where players complete phases
 */
export interface Room {
  id: string;
  index: number;
  phase: Phase;
  currentPlayerId: string | null;
  chain: ChainEntry[];
  phaseStartedAt: number;
  phaseDuration: number;
}
