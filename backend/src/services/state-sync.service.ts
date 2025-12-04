import { BroadcastService } from './broadcast.service';
import { GameManager } from '../managers/game-manager';
import { Game, Player, Room } from '@monday-painter/models';

/**
 * Handles state synchronization across clients
 */
export class StateSyncService {
  constructor(
    private broadcast: BroadcastService,
    private gameManager: GameManager
  ) {}

  /**
   * Sync game state to player(s)
   */
  syncGameState(game: Game, playerId?: string): void {
    const message = {
      type: 'gameStateUpdate',
      payload: { game }
    };

    if (playerId) {
      this.broadcast.toPlayer(playerId, message);
    } else {
      this.broadcast.toGame(game, message);
    }
  }

  /**
   * Sync room state to game
   */
  syncRoomState(game: Game, room: Room): void {
    const message = {
      type: 'roomStateUpdate',
      payload: { room }
    };

    this.broadcast.toGame(game, message);
  }

  /**
   * Sync player state to game
   */
  syncPlayerState(game: Game, player: Player): void {
    const message = {
      type: 'playerStateUpdate',
      payload: { player }
    };

    this.broadcast.toGame(game, message);
  }

  /**
   * Send game list to all connections
   */
  sendGameList(): void {
    const games = this.gameManager.getActiveGames();
    const message = {
      type: 'gameListUpdate',
      payload: { games }
    };

    this.broadcast.toAllConnections(message);
  }
}
