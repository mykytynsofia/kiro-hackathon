import { ConnectionStatus } from './enums';

/**
 * A player in a game
 */
export interface Player {
  id: string;
  displayName: string;
  connectionStatus: ConnectionStatus;
  joinedAt: number;
  currentRoomId: string | null;
}
