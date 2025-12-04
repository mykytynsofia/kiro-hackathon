import { ConnectionManager } from '../websocket/connection-manager';
import { Message } from '../types';
import { Game } from '@monday-painter/models';

/**
 * Handles message broadcasting to clients
 */
export class BroadcastService {
  constructor(private connectionManager: ConnectionManager) {}

  /**
   * Send message to all players in a game
   */
  toGame(game: Game, message: Message): void {
    const playerIds = game.players.map(p => p.id);
    
    for (const playerId of playerIds) {
      this.toPlayer(playerId, message);
    }
  }

  /**
   * Send message to a specific player
   */
  toPlayer(playerId: string, message: Message): void {
    const connection = this.connectionManager.getConnectionByPlayerId(playerId);
    
    if (connection && connection.ws.readyState === 1) { // OPEN
      const json = JSON.stringify(message);
      connection.ws.send(json);
    }
  }

  /**
   * Send message to all connected clients
   */
  toAllConnections(message: Message): void {
    const connections = this.connectionManager.getAllConnections();
    const json = JSON.stringify(message);

    for (const connection of connections) {
      if (connection.ws.readyState === 1) { // OPEN
        connection.ws.send(json);
      }
    }
  }

  /**
   * Send message to all players in a game except one
   */
  toGameExcept(game: Game, excludePlayerId: string, message: Message): void {
    const playerIds = game.players
      .filter(p => p.id !== excludePlayerId)
      .map(p => p.id);
    
    for (const playerId of playerIds) {
      this.toPlayer(playerId, message);
    }
  }
}
