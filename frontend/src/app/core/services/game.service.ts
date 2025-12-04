import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WebSocketService } from './websocket.service';
import { Game, Room, Phase, DrawingData } from '@monday-painter/models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private currentGameSubject = new BehaviorSubject<Game | null>(null);
  private currentRoomSubject = new BehaviorSubject<Room | null>(null);
  private currentPhaseSubject = new BehaviorSubject<Phase | null>(null);
  private gameListSubject = new BehaviorSubject<Game[]>([]);

  public game$ = this.currentGameSubject.asObservable();
  public currentRoom$ = this.currentRoomSubject.asObservable();
  public currentPhase$ = this.currentPhaseSubject.asObservable();
  public gameList$ = this.gameListSubject.asObservable();

  constructor(private wsService: WebSocketService) {
    this.setupMessageHandlers();
  }

  private setupMessageHandlers(): void {
    // Handle game list updates
    this.wsService.onMessage('gameList').subscribe(message => {
      const games = message.payload.games as Game[];
      this.gameListSubject.next(games);
    });

    // Handle game state updates
    this.wsService.onMessage('gameStateUpdate').subscribe(message => {
      const game = message.payload.game as Game;
      this.currentGameSubject.next(game);
      this.saveGameState(game, message.payload.playerId);
      this.updateCurrentRoom(game);
    });

    // Handle game created
    this.wsService.onMessage('gameCreated').subscribe(message => {
      const game = message.payload.game as Game;
      const playerId = message.payload.playerId;
      this.currentGameSubject.next(game);
      this.saveGameState(game, playerId);
    });

    // Handle game joined
    this.wsService.onMessage('gameJoined').subscribe(message => {
      const game = message.payload.game as Game;
      const playerId = message.payload.playerId;
      this.currentGameSubject.next(game);
      this.saveGameState(game, playerId);
    });

    // Handle player joined (update for other players)
    this.wsService.onMessage('playerJoined').subscribe(message => {
      const game = message.payload.game as Game;
      this.currentGameSubject.next(game);
      const currentPlayerId = this.getCurrentPlayerId();
      if (currentPlayerId) {
        this.saveGameState(game, currentPlayerId);
      }
    });

    // Handle phase advanced
    this.wsService.onMessage('phaseAdvanced').subscribe(message => {
      const game = message.payload.game as Game;
      this.currentGameSubject.next(game);
      const currentPlayerId = this.getCurrentPlayerId();
      if (currentPlayerId) {
        this.saveGameState(game, currentPlayerId);
      }
      this.updateCurrentRoom(game);
    });

    // Handle room state updates
    this.wsService.onMessage('roomStateUpdate').subscribe(message => {
      const room = message.payload.room as Room;
      this.currentRoomSubject.next(room);
      this.currentPhaseSubject.next(room.phase);
    });

    // Handle game started
    this.wsService.onMessage('gameStarted').subscribe(message => {
      const game = message.payload.game as Game;
      this.currentGameSubject.next(game);
      const currentPlayerId = this.getCurrentPlayerId();
      if (currentPlayerId) {
        this.saveGameState(game, currentPlayerId);
      }
      this.updateCurrentRoom(game);
    });

    // Handle game ended
    this.wsService.onMessage('gameEnded').subscribe(message => {
      const game = message.payload.game as Game;
      this.currentGameSubject.next(game);
      this.clearGameState();
    });

    // Handle player left (lobby)
    this.wsService.onMessage('playerLeft').subscribe(message => {
      const game = message.payload.game as Game;
      this.currentGameSubject.next(game);
      const currentPlayerId = this.getCurrentPlayerId();
      if (currentPlayerId) {
        this.saveGameState(game, currentPlayerId);
      }
    });

    // Handle game deleted (host left)
    this.wsService.onMessage('gameDeleted').subscribe(message => {
      console.log('Game deleted:', message.payload.message);
      this.currentGameSubject.next(null);
      this.clearGameState();
      // The lobby component will handle navigation
    });
  }

  private updateCurrentRoom(game: Game): void {
    const currentPlayerId = this.getCurrentPlayerId();
    if (!currentPlayerId || !game.rooms || game.rooms.length === 0) {
      return;
    }

    // Find the player in the game
    const player = game.players.find(p => p.id === currentPlayerId);
    if (!player || !player.currentRoomId) {
      return;
    }

    // Find the player's current room
    const currentRoom = game.rooms.find(r => r.id === player.currentRoomId);
    if (currentRoom) {
      this.currentRoomSubject.next(currentRoom);
      this.currentPhaseSubject.next(currentRoom.phase);
    }
  }

  createGame(displayName: string, maxPlayers: number, gameName?: string): void {
    this.wsService.send({
      type: 'createGame',
      payload: { displayName, maxPlayers, gameName }
    });
  }

  joinGame(gameId: string, displayName: string): void {
    this.wsService.send({
      type: 'joinGame',
      payload: { gameId, displayName }
    });
  }

  startGame(): void {
    this.wsService.send({
      type: 'startGame',
      payload: {}
    });
  }

  leaveGame(): void {
    this.wsService.send({
      type: 'leaveGame',
      payload: {}
    });
    this.currentGameSubject.next(null);
    this.currentRoomSubject.next(null);
    this.currentPhaseSubject.next(null);
  }

  submitPrompt(prompt: string): void {
    this.wsService.send({
      type: 'submitPrompt',
      payload: { prompt }
    });
  }

  submitDrawing(drawingData: DrawingData): void {
    this.wsService.send({
      type: 'submitDrawing',
      payload: { drawingData }
    });
  }

  submitGuess(guess: string): void {
    this.wsService.send({
      type: 'submitGuess',
      payload: { guess }
    });
  }

  getCurrentGame(): Game | null {
    return this.currentGameSubject.value;
  }

  getCurrentRoom(): Room | null {
    return this.currentRoomSubject.value;
  }

  getCurrentPhase(): Phase | null {
    return this.currentPhaseSubject.value;
  }

  requestGameList(): void {
    this.wsService.send({
      type: 'getGameList',
      payload: {}
    });
  }

  getGameList(): Game[] {
    return this.gameListSubject.value;
  }

  private saveGameState(game: Game, playerId: string): void {
    localStorage.setItem('monday-painter-game', JSON.stringify(game));
    localStorage.setItem('monday-painter-player-id', playerId);
  }

  private clearGameState(): void {
    localStorage.removeItem('monday-painter-game');
    localStorage.removeItem('monday-painter-player-id');
  }

  getCurrentPlayerId(): string | null {
    return localStorage.getItem('monday-painter-player-id');
  }

  restoreGameState(): void {
    const savedGame = localStorage.getItem('monday-painter-game');
    if (savedGame) {
      try {
        const game = JSON.parse(savedGame) as Game;
        this.currentGameSubject.next(game);
        this.updateCurrentRoom(game);
      } catch (error) {
        console.error('Failed to restore game state:', error);
        this.clearGameState();
      }
    }
  }
}
