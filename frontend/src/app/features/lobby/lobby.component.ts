import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { Game, PLAYER_ICONS, DEFAULT_ICON } from '@monday-painter/models';

@Component({
  selector: 'app-lobby',
  template: `
    <div class="container" *ngIf="game">
      <div class="card">
        <h1>{{ game.name || 'Game Lobby' }}</h1>
        <p>Waiting for players... ({{ game.players.length }}/{{ game.maxPlayers }})</p>

        <!-- Icon Selector -->
        <div class="icon-selector">
          <label>Choose your avatar:</label>
          <div class="icon-grid">
            <button 
              *ngFor="let icon of availableIcons"
              class="icon-btn"
              [class.selected]="selectedIcon === icon.emoji"
              (click)="selectIcon(icon.emoji)"
              [title]="icon.label">
              {{ icon.emoji }}
            </button>
          </div>
        </div>

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

      <!-- Mute Button (outside card for fixed positioning) -->
      <button class="mute-btn" (click)="toggleMute()" [title]="audioService.isMutedState() ? 'Unmute' : 'Mute'">
        {{ audioService.isMutedState() ? '🔇' : '🔊' }}
      </button>
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

    .icon-selector {
      margin-bottom: 24px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .icon-selector label {
      display: block;
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      text-align: center;
    }

    .icon-grid {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .icon-btn {
      width: 60px;
      height: 60px;
      font-size: 32px;
      background: rgba(255, 255, 255, 0.1);
      border: 3px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 215, 0, 0.5);
      transform: scale(1.1);
    }

    .icon-btn.selected {
      background: rgba(255, 215, 0, 0.3);
      border-color: #FFD700;
      border-width: 4px;
      transform: scale(1.15);
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }

    .mute-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      font-size: 24px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      z-index: 1000;
    }

    .mute-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }
  `]
})
export class LobbyComponent implements OnInit, OnDestroy {
  game: Game | null = null;
  availableIcons = PLAYER_ICONS;
  selectedIcon: string = DEFAULT_ICON;

  constructor(
    private gameService: GameService,
    public audioService: AudioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Start lobby music
    this.audioService.playLobbyMusic();

    // Restore game state if available
    this.gameService.restoreGameState();

    this.gameService.game$.subscribe(game => {
      this.game = game;
      
      // Set current player's icon
      if (game) {
        const currentPlayerId = this.gameService.getCurrentPlayerId();
        const currentPlayer = game.players.find(p => p.id === currentPlayerId);
        if (currentPlayer?.icon) {
          this.selectedIcon = currentPlayer.icon;
        }
      }
      
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

  ngOnDestroy(): void {
    this.audioService.stopLobbyMusic();
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
    this.gameService.updatePlayerIcon(icon);
  }

  toggleMute(): void {
    const muted = this.audioService.toggleMute();
    if (!muted) {
      // Resume lobby music if unmuted
      this.audioService.playLobbyMusic();
    }
  }

  leaveGame(): void {
    this.audioService.stopLobbyMusic();
    this.gameService.leaveGame();
    this.router.navigate(['/']);
  }
}
