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
      margin-bottom: 8px;
    }

    p {
      color: #666;
      margin-bottom: 24px;
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .actions button {
      flex: 1;
    }

    .hint {
      text-align: center;
      font-size: 14px;
      color: #f59e0b;
      margin-top: 12px;
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

  startGame(): void {
    this.gameService.startGame();
  }

  leaveGame(): void {
    this.gameService.leaveGame();
    this.router.navigate(['/']);
  }
}
