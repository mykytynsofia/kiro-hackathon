import { Game, Player, Room } from '../types';

/**
 * Serialize Game to JSON string
 */
export function serializeGame(game: Game): string {
  try {
    return JSON.stringify(game);
  } catch (error) {
    throw new Error(`Failed to serialize Game: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Serialize Player to JSON string
 */
export function serializePlayer(player: Player): string {
  try {
    return JSON.stringify(player);
  } catch (error) {
    throw new Error(`Failed to serialize Player: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Serialize Room to JSON string
 */
export function serializeRoom(room: Room): string {
  try {
    return JSON.stringify(room);
  } catch (error) {
    throw new Error(`Failed to serialize Room: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
