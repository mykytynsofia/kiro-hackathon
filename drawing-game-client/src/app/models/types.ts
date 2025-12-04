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

export interface Scoreboard {
  [playerId: string]: number;
}

export interface PlayerRanking {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
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
  prompt?: string;
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
