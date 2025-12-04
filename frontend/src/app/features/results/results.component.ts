import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { Game, Room } from '@monday-painter/models';

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

    .navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
    }

    .nav-btn {
      padding: 12px 24px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .nav-btn:hover:not(:disabled) {
      background: #f3f4f6;
      transform: translateY(-2px);
    }

    .nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .chain-counter {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .chain-display {
      background: white;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .chain-display h2 {
      text-align: center;
      color: #667eea;
      margin-bottom: 32px;
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
      background: #fef3c7;
      border: 2px solid #fbbf24;
    }

    .drawing-entry {
      background: #dbeafe;
      border: 2px solid #3b82f6;
    }

    .guess-entry {
      background: #d1fae5;
      border: 2px solid #10b981;
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
      color: #374151;
    }

    .entry-player {
      font-size: 14px;
      color: #6b7280;
      font-style: italic;
    }

    .entry-content {
      margin-top: 12px;
    }

    .text-content {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      text-align: center;
      padding: 16px;
    }

    .drawing-content {
      display: flex;
      justify-content: center;
      background: white;
      padding: 16px;
      border-radius: 8px;
    }

    .arrow {
      text-align: center;
      font-size: 32px;
      color: #9ca3af;
      margin: 16px 0;
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
      transition: all 0.2s;
    }

    .actions .primary {
      background: #667eea;
      color: white;
      border: none;
    }

    .actions .primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .actions .secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .actions .secondary:hover {
      background: #f3f4f6;
      transform: translateY(-2px);
    }
  `]
})
export class ResultsComponent implements OnInit {
  game: Game | null = null;
  currentChainIndex = 0;
  currentRoom: Room | null = null;

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit(): void {
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

  getDrawingData(content: any): any {
    // Convert content to DrawingData format
    if (content && typeof content === 'object') {
      return content;
    }
    return null;
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
