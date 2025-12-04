import { v4 as uuidv4 } from 'uuid';
import { Player, Game, ConnectionStatus } from '@monday-painter/models';

/**
 * Manages player state and assignments
 */
export class PlayerManager {
  /**
   * Create a new player
   */
  createPlayer(displayName: string): Player {
    return {
      id: uuidv4(),
      displayName,
      connectionStatus: ConnectionStatus.CONNECTED,
      joinedAt: Date.now(),
      currentRoomId: null
    };
  }

  /**
   * Get player from game
   */
  getPlayer(game: Game, playerId: string): Player | undefined {
    return game.players.find(p => p.id === playerId);
  }

  /**
   * Update player's current room
   */
  updatePlayerRoom(game: Game, playerId: string, roomId: string): void {
    const player = this.getPlayer(game, playerId);
    if (player) {
      player.currentRoomId = roomId;
    }
  }

  /**
   * Mark player as disconnected
   */
  markPlayerDisconnected(game: Game, playerId: string): void {
    const player = this.getPlayer(game, playerId);
    if (player) {
      player.connectionStatus = ConnectionStatus.DISCONNECTED;
    }
  }

  /**
   * Get all connected players in a game
   */
  getConnectedPlayers(game: Game): Player[] {
    return game.players.filter(p => p.connectionStatus === ConnectionStatus.CONNECTED);
  }
}
