import { Game, Room, EntryType, Phase } from '@monday-painter/models';
import { GameManager } from '../managers/game-manager';
import { RoomManager } from '../managers/room-manager';
import { BroadcastService } from '../services/broadcast.service';

/**
 * Handle input phase timer expiry
 */
export function handleInputPhaseExpiry(
  game: Game,
  room: Room,
  _gameManager: GameManager,
  roomManager: RoomManager,
  broadcast: BroadcastService
): void {
  // Create default prompt
  const defaultPrompt = 'Draw something interesting';
  
  const entry = {
    type: EntryType.PROMPT,
    playerId: room.currentPlayerId || 'system',
    content: defaultPrompt,
    timestamp: Date.now()
  };

  roomManager.addChainEntry(room, entry);
  
  const nextPlayerId = roomManager.getNextPlayerId(game, room.currentPlayerId!);
  roomManager.advancePhase(room, nextPlayerId);

  broadcast.toGame(game, {
    type: 'phaseAdvanced',
    payload: { room, game, reason: 'timeout' }
  });
}

/**
 * Handle draw phase timer expiry
 */
export function handleDrawPhaseExpiry(
  game: Game,
  room: Room,
  _gameManager: GameManager,
  roomManager: RoomManager,
  broadcast: BroadcastService
): void {
  // Create empty drawing
  const emptyDrawing = {
    strokes: [],
    width: 800,
    height: 600
  };
  
  const entry = {
    type: EntryType.DRAWING,
    playerId: room.currentPlayerId || 'system',
    drawingData: emptyDrawing,
    timestamp: Date.now()
  };

  roomManager.addChainEntry(room, entry);
  
  const nextPlayerId = roomManager.getNextPlayerId(game, room.currentPlayerId!);
  roomManager.advancePhase(room, nextPlayerId);

  broadcast.toGame(game, {
    type: 'phaseAdvanced',
    payload: { room, game, reason: 'timeout' }
  });
}

/**
 * Handle guess phase timer expiry
 */
export function handleGuessPhaseExpiry(
  game: Game,
  room: Room,
  gameManager: GameManager,
  roomManager: RoomManager,
  broadcast: BroadcastService
): void {
  // Create default guess
  const defaultGuess = 'I have no idea';
  
  const entry = {
    type: EntryType.GUESS,
    playerId: room.currentPlayerId || 'system',
    content: defaultGuess,
    timestamp: Date.now()
  };

  roomManager.addChainEntry(room, entry);

  // Check if game is complete
  if (roomManager.checkGameComplete(game)) {
    gameManager.endGame(game.id);
    broadcast.toGame(game, {
      type: 'gameEnded',
      payload: { game }
    });
  } else {
    const nextPlayerId = roomManager.getNextPlayerId(game, room.currentPlayerId!);
    roomManager.advancePhase(room, nextPlayerId);

    broadcast.toGame(game, {
      type: 'phaseAdvanced',
      payload: { room, game, reason: 'timeout' }
    });
  }
}

/**
 * Start timer for a room
 */
export function startRoomTimer(
  game: Game,
  room: Room,
  gameManager: GameManager,
  roomManager: RoomManager,
  broadcast: BroadcastService,
  timerManager: any
): void {
  const callback = () => {
    switch (room.phase) {
      case Phase.INPUT:
        handleInputPhaseExpiry(game, room, gameManager, roomManager, broadcast);
        break;
      case Phase.DRAW:
        handleDrawPhaseExpiry(game, room, gameManager, roomManager, broadcast);
        break;
      case Phase.GUESS:
        handleGuessPhaseExpiry(game, room, gameManager, roomManager, broadcast);
        break;
    }
  };

  timerManager.startTimer(room.id, room.phaseDuration, callback);
}
