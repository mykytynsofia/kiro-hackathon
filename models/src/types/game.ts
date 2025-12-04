import { GameState } from './enums';
import { Player } from './player';
import { Room } from './room';

/**
 * A game session
 */
export interface Game {
  id: string;
  state: GameState;
  hostId: string;
  players: Player[];
  rooms: Room[];
  maxPlayers: number;
  createdAt: number;
  name?: string;
}
