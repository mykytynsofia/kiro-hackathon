/**
 * Monday Painter Models
 * Shared data models for the Monday Painter game
 */

// Export all types
export * from './types';

// Export constants
export * from './constants';

// Export validation types and functions
export type { ValidationResult, ValidationError } from './validation/types';
export { validResult, invalidResult, createError } from './validation/types';
export {
  validateGame,
  validatePlayer,
  validateRoom,
  validateChainEntry,
  validateDrawingData,
  validateStroke,
  validatePoint
} from './validation/validators';

// Export serialization functions
export {
  serializeGame,
  serializePlayer,
  serializeRoom
} from './serialization/serializers';

export {
  deserializeGame,
  deserializePlayer,
  deserializeRoom,
  ValidationError as DeserializationValidationError
} from './serialization/deserializers';
