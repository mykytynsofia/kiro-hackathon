import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { Game, Room, DEFAULT_ICON } from '@monday-painter/models';

@Component({
  selector: 'app-results',
  template: `
    <div class="results-container" *ngIf="game">
      <div class="header">
        <h1>🎨 Game Results!</h1>
        <p>See how the prompts evolved through drawings and guesses</p>
      </div>

      <div class="navigation">
        <button 
          class="nav-btn" 
          (click)="previousChain()"
          [disabled]="currentChainIndex === 0">
          ← Previous Chain
        </button>
        <span class="chain-counter">
          Chain {{ currentChainIndex + 1 }} of {{ game.rooms.length }}
        </span>
        <button 
          class="nav-btn" 
          (click)="nextChain()"
          [disabled]="currentChainIndex === game.rooms.length - 1">
          Next Chain →
        </button>
      </div>

      <div class="chain-display" *ngIf="currentRoom">
        <h2>Room {{ currentChainIndex + 1 }} Chain</h2>
        
        <div class="chain-entries">
          <div 
            *ngFor="let entry of currentRoom.chain; let i = index"
            class="entry-card"
            [class.prompt-entry]="entry.type === 'prompt'"
            [class.drawing-entry]="entry.type === 'drawing'"
            [class.guess-entry]="entry.type === 'guess'">
            
            <div class="entry-header">
              <span class="entry-type">
                {{ getEntryTypeLabel(entry.type) }}
              </span>
              <span class="entry-player">
                <span class="player-icon">{{ getPlayerIcon(entry.playerId) }}</span>
                by {{ getPlayerName(entry.playerId) }}
              </span>
            </div>

            <div class="entry-content">
              <!-- Text Content (Prompt or Guess) -->
              <div *ngIf="entry.type === 'prompt' || entry.type === 'guess'" class="text-content">
                "{{ entry.content }}"
              </div>

              <!-- Drawing Content -->
              <div *ngIf="entry.type === 'drawing'" class="drawing-content">
                <app-canvas
                  [width]="400"
                  [height]="300"
                  [readonly]="true"
                  [drawingData]="getDrawingData(entry.content)">
                </app-canvas>
              </div>
            </div>

            <!-- Arrow to next entry -->
            <div *ngIf="i < currentRoom.chain.length - 1" class="arrow">↓</div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="primary" (click)="playAgain()">
          🎮 Play Again
        </button>
        <button class="secondary" (click)="backToHome()">
          🏠 Back to Home
        </button>
      </div>

      <!-- Mute Button -->
      <button class="mute-btn" (click)="toggleMute()" [title]="audioService.isMutedState() ? 'Unmute' : 'Mute'">
        {{ audioService.isMutedState() ? '🔇' : '🔊' }}
      </button>
    </div>
  `,
  styles: [`
    .results-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
      min-height: 100vh;
    }

    .header {
      text-align: center;
      margin-bottom: 48px;
      color: white;
    }

    .header h1 {
      font-size: 52px;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #FFD700 0%, #FF8C00 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
      font-weight: 800;
    }

    .header p {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 20px;
      background: rgba(93, 63, 211, 0.15);
      border-radius: 16px;
      border: 2px solid rgba(93, 63, 211, 0.3);
      backdrop-filter: blur(10px);
    }

    .nav-btn {
      padding: 12px 24px;
      background: linear-gradient(135deg, var(--halloween-purple) 0%, var(--halloween-violet) 100%);
      color: white;
      border: 2px solid var(--halloween-violet);
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .nav-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--halloween-violet) 0%, var(--halloween-purple) 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(123, 44, 191, 0.5);
    }

    .nav-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .chain-counter {
      color: #FFD700;
      font-size: 20px;
      font-weight: 700;
      text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
    }

    .chain-display {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .chain-display h2 {
      text-align: center;
      color: #FFD700;
      margin-bottom: 32px;
      font-size: 28px;
      text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
    }

    .chain-entries {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .entry-card {
      padding: 24px;
      border-radius: 12px;
      position: relative;
    }

    .prompt-entry {
      background: rgba(255, 215, 0, 0.15);
      border: 2px solid rgba(255, 215, 0, 0.5);
    }

    .drawing-entry {
      background: rgba(93, 63, 211, 0.15);
      border: 2px solid rgba(93, 63, 211, 0.5);
    }

    .guess-entry {
      background: rgba(255, 140, 0, 0.15);
      border: 2px solid rgba(255, 140, 0, 0.5);
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .entry-type {
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #FFD700;
      text-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }

    .entry-player {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      font-style: italic;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .player-icon {
      font-size: 18px;
    }

    .entry-content {
      margin-top: 12px;
    }

    .text-content {
      font-size: 24px;
      font-weight: 600;
      color: white;
      text-align: center;
      padding: 16px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .drawing-content {
      display: flex;
      justify-content: center;
      background: rgba(0, 0, 0, 0.3);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .arrow {
      text-align: center;
      font-size: 32px;
      color: rgba(255, 215, 0, 0.5);
      margin: 16px 0;
      text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    .actions button {
      padding: 16px 32px;
      font-size: 18px;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .actions .primary {
      background: linear-gradient(135deg, var(--halloween-purple) 0%, var(--halloween-violet) 100%);
      color: white;
      border: 2px solid var(--halloween-violet);
    }

    .actions .primary:hover {
      background: linear-gradient(135deg, var(--halloween-violet) 0%, var(--halloween-purple) 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(123, 44, 191, 0.5);
    }

    .actions .secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
    }

    .actions .secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
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
export class ResultsComponent implements OnInit {
  game: Game | null = null;
  currentChainIndex = 0;
  currentRoom: Room | null = null;

  constructor(
    private gameService: GameService,
    public audioService: AudioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Play game end sound
    this.audioService.playGameEndSound();

    // Get game from service
    this.game = this.gameService.getCurrentGame();
    
    if (!this.game || !this.game.rooms || this.game.rooms.length === 0) {
      // No game data, redirect to home
      this.router.navigate(['/']);
      return;
    }

    // Load first chain
    this.loadChain(0);
  }

  loadChain(index: number): void {
    if (!this.game || !this.game.rooms) return;
    
    this.currentChainIndex = index;
    this.currentRoom = this.game.rooms[index];
  }

  nextChain(): void {
    if (!this.game) return;
    if (this.currentChainIndex < this.game.rooms.length - 1) {
      this.loadChain(this.currentChainIndex + 1);
    }
  }

  previousChain(): void {
    if (this.currentChainIndex > 0) {
      this.loadChain(this.currentChainIndex - 1);
    }
  }

  getEntryTypeLabel(type: string): string {
    switch (type) {
      case 'prompt':
        return '📝 Prompt';
      case 'drawing':
        return '🎨 Drawing';
      case 'guess':
        return '🤔 Guess';
      default:
        return type;
    }
  }

  getPlayerName(playerId: string): string {
    if (!this.game) return 'Unknown';
    
    const player = this.game.players.find(p => p.id === playerId);
    return player?.displayName || 'Unknown Player';
  }

  getPlayerIcon(playerId: string): string {
    if (!this.game) return DEFAULT_ICON;
    
    const player = this.game.players.find(p => p.id === playerId);
    return player?.icon || DEFAULT_ICON;
  }

  getDrawingData(content: any): any {
    // Convert content to DrawingData format
    if (content && typeof content === 'object') {
      return content;
    }
    return null;
  }

  toggleMute(): void {
    this.audioService.toggleMute();
  }

  playAgain(): void {
    this.gameService.leaveGame();
    this.router.navigate(['/']);
  }

  backToHome(): void {
    this.gameService.leaveGame();
    this.router.navigate(['/']);
  }
}
