# Design Document

## Overview

The Monday Painter frontend is an Angular single-page application that provides an interactive UI for the multiplayer drawing game. The application uses Angular's component-based architecture, reactive forms, and RxJS for state management. Real-time communication is handled via WebSocket connections. The design emphasizes modularity, reusability, and responsive design patterns similar to Gartic Phone.

## Architecture

### Application Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── websocket.service.ts
│   │   │   ├── game.service.ts
│   │   │   └── player.service.ts
│   │   ├── guards/
│   │   │   └── game.guard.ts
│   │   └── interceptors/
│   │       └── error.interceptor.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── timer/
│   │   │   ├── player-list/
│   │   │   └── loading-spinner/
│   │   ├── models/
│   │   │   └── (imported from monday-painter-models)
│   │   └── pipes/
│   │       └── time-remaining.pipe.ts
│   ├── features/
│   │   ├── game-list/
│   │   │   ├── game-list.component.ts
│   │   │   └── game-card/
│   │   ├── lobby/
│   │   │   └── lobby.component.ts
│   │   ├── game/
│   │   │   ├── game.component.ts
│   │   │   ├── input-phase/
│   │   │   ├── draw-phase/
│   │   │   │   ├── canvas/
│   │   │   │   └── toolbar/
│   │   │   ├── guess-phase/
│   │   │   └── transition/
│   │   └── results/
│   │       ├── results.component.ts
│   │       └── chain-viewer/
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   └── app.module.ts
├── assets/
├── environments/
└── styles/
```

## Components and Interfaces

### Core Services

#### WebSocketService

Manages WebSocket connection and message handling:

```typescript
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket$: WebSocketSubject<any>;
  private messagesSubject = new Subject<any>();
  public messages$ = this.messagesSubject.asObservable();
  
  connect(url: string): void;
  disconnect(): void;
  send(message: any): void;
  onMessage(type: string): Observable<any>;
  get connectionStatus$(): Observable<ConnectionState>;
}
```

#### GameService

Manages game state and operations:

```typescript
@Injectable({ providedIn: 'root' })
export class GameService {
  private currentGame$ = new BehaviorSubject<Game | null>(null);
  
  createGame(options: CreateGameOptions): Observable<Game>;
  joinGame(gameId: string): Observable<void>;
  leaveGame(): Observable<void>;
  startGame(): Observable<void>;
  submitPrompt(prompt: string): Observable<void>;
  submitDrawing(drawingData: DrawingData): Observable<void>;
  submitGuess(guess: string): Observable<void>;
  
  get game$(): Observable<Game | null>;
  get currentRoom$(): Observable<Room | null>;
  get currentPhase$(): Observable<Phase | null>;
}
```

#### PlayerService

Manages player data and preferences:

```typescript
@Injectable({ providedIn: 'root' })
export class PlayerService {
  private currentPlayer$ = new BehaviorSubject<Player | null>(null);
  
  setDisplayName(name: string): void;
  getDisplayName(): string | null;
  get player$(): Observable<Player | null>;
}
```

### Feature Components

#### GameListComponent

Main landing page showing available games:

```typescript
@Component({
  selector: 'app-game-list',
  template: `
    <div class="game-list-container">
      <h1>Monday Painter</h1>
      <button (click)="createGame()">Create Game</button>
      <div class="games-grid">
        <app-game-card 
          *ngFor="let game of games$ | async"
          [game]="game"
          (join)="joinGame($event)">
        </app-game-card>
      </div>
    </div>
  `
})
export class GameListComponent {
  games$: Observable<Game[]>;
  
  createGame(): void;
  joinGame(gameId: string): void;
}
```

#### LobbyComponent

Pre-game waiting room:

```typescript
@Component({
  selector: 'app-lobby',
  template: `
    <div class="lobby-container">
      <h2>{{ game.name }}</h2>
      <app-player-list [players]="game.players"></app-player-list>
      <div class="lobby-actions">
        <button *ngIf="isHost" 
                [disabled]="!canStart"
                (click)="startGame()">
          Start Game
        </button>
        <button (click)="leaveGame()">Leave</button>
      </div>
    </div>
  `
})
export class LobbyComponent {
  game: Game;
  isHost: boolean;
  canStart: boolean;
  
  startGame(): void;
  leaveGame(): void;
}
```

#### GameComponent

Main gameplay container that switches between phases:

```typescript
@Component({
  selector: 'app-game',
  template: `
    <div class="game-container">
      <app-timer [duration]="phaseDuration$ | async"></app-timer>
      <div class="phase-content">
        <app-input-phase *ngIf="phase === Phase.INPUT"
                         (submit)="submitPrompt($event)">
        </app-input-phase>
        <app-draw-phase *ngIf="phase === Phase.DRAW"
                        [prompt]="currentPrompt$ | async"
                        (submit)="submitDrawing($event)">
        </app-draw-phase>
        <app-guess-phase *ngIf="phase === Phase.GUESS"
                         [drawing]="currentDrawing$ | async"
                         (submit)="submitGuess($event)">
        </app-guess-phase>
      </div>
    </div>
  `
})
export class GameComponent {
  phase: Phase;
  phaseDuration$: Observable<number>;
  currentPrompt$: Observable<string>;
  currentDrawing$: Observable<DrawingData>;
  
  submitPrompt(prompt: string): void;
  submitDrawing(drawing: DrawingData): void;
  submitGuess(guess: string): void;
}
```

#### InputPhaseComponent

Text input for writing prompts:

```typescript
@Component({
  selector: 'app-input-phase',
  template: `
    <div class="input-phase">
      <h3>Write something to draw</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <input type="text" 
               formControlName="prompt"
               placeholder="Enter a prompt..."
               maxlength="100">
        <span class="char-count">{{ charCount }}/100</span>
        <button type="submit" [disabled]="!form.valid">Submit</button>
      </form>
    </div>
  `
})
export class InputPhaseComponent {
  @Output() submit = new EventEmitter<string>();
  form: FormGroup;
  charCount: number;
  
  onSubmit(): void;
}
```

#### DrawPhaseComponent

Drawing canvas with tools:

```typescript
@Component({
  selector: 'app-draw-phase',
  template: `
    <div class="draw-phase">
      <h3>Draw: "{{ prompt }}"</h3>
      <app-canvas #canvas
                  [width]="800"
                  [height]="600"
                  (strokeAdded)="onStrokeAdded($event)">
      </app-canvas>
      <app-toolbar [selectedColor]="selectedColor"
                   [selectedWidth]="selectedWidth"
                   (colorChange)="onColorChange($event)"
                   (widthChange)="onWidthChange($event)"
                   (undo)="canvas.undo()"
                   (clear)="canvas.clear()">
      </app-toolbar>
      <button (click)="onSubmit()">Submit Drawing</button>
    </div>
  `
})
export class DrawPhaseComponent {
  @Input() prompt: string;
  @Output() submit = new EventEmitter<DrawingData>();
  
  selectedColor: string;
  selectedWidth: number;
  
  onSubmit(): void;
  onColorChange(color: string): void;
  onWidthChange(width: number): void;
}
```

#### CanvasComponent

HTML5 canvas for drawing:

```typescript
@Component({
  selector: 'app-canvas',
  template: `
    <canvas #canvasElement
            [width]="width"
            [height]="height"
            (mousedown)="startDrawing($event)"
            (mousemove)="draw($event)"
            (mouseup)="stopDrawing()"
            (mouseleave)="stopDrawing()"
            (touchstart)="startDrawing($event)"
            (touchmove)="draw($event)"
            (touchend)="stopDrawing()">
    </canvas>
  `
})
export class CanvasComponent {
  @Input() width: number;
  @Input() height: number;
  @Output() strokeAdded = new EventEmitter<Stroke>();
  
  private ctx: CanvasRenderingContext2D;
  private isDrawing = false;
  private currentStroke: Stroke;
  private strokes: Stroke[] = [];
  
  startDrawing(event: MouseEvent | TouchEvent): void;
  draw(event: MouseEvent | TouchEvent): void;
  stopDrawing(): void;
  undo(): void;
  clear(): void;
  getDrawingData(): DrawingData;
}
```

#### GuessPhaseComponent

Display drawing and input guess:

```typescript
@Component({
  selector: 'app-guess-phase',
  template: `
    <div class="guess-phase">
      <h3>What is this?</h3>
      <app-canvas [width]="800"
                  [height]="600"
                  [readonly]="true"
                  [drawingData]="drawing">
      </app-canvas>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <input type="text"
               formControlName="guess"
               placeholder="Enter your guess..."
               maxlength="100">
        <button type="submit" [disabled]="!form.valid">Submit</button>
      </form>
    </div>
  `
})
export class GuessPhaseComponent {
  @Input() drawing: DrawingData;
  @Output() submit = new EventEmitter<string>();
  form: FormGroup;
  
  onSubmit(): void;
}
```

#### ResultsComponent

Display game results with all chains:

```typescript
@Component({
  selector: 'app-results',
  template: `
    <div class="results-container">
      <h2>Game Results</h2>
      <div class="chain-navigation">
        <button (click)="previousChain()" [disabled]="currentChainIndex === 0">
          Previous
        </button>
        <span>Chain {{ currentChainIndex + 1 }} of {{ chains.length }}</span>
        <button (click)="nextChain()" [disabled]="currentChainIndex === chains.length - 1">
          Next
        </button>
      </div>
      <app-chain-viewer [chain]="currentChain"></app-chain-viewer>
      <button (click)="returnToGameList()">Back to Games</button>
    </div>
  `
})
export class ResultsComponent {
  chains: ChainEntry[][];
  currentChainIndex: number;
  currentChain: ChainEntry[];
  
  previousChain(): void;
  nextChain(): void;
  returnToGameList(): void;
}
```

## Data Models

The frontend imports all data models from the shared models library:

```typescript
import {
  Game,
  Player,
  Room,
  ChainEntry,
  DrawingData,
  Stroke,
  GameState,
  Phase,
  ConnectionStatus,
  EntryType,
  ToolType
} from '@monday-painter/models';
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Canvas serialization round-trip preserves strokes

*For any* DrawingData created on the canvas, serializing and deserializing should produce equivalent stroke data.
**Validates: Requirements 8.8**

### Property 2: Form validation rejects invalid input

*For any* string with length outside the valid range (3-100 characters), form validation should mark the field as invalid.
**Validates: Requirements 7.2, 9.3**

### Property 3: Timer countdown decreases monotonically

*For any* timer instance, the displayed time should decrease by 1 second for each second elapsed until reaching zero.
**Validates: Requirements 6.3**

### Property 4: Phase transitions preserve game state

*For any* phase transition, the game ID and player list should remain unchanged.
**Validates: Requirements 6.5**

### Property 5: WebSocket reconnection restores state

*For any* connection loss followed by successful reconnection, the player should return to their current game and phase.
**Validates: Requirements 15.3**

## Error Handling

### Network Errors

- Display user-friendly error messages
- Implement retry logic with exponential backoff
- Provide manual reconnect option
- Log errors for debugging

### Validation Errors

- Show inline validation messages
- Prevent form submission when invalid
- Highlight invalid fields
- Provide clear error descriptions

### State Errors

- Handle unexpected state transitions gracefully
- Provide fallback UI for error states
- Allow user to return to safe state (game list)
- Log state errors for debugging

## Testing Strategy

### Unit Tests

- Test each component's logic and event handling
- Test services with mocked dependencies
- Test form validation rules
- Test canvas drawing operations
- Test state management in services

### Property-Based Tests

Property-based tests will use `fast-check` library. Each test should run a minimum of 100 iterations.

- **Property 1**: Test canvas serialization with randomly generated stroke data
- **Property 2**: Test form validation with random string inputs
- **Property 3**: Test timer countdown with random durations
- **Property 4**: Test phase transitions with random game states
- **Property 5**: Test WebSocket reconnection with random connection states

Each property-based test must be tagged with: `**Feature: monday-painter-frontend, Property {number}: {property_text}**`

### Integration Tests

- Test navigation between routes
- Test WebSocket message handling end-to-end
- Test game flow from lobby to results
- Test responsive design on different screen sizes

### E2E Tests

- Test complete game flow with multiple players
- Test error scenarios and recovery
- Test mobile touch interactions
- Test accessibility features
