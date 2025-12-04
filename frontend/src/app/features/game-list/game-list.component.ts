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
      margin-bottom: 48px;
      color: white;
    }

    .header h1 {
      font-size: 56px;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #FFD700 0%, #FF8C00 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
      font-weight: 800;
    }

    .header p {
      font-size: 22px;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .card {
      margin-bottom: 24px;
    }

    .card h2 {
      margin-bottom: 20px;
      color: #FFD700;
      font-size: 24px;
      text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
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
      padding: 20px;
      background: rgba(93, 63, 211, 0.1);
      border-radius: 12px;
      border: 2px solid rgba(93, 63, 211, 0.3);
      transition: all 0.3s ease;
    }

    .game-item:hover {
      background: rgba(93, 63, 211, 0.2);
      border-color: rgba(93, 63, 211, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(93, 63, 211, 0.3);
    }

    .game-info {
      flex: 1;
    }

    .game-name {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 6px;
      color: #FFD700;
      text-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }

    .game-details {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }

    .no-games {
      text-align: center;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
      font-size: 16px;
    }

    .status {
      margin-top: 24px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      text-align: center;
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    button.secondary {
      padding: 10px 20px;
      font-weight: 600;
      transition: all 0.3s;
      min-width: 80px;
    }

    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
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
