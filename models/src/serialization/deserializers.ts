import { Game, Player, Room } from '../types';
import { validateGame, validatePlayer, validateRoom } from '../validation/validators';

/**
 * Custom error for validation failures during deserialization
 */
export class ValidationError extends Error {
  constructor(message: string, public errors: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Deserialize JSON string to Game with validation
 */
export function deserializeGame(json: string): Game {
  let parsed: unknown;
  
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new TypeError(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const validationResult = validateGame(parsed);
  
  if (!validationResult.valid) {
    throw new ValidationError(
      'Game validation failed',
      validationResult.errors
    );
  }

  return parsed as Game;
}

/**
 * Deserialize JSON string to Player with validation
 */
export function deserializePlayer(json: string): Player {
  let parsed: unknown;
  
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new TypeError(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const validationResult = validatePlayer(parsed);
  
  if (!validationResult.valid) {
    throw new ValidationError(
      'Player validation failed',
      validationResult.errors
    );
  }

  return parsed as Player;
}

/**
 * Deserialize JSON string to Room with validation
 */
export function deserializeRoom(json: string): Room {
  let parsed: unknown;
  
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new TypeError(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const validationResult = validateRoom(parsed);
  
  if (!validationResult.valid) {
    throw new ValidationError(
      'Room validation failed',
      validationResult.errors
    );
  }

  return parsed as Room;
}
