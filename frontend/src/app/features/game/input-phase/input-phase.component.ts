import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GameService } from '../../../core/services/game.service';

@Component({
  selector: 'app-input-phase',
  template: `
    <div class="input-phase">
      <h2>Write a Prompt</h2>
      <p class="instruction">Write something for the next player to draw!</p>

      <div class="form-container">
        <textarea
          [formControl]="promptControl"
          placeholder="Enter your prompt (3-100 characters)"
          maxlength="100"
          rows="4"
          [disabled]="submitted"
        ></textarea>
        
        <div class="char-count" [class.warning]="promptControl.value && promptControl.value.length < 3">
          {{ promptControl.value?.length || 0 }} / 100 characters
          <span *ngIf="promptControl.value && promptControl.value.length < 3" class="min-warning">
            (minimum 3)
          </span>
        </div>

        <button 
          class="primary submit-btn"
          (click)="submitPrompt()"
          [disabled]="!promptControl.valid || submitted">
          {{ submitted ? 'Submitted! Waiting for others...' : 'Submit Prompt' }}
        </button>
      </div>

      <div class="waiting-message" *ngIf="submitted">
        <div class="spinner"></div>
        <p>Waiting for other players to submit their prompts...</p>
      </div>
    </div>
  `,
  styles: [`
    .input-phase {
      max-width: 600px;
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
      margin-bottom: 32px;
    }

    .form-container {
      background: rgba(255, 255, 255, 0.05);
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    textarea {
      width: 100%;
      padding: 16px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      font-size: 16px;
      font-family: inherit;
      resize: vertical;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.05);
      color: white;
      backdrop-filter: blur(10px);
    }

    textarea::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    textarea:focus {
      outline: none;
      border-color: var(--halloween-purple);
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 20px rgba(93, 63, 211, 0.3);
    }

    textarea:disabled {
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
export class InputPhaseComponent implements OnInit, OnDestroy {
  promptControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(100)
  ]);
  
  submitted = false;
  private subscriptions: Subscription[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Listen for phase changes (in case we already submitted)
    const phaseSub = this.gameService.currentPhase$.subscribe(phase => {
      // If phase changes away from input, we're done
      if (phase && phase !== 'input') {
        this.submitted = false;
      }
    });
    this.subscriptions.push(phaseSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  submitPrompt(): void {
    if (this.promptControl.valid && !this.submitted) {
      const prompt = this.promptControl.value?.trim() || '';
      this.gameService.submitPrompt(prompt);
      this.submitted = true;
    }
  }
}
