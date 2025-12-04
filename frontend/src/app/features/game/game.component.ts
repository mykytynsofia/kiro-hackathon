import { Component, OnInit } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { Phase } from '@monday-painter/models';

@Component({
  selector: 'app-game',
  template: `
    <div class="game-container">
      <div class="game-header">
        <h2>Monday Painter</h2>
        <app-timer [duration]="60"></app-timer>
      </div>

      <div class="game-content">
        <div *ngIf="currentPhase === Phase.INPUT" class="phase-container">
          <h3>Write a Prompt</h3>
          <p>Write something for the next player to draw</p>
          <textarea 
            [(ngModel)]="promptText" 
            placeholder="Enter your prompt..."
            maxlength="100">
          </textarea>
          <p class="char-count">{{ promptText.length }}/100</p>
          <button class="primary" (click)="submitPrompt()">Submit</button>
        </div>

        <div *ngIf="currentPhase === Phase.DRAW" class="phase-container">
          <h3>Draw This</h3>
          <p class="prompt-display">"{{ currentPrompt }}"</p>
          <div class="canvas-placeholder">
            <p>🎨 Canvas will go here</p>
            <p style="font-size: 14px; color: #666;">Drawing functionality coming soon</p>
          </div>
          <button class="primary" (click)="submitDrawing()">Submit Drawing</button>
        </div>

        <div *ngIf="currentPhase === Phase.GUESS" class="phase-container">
          <h3>What is this?</h3>
          <div class="canvas-placeholder">
            <p>🖼️ Drawing will be displayed here</p>
          </div>
          <input 
            type="text" 
            [(ngModel)]="guessText" 
            placeholder="Enter your guess..."
            maxlength="100">
          <button class="primary" (click)="submitGuess()">Submit Guess</button>
        </div>

        <div *ngIf="!currentPhase" class="phase-container">
          <p>Waiting for game to start...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      background: white;
      padding: 20px;
      border-radius: 12px;
    }

    .game-header h2 {
      margin: 0;
      color: #667eea;
    }

    .game-content {
      background: white;
      border-radius: 12px;
      padding: 32px;
    }

    .phase-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .phase-container h3 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .phase-container p {
      margin: 0;
      color: #666;
    }

    .prompt-display {
      font-size: 20px;
      font-weight: 600;
      color: #667eea;
      padding: 16px;
      background: #f3f4f6;
      border-radius: 8px;
      text-align: center;
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }

    .char-count {
      text-align: right;
      font-size: 14px;
      color: #999;
    }

    .canvas-placeholder {
      background: #f9fafb;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 60px 20px;
      text-align: center;
      color: #9ca3af;
    }
  `]
})
export class GameComponent implements OnInit {
  Phase = Phase;
  currentPhase: Phase | null = null;
  currentPrompt = 'Draw a happy cat';
  promptText = '';
  guessText = '';

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.currentPhase$.subscribe(phase => {
      this.currentPhase = phase;
    });
  }

  submitPrompt(): void {
    if (this.promptText.trim().length >= 3) {
      this.gameService.submitPrompt(this.promptText);
      this.promptText = '';
    } else {
      alert('Prompt must be at least 3 characters');
    }
  }

  submitDrawing(): void {
    // Placeholder - would submit actual drawing data
    this.gameService.submitDrawing({
      strokes: [],
      width: 800,
      height: 600
    });
  }

  submitGuess(): void {
    if (this.guessText.trim().length >= 3) {
      this.gameService.submitGuess(this.guessText);
      this.guessText = '';
    } else {
      alert('Guess must be at least 3 characters');
    }
  }
}
