import { ConnectionStatus } from './enums';

/**
 * A player in a game
 */
export interface Player {
  id: string;
  displayName: string;
  icon?: string; // Player avatar emoji
  connectionStatus: ConnectionStatus;
  joinedAt: number;
  currentRoomId: string | null;
}
