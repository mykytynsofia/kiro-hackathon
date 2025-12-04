import { Game, GameState } from '@monday-painter/models';

/**
 * Handles validation of messages and game state
 */
export class ValidationService {
  /**
   * Validate message structure
   */
  validateMessage(message: unknown): { valid: boolean; error?: string } {
    if (typeof message !== 'object' || message === null) {
      return { valid: false, error: 'Message must be an object' };
    }

    const msg = message as Record<string, unknown>;

    if (typeof msg.type !== 'string') {
      return { valid: false, error: 'Message type must be a string' };
    }

    if (!msg.payload) {
      return { valid: false, error: 'Message must have a payload' };
    }

    return { valid: true };
  }

  /**
   * Validate game state transition
   */
  validateGameState(game: Game, expectedState: GameState): { valid: boolean; error?: string } {
    if (game.state !== expectedState) {
      return { 
        valid: false, 
        error: `Game must be in ${expectedState} state, currently in ${game.state}` 
      };
    }

    return { valid: true };
  }

  /**
   * Validate player permissions
   */
  validatePlayerPermissions(game: Game, playerId: string, requireHost: boolean = false): { valid: boolean; error?: string } {
    const player = game.players.find(p => p.id === playerId);

    if (!player) {
      return { valid: false, error: 'Player not in game' };
    }

    if (requireHost && game.hostId !== playerId) {
      return { valid: false, error: 'Only host can perform this action' };
    }

    return { valid: true };
  }
}
