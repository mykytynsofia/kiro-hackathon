/**
 * Game state enumeration
 */
export enum GameState {
  LOBBY = 'lobby',
  STARTED = 'started',
  ENDED = 'ended'
}

/**
 * Room phase enumeration
 */
export enum Phase {
  INPUT = 'input',
  DRAW = 'draw',
  GUESS = 'guess'
}

/**
 * Player connection status enumeration
 */
export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected'
}

/**
 * Chain entry type enumeration
 */
export enum EntryType {
  PROMPT = 'prompt',
  DRAWING = 'drawing',
  GUESS = 'guess'
}

/**
 * Drawing tool type enumeration
 */
export enum ToolType {
  BRUSH = 'brush',
  ERASER = 'eraser'
}
