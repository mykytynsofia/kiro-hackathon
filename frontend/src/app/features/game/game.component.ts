import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { Phase, GameState } from '@monday-painter/models';

@Component({
  selector: 'app-game',
  template: `
    <div class="game-container" *ngIf="game">
      <!-- Header -->
      <div class="game-header">
        <h1>{{ game.name || 'Monday Painter' }}</h1>
        <div class="game-info">
          <span class="phase-badge">{{ getPhaseLabel(currentPhase) }}</span>
          <button class="leave-btn" (click)="leaveGame()">Leave Game</button>
        </div>
      </div>

      <!-- Phase Content -->
      <div class="phase-container">
        <!-- Input Phase -->
        <app-input-phase *ngIf="currentPhase === Phase.INPUT"></app-input-phase>

        <!-- Draw Phase -->
        <app-draw-phase *ngIf="currentPhase === Phase.DRAW"></app-draw-phase>

        <!-- Guess Phase -->
        <app-guess-phase *ngIf="currentPhase === Phase.GUESS"></app-guess-phase>

        <!-- Transition/Waiting -->
        <app-transition 
          *ngIf="!currentPhase"
          [message]="'Waiting for game to start...'"
          [subMessage]="'The host will start the game soon'">
        </app-transition>
      </div>

      <!-- Mute Button -->
      <button class="mute-btn" (click)="toggleMute()" [title]="audioService.isMutedState() ? 'Unmute' : 'Mute'">
        {{ audioService.isMutedState() ? '🔇' : '🔊' }}
      </button>
    </div>
  `,
  styles: [`
    .game-container {
      min-height: 100vh;
      padding: 20px;
    }

    .game-header {
      max-width: 1200px;
      margin: 0 auto 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    h1 {
      color: white;
      margin: 0;
      font-size: 32px;
    }

    .game-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .phase-badge {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .leave-btn {
      background: rgba(239, 68, 68, 0.9);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .leave-btn:hover {
      background: rgba(220, 38, 38, 1);
    }

    .phase-container {
      max-width: 1200px;
      margin: 0 auto;
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
export class GameComponent implements OnInit, OnDestroy {
  currentPhase: Phase | null = null;
  game: any = null;
  Phase = Phase; // Expose enum to template
  private subscriptions: Subscription[] = [];

  constructor(
    private gameService: GameService,
    public audioService: AudioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Restore game state
    this.gameService.restoreGameState();

    // Subscribe to game state
    const gameSub = this.gameService.game$.subscribe(game => {
      this.game = game;
      
      // Navigate to results if game ended
      if (game?.state === GameState.ENDED) {
        this.router.navigate(['/results']);
      }
    });
    this.subscriptions.push(gameSub);

    // Subscribe to current phase
    const phaseSub = this.gameService.currentPhase$.subscribe(phase => {
      this.currentPhase = phase;
    });
    this.subscriptions.push(phaseSub);

    // Redirect to home if no game
    setTimeout(() => {
      if (!this.game) {
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getPhaseLabel(phase: Phase | null): string {
    if (!phase) return 'Waiting';
    
    switch (phase) {
      case Phase.INPUT:
        return 'Write Prompt';
      case Phase.DRAW:
        return 'Draw';
      case Phase.GUESS:
        return 'Guess';
      default:
        return 'Playing';
    }
  }

  toggleMute(): void {
    this.audioService.toggleMute();
  }

  leaveGame(): void {
    if (confirm('Are you sure you want to leave the game?')) {
      this.gameService.leaveGame();
      this.router.navigate(['/']);
    }
  }
}
