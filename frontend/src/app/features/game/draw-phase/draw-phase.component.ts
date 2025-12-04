import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from '../../../core/services/game.service';
import { CanvasComponent } from '../../../shared/components/canvas/canvas.component';
import { DrawingData } from '@monday-painter/models';

@Component({
  selector: 'app-draw-phase',
  template: `
    <div class="draw-phase">
      <h2>Draw This!</h2>
      <p class="prompt">"{{ prompt }}"</p>

      <!-- Drawing Canvas -->
      <div class="canvas-container">
        <app-canvas
          #canvas
          [width]="800"
          [height]="600"
          [readonly]="submitted">
        </app-canvas>
      </div>

      <!-- Toolbar -->
      <div class="toolbar" *ngIf="!submitted">
        <div class="tool-section">
          <label>Color:</label>
          <div class="color-picker">
            <button 
              *ngFor="let color of colors"
              class="color-btn"
              [style.background-color]="color"
              (click)="canvas.setColor(color)"
              [class.active]="canvas.currentColor === color && canvas.currentTool === 'brush'">
            </button>
          </div>
        </div>

        <div class="tool-section">
          <label>Brush Size:</label>
          <input 
            type="range" 
            min="1" 
            max="20" 
            [(ngModel)]="brushSize"
            (input)="canvas.setWidth(brushSize)">
          <span>{{ brushSize }}px</span>
        </div>

        <div class="tool-section">
          <button class="tool-btn" (click)="canvas.setEraser()">
            🧹 Eraser
          </button>
          <button class="tool-btn" (click)="canvas.undo()">
            ↶ Undo
          </button>
          <button class="tool-btn" (click)="canvas.clear()">
            🗑️ Clear
          </button>
        </div>
      </div>

      <button 
        class="primary submit-btn"
        (click)="submitDrawing()"
        [disabled]="submitted">
        {{ submitted ? 'Submitted! Waiting for others...' : 'Submit Drawing' }}
      </button>

      <div class="waiting-message" *ngIf="submitted">
        <div class="spinner"></div>
        <p>Waiting for other players to finish drawing...</p>
      </div>
    </div>
  `,
  styles: [`
    .draw-phase {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }

    h2 {
      text-align: center;
      color: white;
      margin-bottom: 8px;
    }

    .prompt {
      text-align: center;
      color: white;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 24px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    .canvas-container {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .toolbar {
      background: white;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      align-items: center;
    }

    .tool-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tool-section label {
      font-weight: 600;
      color: #374151;
    }

    .color-picker {
      display: flex;
      gap: 8px;
    }

    .color-btn {
      width: 32px;
      height: 32px;
      border: 2px solid #d1d5db;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.2s, border-color 0.2s;
    }

    .color-btn:hover {
      transform: scale(1.1);
    }

    .color-btn.active {
      border-color: #3b82f6;
      border-width: 3px;
      transform: scale(1.15);
    }

    .tool-btn {
      padding: 8px 16px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }

    .tool-btn:hover {
      background: #e5e7eb;
    }

    input[type="range"] {
      width: 120px;
    }

    .submit-btn {
      width: 100%;
      max-width: 400px;
      display: block;
      margin: 0 auto;
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
export class DrawPhaseComponent implements OnInit, OnDestroy {
  @ViewChild('canvas') canvasComponent!: CanvasComponent;
  
  prompt: string = '';
  submitted = false;
  brushSize = 3;
  colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];
  private subscriptions: Subscription[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Get current room to access the prompt
    const roomSub = this.gameService.currentRoom$.subscribe(room => {
      if (room && room.chain.length > 0) {
        // Get the last entry (should be a prompt or guess)
        const lastEntry = room.chain[room.chain.length - 1];
        if (lastEntry.type === 'prompt' && typeof lastEntry.content === 'string') {
          this.prompt = lastEntry.content;
        } else if (lastEntry.type === 'guess' && typeof lastEntry.content === 'string') {
          this.prompt = lastEntry.content;
        }
      }
    });
    this.subscriptions.push(roomSub);

    // Listen for phase changes
    const phaseSub = this.gameService.currentPhase$.subscribe(phase => {
      if (phase && phase !== 'draw') {
        this.submitted = false;
      }
    });
    this.subscriptions.push(phaseSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  submitDrawing(): void {
    if (!this.submitted && this.canvasComponent) {
      const drawingData = this.canvasComponent.getDrawingData();
      this.gameService.submitDrawing(drawingData);
      this.submitted = true;
    }
  }
}
