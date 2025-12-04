import {
  GameState,
  Phase,
  ConnectionStatus,
  EntryType,
  ToolType
} from '../types';
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  MIN_TEXT_LENGTH,
  MAX_TEXT_LENGTH,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MIN_STROKE_WIDTH,
  MAX_STROKE_WIDTH
} from '../constants';
import {
  isStringLengthValid,
  isNumberInRange,
  isValidEnumValue,
  isValidHexColor,
  isNonEmptyString,
  isPositiveNumber,
  isArray,
  hasMinLength,
  isObject,
  isValidTimestamp
} from './field-validators';
import { ValidationResult, createError, validResult, invalidResult } from './types';

/**
 * Validate Point
 */
export function validatePoint(point: unknown): ValidationResult {
  const errors = [];

  if (!isObject(point)) {
    return invalidResult([createError('point', 'Point must be an object', point)]);
  }

  const p = point as Record<string, unknown>;

  if (typeof p.x !== 'number' || isNaN(p.x)) {
    errors.push(createError('x', 'x must be a valid number', p.x));
  }

  if (typeof p.y !== 'number' || isNaN(p.y)) {
    errors.push(createError('y', 'y must be a valid number', p.y));
  }

  return errors.length > 0 ? invalidResult(errors) : validResult();
}

/**
 * Validate Stroke
 */
export function validateStroke(stroke: unknown): ValidationResult {
  const errors = [];

  if (!isObject(stroke)) {
    return invalidResult([createError('stroke', 'Stroke must be an object', stroke)]);
  }

  const s = stroke as Record<string, unknown>;

  // Validate points array
  if (!isArray(s.points)) {
    errors.push(createError('points', 'points must be an array', s.points));
  } else if (!hasMinLength(s.points, 2)) {
    errors.push(createError('points', 'points array must contain at least 2 points', s.points));
  } else {
    // Validate each point
    (s.points as unknown[]).forEach((point, index) => {
      const pointResult = validatePoint(point);
      if (!pointResult.valid) {
        errors.push(createError(`points[${index}]`, 'Invalid point', point));
      }
    });
  }

  // Validate color
  if (!isValidHexColor(s.color)) {
    errors.push(createError('color', 'color must be a valid hex color (#RGB or #RRGGBB)', s.color));
  }

  // Validate width
  if (!isNumberInRange(s.width, MIN_STROKE_WIDTH, MAX_STROKE_WIDTH)) {
    errors.push(createError('width', `width must be between ${MIN_STROKE_WIDTH} and ${MAX_STROKE_WIDTH}`, s.width));
  }

  // Validate tool
  if (!isValidEnumValue(s.tool, ToolType)) {
    errors.push(createError('tool', 'tool must be a valid ToolType', s.tool));
  }

  return errors.length > 0 ? invalidResult(errors) : validResult();
}

/**
 * Validate DrawingData
 */
export function validateDrawingData(data: unknown): ValidationResult {
  const errors = [];

  if (!isObject(data)) {
    return invalidResult([createError('drawingData', 'DrawingData must be an object', data)]);
  }

  const d = data as Record<string, unknown>;

  // Validate strokes array
  if (!isArray(d.strokes)) {
    errors.push(createError('strokes', 'strokes must be an array', d.strokes));
  } else {
    // Validate each stroke
    (d.strokes as unknown[]).forEach((stroke, index) => {
      const strokeResult = validateStroke(stroke);
      if (!strokeResult.valid) {
        errors.push(createError(`strokes[${index}]`, 'Invalid stroke', stroke));
      }
    });
  }

  // Validate width
  if (!isPositiveNumber(d.width)) {
    errors.push(createError('width', 'width must be a positive number', d.width));
  }

  // Validate height
  if (!isPositiveNumber(d.height)) {
    errors.push(createError('height', 'height must be a positive number', d.height));
  }

  return errors.length > 0 ? invalidResult(errors) : validResult();
}

/**
 * Validate ChainEntry
 */
export function validateChainEntry(entry: unknown): ValidationResult {
  const errors = [];

  if (!isObject(entry)) {
    return invalidResult([createError('chainEntry', 'ChainEntry must be an object', entry)]);
  }

  const e = entry as Record<string, unknown>;

  // Validate type
  if (!isValidEnumValue(e.type, EntryType)) {
    errors.push(createError('type', 'type must be a valid EntryType', e.type));
  }

  // Validate playerId
  if (!isNonEmptyString(e.playerId)) {
    errors.push(createError('playerId', 'playerId must be a non-empty string', e.playerId));
  }

  // Validate timestamp
  if (!isValidTimestamp(e.timestamp)) {
    errors.push(createError('timestamp', 'timestamp must be a valid Unix timestamp', e.timestamp));
  }

  // Conditional validation based on type
  if (e.type === EntryType.PROMPT || e.type === EntryType.GUESS) {
    if (!isStringLengthValid(e.content, MIN_TEXT_LENGTH, MAX_TEXT_LENGTH)) {
      errors.push(createError('content', `content must be between ${MIN_TEXT_LENGTH} and ${MAX_TEXT_LENGTH} characters for ${e.type}`, e.content));
    }
  }

  if (e.type === EntryType.DRAWING) {
    if (!e.drawingData) {
      errors.push(createError('drawingData', 'drawingData is required for drawing type', e.drawingData));
    } else {
      const drawingResult = validateDrawingData(e.drawingData);
      if (!drawingResult.valid) {
        errors.push(...drawingResult.errors);
      }
    }
  }

  return errors.length > 0 ? invalidResult(errors) : validResult();
}

/**
 * Validate Player
 */
export function validatePlayer(player: unknown): ValidationResult {
  const errors = [];

  if (!isObject(player)) {
    return invalidResult([createError('player', 'Player must be an object', player)]);
  }

  const p = player as Record<string, unknown>;

  // Validate id
  if (!isNonEmptyString(p.id)) {
    errors.push(createError('id', 'id must be a non-empty string', p.id));
  }

  // Validate displayName
  if (!isStringLengthValid(p.displayName, MIN_NAME_LENGTH, MAX_NAME_LENGTH)) {
    errors.push(createError('displayName', `displayName must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters`, p.displayName));
  }

  // Validate connectionStatus
  if (!isValidEnumValue(p.connectionStatus, ConnectionStatus)) {
    errors.push(createError('connectionStatus', 'connectionStatus must be a valid ConnectionStatus', p.connectionStatus));
  }

  // Validate joinedAt
  if (!isValidTimestamp(p.joinedAt)) {
    errors.push(createError('joinedAt', 'joinedAt must be a valid Unix timestamp', p.joinedAt));
  }

  // Validate currentRoomId (can be null or string)
  if (p.currentRoomId !== null && typeof p.currentRoomId !== 'string') {
    errors.push(createError('currentRoomId', 'currentRoomId must be a string or null', p.currentRoomId));
  }

  return errors.length > 0 ? invalidResult(errors) : validResult();
}

/**
 * Validate Room
 */
export function validateRoom(room: unknown): ValidationResult {
  const errors = [];

  if (!isObject(room)) {
    return invalidResult([createError('room', 'Room must be an object', room)]);
  }

  const r = room as Record<string, unknown>;

  // Validate id
  if (!isNonEmptyString(r.id)) {
    errors.push(createError('id', 'id must be a non-empty string', r.id));
  }

  // Validate index
  if (typeof r.index !== 'number' || r.index < 0) {
    errors.push(createError('index', 'index must be a non-negative number', r.index));
  }

  // Validate phase
  if (!isValidEnumValue(r.phase, Phase)) {
    errors.push(createError('phase', 'phase must be a valid Phase', r.phase));
  }

  // Validate currentPlayerId (can be null or string)
  if (r.currentPlayerId !== null && typeof r.currentPlayerId !== 'string') {
    errors.push(createError('currentPlayerId', 'currentPlayerId must be a string or null', r.currentPlayerId));
  }

  // Validate chain array
  if (!isArray(r.chain)) {
    errors.push(createError('chain', 'chain must be an array', r.chain));
  } else {
    // Validate each chain entry
    (r.chain as unknown[]).forEach((entry, index) => {
      const entryResult = validateChainEntry(entry);
      if (!entryResult.valid) {
        errors.push(createError(`chain[${index}]`, 'Invalid chain entry', entry));
      }
    });
  }

  // Validate phaseStartedAt
  if (!isValidTimestamp(r.phaseStartedAt)) {
    errors.push(createError('phaseStartedAt', 'phaseStartedAt must be a valid Unix timestamp', r.phaseStartedAt));
  }

  // Validate phaseDuration
  if (!isPositiveNumber(r.phaseDuration)) {
    errors.push(createError('phaseDuration', 'phaseDuration must be a positive number', r.phaseDuration));
  }

  return errors.length > 0 ? invalidResult(errors) : validResult();
}

/**
 * Validate Game
 */
export function validateGame(game: unknown): ValidationResult {
  const errors = [];

  if (!isObject(game)) {
    return invalidResult([createError('game', 'Game must be an object', game)]);
  }

  const g = game as Record<string, unknown>;

  // Validate id
  if (!isNonEmptyString(g.id)) {
    errors.push(createError('id', 'id must be a non-empty string', g.id));
  }

  // Validate state
  if (!isValidEnumValue(g.state, GameState)) {
    errors.push(createError('state', 'state must be a valid GameState', g.state));
  }

  // Validate hostId
  if (!isNonEmptyString(g.hostId)) {
    errors.push(createError('hostId', 'hostId must be a non-empty string', g.hostId));
  }

  // Validate players array
  if (!isArray(g.players)) {
    errors.push(createError('players', 'players must be an array', g.players));
  } else {
    // Validate each player
    (g.players as unknown[]).forEach((player, index) => {
      const playerResult = validatePlayer(player);
      if (!playerResult.valid) {
        errors.push(createError(`players[${index}]`, 'Invalid player', player));
      }
    });
  }

  // Validate rooms array
  if (!isArray(g.rooms)) {
    errors.push(createError('rooms', 'rooms must be an array', g.rooms));
  } else {
    // Validate each room
    (g.rooms as unknown[]).forEach((room, index) => {
      const roomResult = validateRoom(room);
      if (!roomResult.valid) {
        errors.push(createError(`rooms[${index}]`, 'Invalid room', room));
      }
    });
  }

  // Validate maxPlayers
  if (!isNumberInRange(g.maxPlayers, MIN_PLAYERS, MAX_PLAYERS)) {
    errors.push(createError('maxPlayers', `maxPlayers must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}`, g.maxPlayers));
  }

  // Validate createdAt
  if (!isValidTimestamp(g.createdAt)) {
    errors.push(createError('createdAt', 'createdAt must be a valid Unix timestamp', g.createdAt));
  }

  // Validate name (optional)
  if (g.name !== undefined && typeof g.name !== 'string') {
    errors.push(createError('name', 'name must be a string if provided', g.name));
  }

  return errors.length > 0 ? invalidResult(errors) : validResult();
}
