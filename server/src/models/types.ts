// Core data models

export interface Player {
  id: string;
  name: string;
  connectionId: string;
  score: number;
  isConnected: boolean;
  avatar: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingStroke {
  type: 'line' | 'clear';
  points: Point[];
  color: string;
  brushSize: number;
  timestamp: number;
}

export interface GameConfig {
  minPlayers: number;
  maxPlayers: number;
  roundDuration: number; // seconds
  intermissionDuration: number; // seconds
  totalRounds: number;
  prompts: string[];
}

export interface RoomInfo {
  roomId: string;
  playerCount: number;
  hasStarted: boolean;
}

export interface Scoreboard {
  [playerId: string]: number;
}

export interface PlayerRanking {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
}

export interface GuessResult {
  correct: boolean;
  playerId: string;
  guess: string;
  timestamp: number;
}

export interface Guess {
  playerId: string;
  playerName: string;
  guess: string;
  correct: boolean;
  timestamp: number;
}

// WebSocket message types

export interface BaseMessage {
  type: string;
  timestamp: number;
}

export interface PlayerJoinedMessage extends BaseMessage {
  type: 'player_joined';
  player: Player;
  players: Player[];
}

export interface PlayerLeftMessage extends BaseMessage {
  type: 'player_left';
  playerId: string;
  players: Player[];
}

export interface RoundStartMessage extends BaseMessage {
  type: 'round_start';
  roundNumber: number;
  isDrawer: boolean;
  prompt?: string; // Only sent to drawer
  drawerId: string;
}

export interface DrawingEventMessage extends BaseMessage {
  type: 'drawing_event';
  stroke: DrawingStroke;
}

export interface ToolChangeMessage extends BaseMessage {
  type: 'tool_change';
  color: string;
  brushSize: number;
}

export interface ClearCanvasMessage extends BaseMessage {
  type: 'clear_canvas';
}

export interface GuessMessage extends BaseMessage {
  type: 'guess';
  playerId: string;
  playerName: string;
  guess: string;
}

export interface GuessResultMessage extends BaseMessage {
  type: 'guess_result';
  playerId: string;
  playerName: string;
  correct: boolean;
  pointsAwarded: number;
}

export interface ScoreUpdateMessage extends BaseMessage {
  type: 'score_update';
  scores: Scoreboard;
}

export interface RoundEndMessage extends BaseMessage {
  type: 'round_end';
  prompt: string;
  scores: Scoreboard;
}

export interface GameEndMessage extends BaseMessage {
  type: 'game_end';
  finalRankings: PlayerRanking[];
}

export interface ErrorMessage extends BaseMessage {
  type: 'error';
  message: string;
}

export type GameMessage =
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | RoundStartMessage
  | DrawingEventMessage
  | ToolChangeMessage
  | ClearCanvasMessage
  | GuessMessage
  | GuessResultMessage
  | ScoreUpdateMessage
  | RoundEndMessage
  | GameEndMessage
  | ErrorMessage;

// Client-to-server message types

export interface JoinMessage {
  type: 'join';
  roomId: string;
  playerName: string;
}

export interface DrawMessage {
  type: 'draw';
  stroke: DrawingStroke;
}

export interface ClientToolChangeMessage {
  type: 'tool_change';
  color: string;
  brushSize: number;
}

export interface ClientClearCanvasMessage {
  type: 'clear_canvas';
}

export interface ClientGuessMessage {
  type: 'guess';
  guess: string;
}

export type ClientMessage =
  | JoinMessage
  | DrawMessage
  | ClientToolChangeMessage
  | ClientClearCanvasMessage
  | ClientGuessMessage;

// Type guards

export function isJoinMessage(msg: any): msg is JoinMessage {
  return msg && msg.type === 'join' && typeof msg.roomId === 'string' && typeof msg.playerName === 'string';
}

export function isDrawMessage(msg: any): msg is DrawMessage {
  return msg && msg.type === 'draw' && msg.stroke && typeof msg.stroke === 'object';
}

export function isToolChangeMessage(msg: any): msg is ClientToolChangeMessage {
  return msg && msg.type === 'tool_change' && typeof msg.color === 'string' && typeof msg.brushSize === 'number';
}

export function isClearCanvasMessage(msg: any): msg is ClientClearCanvasMessage {
  return msg && msg.type === 'clear_canvas';
}

export function isGuessMessage(msg: any): msg is ClientGuessMessage {
  return msg && msg.type === 'guess' && typeof msg.guess === 'string';
}
