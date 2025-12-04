import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameService } from '../../core/services/game.service';
import { WebSocketService, ConnectionState } from '../../core/services/websocket.service';
import { PlayerService } from '../../core/services/player.service';
import { Game, GameState } from '@monday-painter/models';

@Component({
  selector: 'app-game-list',
  template: `
    <div class="container">
      <div class="header">
        <h1>🎨 Monday Painter</h1>
        <p>Draw, Guess, Laugh!</p>
      </div>

      <!-- Available Games -->
      <div class="card" *ngIf="availableGames.length > 0">
        <h2>Available Games</h2>
        <div class="game-list">
          <div class="game-item" *ngFor="let game of availableGames">
            <div class="game-info">
              <div class="game-name">{{ game.name || 'Unnamed Game' }}</div>
              <div class="game-details">
                {{ game.players.length }} / {{ game.maxPlayers }} players
              </div>
            </div>
            <button 
              class="secondary" 
              (click)="joinGame(game.id)"
              [disabled]="game.players.length >= game.maxPlayers">
              {{ game.players.length >= game.maxPlayers ? 'Full' : 'Join' }}
            </button>
          </div>
        </div>
      </div>

      <!-- No Games Message -->
      <div class="card" *ngIf="availableGames.length === 0 && connectionStatus === ConnectionState.CONNECTED">
        <p class="no-games">No games available. Create one below!</p>
      </div>

      <!-- Create New Game -->
      <div class="card">
        <h2>Create New Game</h2>
        <div class="form">
          <input 
            type="text" 
            [(ngModel)]="displayName" 
            placeholder="Your name"
            maxlength="20">
          <input 
            type="text" 
            [(ngModel)]="gameName" 
            placeholder="Game name (optional)"
            maxlength="30">
          <input 
            type="number" 
            [(ngModel)]="maxPlayers" 
            min="3" 
            max="10"
            placeholder="Max players (3-10)">
          <button class="primary" (click)="createGame()">Create Game</button>
        </div>
      </div>

      <div class="status" *ngIf="connectionStatus">
        Status: {{ connectionStatus }}
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      color: white;
    }

    .header h1 {
      font-size: 48px;
      margin-bottom: 8px;
    }

    .header p {
      font-size: 20px;
      opacity: 0.9;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .game-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .game-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .game-info {
      flex: 1;
    }

    .game-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
      color: white;
    }

    .game-details {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }

    .no-games {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }

    .status {
      margin-top: 20px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      text-align: center;
    }

    button.secondary {
      background: #667eea;
      color: white;
      border: 2px solid #5568d3;
      padding: 10px 20px;
      font-weight: 600;
      transition: all 0.2s;
    }

    button.secondary:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-1px);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #9ca3af;
      border-color: #6b7280;
    }
  `]
})
export class GameListComponent implements OnInit, OnDestroy {
  displayName = '';
  gameName = '';
  maxPlayers = 6;
  connectionStatus: ConnectionState = ConnectionState.DISCONNECTED;
  availableGames: Game[] = [];
  private subscriptions: Subscription[] = [];
  
  // Expose enum to template
  ConnectionState = ConnectionState;

  constructor(
    private gameService: GameService,
    private wsService: WebSocketService,
    private playerService: PlayerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load saved display name
    const savedName = this.playerService.getDisplayName();
    if (savedName) {
      this.displayName = savedName;
    }

    // Connect to WebSocket
    this.wsService.connect();

    // Monitor connection status
    const statusSub = this.wsService.connectionStatus$.subscribe(status => {
      this.connectionStatus = status;
      if (status === ConnectionState.CONNECTED) {
        // Request game list when connected
        this.gameService.requestGameList();
      }
    });
    this.subscriptions.push(statusSub);

    // Subscribe to game list updates
    const gameListSub = this.gameService.gameList$.subscribe(games => {
      // Filter to only show lobby games
      this.availableGames = games.filter(g => g.state === GameState.LOBBY);
    });
    this.subscriptions.push(gameListSub);

    // Listen for game created
    const createdSub = this.wsService.onMessage('gameCreated').subscribe(message => {
      console.log('Game created:', message.payload);
      this.router.navigate(['/lobby']);
    });
    this.subscriptions.push(createdSub);

    // Listen for game joined
    const joinedSub = this.wsService.onMessage('gameJoined').subscribe(message => {
      console.log('Game joined:', message.payload);
      this.router.navigate(['/lobby']);
    });
    this.subscriptions.push(joinedSub);

    // Refresh game list every 5 seconds
    const refreshInterval = setInterval(() => {
      if (this.connectionStatus === ConnectionState.CONNECTED) {
        this.gameService.requestGameList();
      }
    }, 5000);

    // Store interval for cleanup
    this.subscriptions.push(new Subscription(() => clearInterval(refreshInterval)));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createGame(): void {
    if (!this.displayName.trim()) {
      alert('Please enter your name');
      return;
    }

    // Save display name
    this.playerService.setDisplayName(this.displayName);

    // Create game
    this.gameService.createGame(
      this.displayName,
      this.maxPlayers,
      this.gameName || undefined
    );
  }

  joinGame(gameId: string): void {
    if (!this.displayName.trim()) {
      alert('Please enter your name');
      return;
    }

    // Save display name
    this.playerService.setDisplayName(this.displayName);

    // Join game
    this.gameService.joinGame(gameId, this.displayName);
  }
}
