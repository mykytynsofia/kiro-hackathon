import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { Game } from '@monday-painter/models';

@Component({
  selector: 'app-lobby',
  template: `
    <div class="container" *ngIf="game">
      <div class="card">
        <h1>{{ game.name || 'Game Lobby' }}</h1>
        <p>Waiting for players... ({{ game.players.length }}/{{ game.maxPlayers }})</p>

        <app-player-list [players]="game.players"></app-player-list>

        <div class="actions">
          <button 
            *ngIf="isHost()"
            class="primary" 
            (click)="startGame()"
            [disabled]="game.players.length < 3">
            Start Game
          </button>
          <button class="secondary" (click)="leaveGame()">Leave</button>
        </div>

        <p class="hint" *ngIf="game.players.length < 3">
          Need at least 3 players to start
        </p>
        <p class="hint" *ngIf="!isHost() && game.players.length >= 3">
          Waiting for host to start the game...
        </p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    h1 {
      margin-bottom: 12px;
      color: #FFD700;
      font-size: 32px;
      text-align: center;
      text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 24px;
      text-align: center;
      font-size: 16px;
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: 32px;
    }

    .actions button {
      flex: 1;
    }

    .hint {
      text-align: center;
      font-size: 15px;
      color: #FFA500;
      margin-top: 16px;
      padding: 12px 16px;
      background: rgba(255, 140, 0, 0.15);
      border-radius: 12px;
      border: 2px solid rgba(255, 140, 0, 0.3);
      backdrop-filter: blur(10px);
      font-weight: 500;
    }
  `]
})
export class LobbyComponent implements OnInit {
  game: Game | null = null;

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Restore game state if available
    this.gameService.restoreGameState();

    this.gameService.game$.subscribe(game => {
      this.game = game;
      
      // Navigate to game when started
      if (game?.state === 'started') {
        this.router.navigate(['/game']);
      }
      
      // Navigate to home if game is null (deleted or left)
      if (game === null) {
        this.router.navigate(['/']);
      }
    });

    // If no game state, redirect to home
    if (!this.game) {
      setTimeout(() => {
        if (!this.game) {
          this.router.navigate(['/']);
        }
      }, 1000);
    }
  }

  isHost(): boolean {
    if (!this.game) return false;
    const currentPlayerId = this.gameService.getCurrentPlayerId();
    return this.game.hostId === currentPlayerId;
  }

  startGame(): void {
    this.gameService.startGame();
  }

  leaveGame(): void {
    this.gameService.leaveGame();
    this.router.navigate(['/']);
  }
}
