import { Player, GameConfig, Scoreboard, GuessResult } from '../models/types';

export class GameRoom {
  public readonly id: string;
  public readonly config: GameConfig;
  public players: Map<string, Player>;
  public currentRound: number;
  public activeDrawerId: string | null;
  public currentPrompt: string | null;
  public scores: Map<string, number>;
  public hasStarted: boolean;
  public drawingHistory: any[] = [];
  private drawerHistory: string[];
  private usedPrompts: Set<string>;
  private correctGuessers: Set<string>;

  constructor(id: string, config: GameConfig) {
    this.id = id;
    this.config = config;
    this.players = new Map();
    this.currentRound = 0;
    this.activeDrawerId = null;
    this.currentPrompt = null;
    this.scores = new Map();
    this.hasStarted = false;
    this.drawerHistory = [];
    this.usedPrompts = new Set();
    this.correctGuessers = new Set();
  }

  addPlayer(player: Player): void {
    this.players.set(player.id, player);
    if (!this.scores.has(player.id)) {
      this.scores.set(player.id, 0);
    }
  }

  removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) {
      player.isConnected = false;
      this.players.delete(playerId);
    }
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  isEmpty(): boolean {
    return this.players.size === 0;
  }

  hasMinimumPlayers(): boolean {
    return this.players.size >= this.config.minPlayers;
  }

  selectNextDrawer(): string {
    const playerIds = Array.from(this.players.keys());
    
    // If we've gone through all players, reset the history
    if (this.drawerHistory.length >= playerIds.length) {
      this.drawerHistory = [];
    }

    // Find players who haven't drawn yet in this cycle
    const availablePlayers = playerIds.filter(id => !this.drawerHistory.includes(id));
    
    // Select a random player from available players
    const nextDrawerId = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    
    this.drawerHistory.push(nextDrawerId);
    this.activeDrawerId = nextDrawerId;
    
    return nextDrawerId;
  }

  selectPrompt(): string {
    // Filter out used prompts
    const availablePrompts = this.config.prompts.filter(p => !this.usedPrompts.has(p));
    
    // If all prompts used, reset
    if (availablePrompts.length === 0) {
      this.usedPrompts.clear();
      return this.config.prompts[Math.floor(Math.random() * this.config.prompts.length)];
    }
    
    const prompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
    this.usedPrompts.add(prompt);
    return prompt;
  }

  startRound(): void {
    this.currentRound++;
    this.activeDrawerId = this.selectNextDrawer();
    this.currentPrompt = this.selectPrompt();
    this.correctGuessers.clear();
    this.drawingHistory = []; // Clear drawing history for new round
  }

  endRound(): void {
    // Round end logic handled by caller
    this.activeDrawerId = null;
  }

  processGuess(playerId: string, guess: string): GuessResult {
    if (!this.currentPrompt) {
      return {
        correct: false,
        playerId,
        guess,
        timestamp: Date.now()
      };
    }

    // Case-insensitive comparison with whitespace trimming
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedPrompt = this.currentPrompt.toLowerCase().trim();
    const correct = normalizedGuess === normalizedPrompt;

    if (correct) {
      this.correctGuessers.add(playerId);
    }

    return {
      correct,
      playerId,
      guess,
      timestamp: Date.now()
    };
  }

  hasAllGuessersGuessed(): boolean {
    // Count players who are not the drawer
    const guesserCount = this.players.size - 1;
    return this.correctGuessers.size >= guesserCount && guesserCount > 0;
  }

  getScoreboard(): Scoreboard {
    const scoreboard: Scoreboard = {};
    this.scores.forEach((score, playerId) => {
      scoreboard[playerId] = score;
    });
    return scoreboard;
  }

  updateScore(playerId: string, points: number): void {
    const currentScore = this.scores.get(playerId) || 0;
    this.scores.set(playerId, currentScore + points);
  }

  addDrawingStroke(stroke: any): void {
    this.drawingHistory.push(stroke);
  }

  getDrawingHistory(): any[] {
    return this.drawingHistory;
  }
}
