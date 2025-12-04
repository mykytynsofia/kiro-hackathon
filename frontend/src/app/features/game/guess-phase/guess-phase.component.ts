import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GameService } from '../../../core/services/game.service';
import { DrawingData } from '@monday-painter/models';
import { CanvasComponent } from '../../../shared/components/canvas/canvas.component';

@Component({
  selector: 'app-guess-phase',
  template: `
    <div class="guess-phase">
      <h2>What was drawn?</h2>
      <p class="instruction">Look at the drawing and guess what it is!</p>

      <!-- Timer -->
      <app-timer 
        *ngIf="phaseStartedAt && phaseDuration"
        [phaseStartedAt]="phaseStartedAt"
        [phaseDuration]="phaseDuration">
      </app-timer>

      <!-- Drawing Display -->
      <div class="drawing-container">
        <app-canvas
          #canvas
          [width]="800"
          [height]="600"
          [readonly]="true"
          [drawingData]="drawingData">
        </app-canvas>
      </div>

      <!-- Guess Input -->
      <div class="form-container">
        <input
          type="text"
          [formControl]="guessControl"
          placeholder="Enter your guess (3-100 characters)"
          maxlength="100"
          [disabled]="submitted"
        />
        
        <div class="char-count" [class.warning]="guessControl.value && guessControl.value.length < 3">
          {{ guessControl.value?.length || 0 }} / 100 characters
          <span *ngIf="guessControl.value && guessControl.value.length < 3" class="min-warning">
            (minimum 3)
          </span>
        </div>

        <button 
          class="primary submit-btn"
          (click)="submitGuess()"
          [disabled]="!guessControl.valid || submitted">
          {{ submitted ? 'Submitted! Waiting for others...' : 'Submit Guess' }}
        </button>
      </div>

      <div class="waiting-message" *ngIf="submitted">
        <div class="spinner"></div>
        <p>Waiting for other players to submit their guesses...</p>
      </div>
    </div>
  `,
  styles: [`
    .guess-phase {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    h2 {
      text-align: center;
      color: white;
      margin-bottom: 8px;
    }

    .instruction {
      text-align: center;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 24px;
    }

    .drawing-container {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .form-container {
      background: rgba(255, 255, 255, 0.05);
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    input {
      width: 100%;
      padding: 16px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      font-size: 16px;
      font-family: inherit;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.05);
      color: white;
      backdrop-filter: blur(10px);
    }

    input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    input:focus {
      outline: none;
      border-color: var(--halloween-purple);
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 20px rgba(93, 63, 211, 0.3);
    }

    input:disabled {
      background: rgba(255, 255, 255, 0.02);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .char-count {
      text-align: right;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 8px;
      margin-bottom: 16px;
    }

    .char-count.warning {
      color: #FFA500;
    }

    .min-warning {
      font-weight: 600;
    }

    .submit-btn {
      width: 100%;
      padding: 14px;
      font-size: 16px;
      font-weight: 600;
    }

    .waiting-message {
      margin-top: 24px;
      text-align: center;
      color: white;
    }

    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 16px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .waiting-message p {
      font-size: 16px;
      opacity: 0.9;
    }
  `]
})
export class GuessPhaseComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('canvas') canvasComponent!: CanvasComponent;
  
  guessControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(100)
  ]);
  
  submitted = false;
  drawingData: DrawingData | null = null;
  phaseStartedAt: number = 0;
  phaseDuration: number = 20; // GUESS_DURATION
  private subscriptions: Subscription[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Get current room to access the drawing and timer info
    const roomSub = this.gameService.currentRoom$.subscribe(room => {
      if (room) {
        // Get timer info
        this.phaseStartedAt = room.phaseStartedAt || Date.now();
        this.phaseDuration = room.phaseDuration || 20;

        // Get the drawing
        if (room.chain.length > 0) {
          const lastEntry = room.chain[room.chain.length - 1];
          if (lastEntry.type === 'drawing' && lastEntry.content) {
            this.drawingData = lastEntry.content as unknown as DrawingData;
            
            // If canvas is already initialized, load the drawing
            if (this.canvasComponent) {
              this.loadDrawingToCanvas();
            }
          }
        }
      }
    });
    this.subscriptions.push(roomSub);

    // Listen for phase changes
    const phaseSub = this.gameService.currentPhase$.subscribe(phase => {
      if (phase && phase !== 'guess') {
        this.submitted = false;
      }
    });
    this.subscriptions.push(phaseSub);
  }

  ngAfterViewInit(): void {
    // Load drawing after canvas is initialized
    if (this.drawingData && this.canvasComponent) {
      setTimeout(() => this.loadDrawingToCanvas(), 0);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadDrawingToCanvas(): void {
    if (this.drawingData && this.canvasComponent) {
      // The canvas component will load the drawing via the [drawingData] input
      // But we can also manually trigger a redraw if needed
      console.log('Loading drawing with', this.drawingData.strokes?.length || 0, 'strokes');
    }
  }

  submitGuess(): void {
    if (this.guessControl.valid && !this.submitted) {
      const guess = this.guessControl.value?.trim() || '';
      this.gameService.submitGuess(guess);
      this.submitted = true;
    }
  }
}
