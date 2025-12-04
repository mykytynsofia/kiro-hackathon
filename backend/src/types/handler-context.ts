import { Connection } from './connection';
import { Message } from './message';
import { GameManager } from '../managers/game-manager';
import { PlayerManager } from '../managers/player-manager';
import { RoomManager } from '../managers/room-manager';
import { TimerManager } from '../managers/timer-manager';
import { BroadcastService } from '../services/broadcast.service';
import { ConnectionManager } from '../websocket/connection-manager';

/**
 * Context provided to message handlers
 */
export interface HandlerContext {
  connection: Connection;
  message: Message;
  connectionManager: ConnectionManager;
  gameManager: GameManager;
  playerManager: PlayerManager;
  roomManager: RoomManager;
  timerManager: TimerManager;
  broadcast: BroadcastService;
}

/**
 * Message handler function type
 */
export type MessageHandler = (context: HandlerContext) => Promise<void>;
