import { v4 as uuidv4 } from 'uuid';
import { Game, Player, GameState, Phase } from '@monday-painter/models';

/**
 * Manages game lifecycle and state
 */
export class GameManager {
  private games: Map<string, Game> = new Map();

  /**
   * Create a new game
   */
  createGame(hostId: string, options: Partial<Game> = {}): Game {
    const game: Game = {
      id: uuidv4(),
      state: GameState.LOBBY,
      hostId,
      players: [],
      rooms: [],
      maxPlayers: options.maxPlayers || 6,
      createdAt: Date.now(),
      name: options.name
    };

    this.games.set(game.id, game);
    return game;
  }

  /**
   * Get game by ID
   */
  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  /**
   * Get all games
   */
  getAllGames(): Game[] {
    return Array.from(this.games.values());
  }

  /**
   * Get games in lobby state
   */
  getActiveGames(): Game[] {
    return this.getAllGames().filter(game => game.state === GameState.LOBBY);
  }

  /**
   * Add player to game
   */
  addPlayerToGame(gameId: string, player: Player): void {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    if (game.players.length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    if (game.state !== GameState.LOBBY) {
      throw new Error('Game has already started');
    }

    game.players.push(player);
  }

  /**
   * Remove player from game
   */
  removePlayerFromGame(gameId: string, playerId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    game.players = game.players.filter(p => p.id !== playerId);

    // Assign new host if current host left
    if (game.hostId === playerId && game.players.length > 0) {
      game.hostId = game.players[0].id;
    }
  }

  /**
   * Start a game
   */
  startGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    if (game.players.length < 3) {
      throw new Error('Need at least 3 players to start');
    }

    game.state = GameState.STARTED;

    // Create rooms (one per player)
    game.rooms = game.players.map((player, index) => ({
      id: uuidv4(),
      index,
      phase: Phase.INPUT,
      currentPlayerId: player.id,
      chain: [],
      phaseStartedAt: Date.now(),
      phaseDuration: 60
    }));

    // Assign players to initial rooms
    game.players.forEach((player, index) => {
      player.currentRoomId = game.rooms[index].id;
    });
  }

  /**
   * End a game
   */
  endGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (game) {
      game.state = GameState.ENDED;
    }
  }

  /**
   * Delete a game
   */
  deleteGame(gameId: string): void {
    this.games.delete(gameId);
  }
}
