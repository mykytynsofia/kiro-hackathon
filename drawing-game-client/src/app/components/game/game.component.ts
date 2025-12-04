import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../services/websocket.service';
import { GameStateService } from '../../services/game-state.service';
import { GameMessage, DrawingStroke, Guess } from '../../models/types';
import { CanvasComponent } from '../canvas/canvas.component';
import { PlayerListComponent } from '../player-list/player-list.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
import { GuessFeedComponent } from '../guess-feed/guess-feed.component';
import { GuessInputComponent } from '../guess-input/guess-input.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    CanvasComponent,
    PlayerListComponent,
    ScoreboardComponent,
    GuessFeedComponent,
    GuessInputComponent
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild(CanvasComponent) canvasComponent!: CanvasComponent;

  roomId: string = '';
  private subscriptions: Subscription[] = [];

  // Observable streams
  players$ = this.gameState.players$;
  scores$ = this.gameState.scores$;
  currentPrompt$ = this.gameState.currentPrompt$;
  guesses$ = this.gameState.guesses$;
  isDrawer$ = this.gameState.isDrawer$;
  roundNumber$ = this.gameState.roundNumber$;
  drawerId$ = this.gameState.drawerId$;
  connectionStatus$ = this.wsService.connectionStatus$;

  constructor(
    private route: ActivatedRoute,
    private wsService: WebSocketService,
    public gameState: GameStateService
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId') || '';

    // Subscribe to WebSocket messages
    const messageSub = this.wsService.messages$.subscribe(message => {
      this.handleMessage(message);
    });
    this.subscriptions.push(messageSub);

    // Auto-reconnect if not connected (e.g., after page refresh)
    if (!this.wsService.isConnected()) {
      const savedRoomId = localStorage.getItem('roomId');
      const savedPlayerName = localStorage.getItem('playerName');
      
      if (savedRoomId && savedPlayerName && this.roomId === savedRoomId) {
        console.log('Auto-reconnecting to room:', savedRoomId);
        this.wsService.connect(savedRoomId, savedPlayerName);
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Note: We keep localStorage data so user can refresh
    // To clear session, user should explicitly leave the game
  }

  leaveGame(): void {
    // Clear session data
    localStorage.removeItem('roomId');
    localStorage.removeItem('playerName');
    this.wsService.disconnect();
  }

  private handleMessage(message: GameMessage): void {
    console.log('Received message:', message.type, message);

    switch (message.type) {
      case 'player_joined':
        this.gameState.updatePlayers(message.players);
        break;

      case 'player_left':
        this.gameState.updatePlayers(message.players);
        break;

      case 'round_start':
        this.gameState.setRoundNumber(message.roundNumber);
        this.gameState.setIsDrawer(message.isDrawer);
        this.gameState.setDrawerId(message.drawerId);
        this.gameState.setPrompt(message.prompt || null);
        this.gameState.clearGuesses();
        if (this.canvasComponent) {
          this.canvasComponent.clear();
        }
        break;

      case 'drawing_event':
        if (this.canvasComponent) {
          this.canvasComponent.drawStroke(message.stroke);
        }
        break;

      case 'tool_change':
        // Tool changes are already applied by the drawer locally
        break;

      case 'clear_canvas':
        if (this.canvasComponent) {
          this.canvasComponent.clear();
        }
        break;

      case 'guess':
        const guess: Guess = {
          playerId: message.playerId,
          playerName: message.playerName,
          guess: message.guess,
          correct: false,
          timestamp: message.timestamp
        };
        this.gameState.addGuess(guess);
        break;

      case 'guess_result':
        if (message.correct) {
          // Update the last guess to mark it as correct
          const guesses = [...this.gameState.guesses];
          const lastGuess = guesses[guesses.length - 1];
          if (lastGuess && lastGuess.playerId === message.playerId) {
            lastGuess.correct = true;
          }
        }
        break;

      case 'score_update':
        this.gameState.updateScores(message.scores);
        break;

      case 'round_end':
        // Show round end info (could add a modal here)
        console.log('Round ended! Prompt was:', message.prompt);
        break;

      case 'game_end':
        // Show game end info (could add a modal here)
        console.log('Game ended! Final rankings:', message.finalRankings);
        break;

      case 'error':
        console.error('Server error:', message.message);
        break;
    }
  }

  onStrokeDrawn(stroke: DrawingStroke): void {
    this.wsService.send({
      type: 'draw',
      stroke
    });
  }

  onToolChanged(tool: { color: string; brushSize: number }): void {
    this.wsService.send({
      type: 'tool_change',
      color: tool.color,
      brushSize: tool.brushSize
    });
  }

  onCanvasCleared(): void {
    this.wsService.send({
      type: 'clear_canvas'
    });
  }

  onGuessSubmitted(guess: string): void {
    this.wsService.send({
      type: 'guess',
      guess
    });
  }
}
