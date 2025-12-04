import { WebSocket } from 'ws';

/**
 * Represents a WebSocket connection with associated player/game data
 */
export interface Connection {
  id: string;
  ws: WebSocket;
  playerId: string | null;
  gameId: string | null;
  lastHeartbeat: number;
}
