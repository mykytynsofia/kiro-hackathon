/**
 * Application-wide constants for Monday Painter
 */

// Player constraints
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 10;

// Phase durations (in seconds)
export const INPUT_DURATION = 60;
export const DRAW_DURATION = 90;
export const GUESS_DURATION = 45;

// Text length limits
export const MIN_TEXT_LENGTH = 3;
export const MAX_TEXT_LENGTH = 100;
export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 20;

// Drawing constraints
export const MIN_STROKE_WIDTH = 1;
export const MAX_STROKE_WIDTH = 50;
export const MAX_CANVAS_WIDTH = 1920;
export const MAX_CANVAS_HEIGHT = 1080;

// Rate limiting and message constraints
export const MAX_MESSAGE_SIZE = 1048576; // 1MB in bytes
export const MAX_MESSAGES_PER_SECOND = 100;

// Timeout durations (in milliseconds)
export const HEARTBEAT_INTERVAL = 30000; // 30 seconds
export const HEARTBEAT_TIMEOUT = 60000; // 60 seconds
export const GAME_CLEANUP_TIMEOUT = 300000; // 5 minutes

/**
 * All constants grouped for easy import
 */
export const CONSTANTS = {
  MIN_PLAYERS,
  MAX_PLAYERS,
  INPUT_DURATION,
  DRAW_DURATION,
  GUESS_DURATION,
  MIN_TEXT_LENGTH,
  MAX_TEXT_LENGTH,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MIN_STROKE_WIDTH,
  MAX_STROKE_WIDTH,
  MAX_CANVAS_WIDTH,
  MAX_CANVAS_HEIGHT,
  MAX_MESSAGE_SIZE,
  MAX_MESSAGES_PER_SECOND,
  HEARTBEAT_INTERVAL,
  HEARTBEAT_TIMEOUT,
  GAME_CLEANUP_TIMEOUT
} as const;
