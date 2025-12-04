import { Game, Room, Phase, EntryType, ChainEntry } from '@monday-painter/models';
import { GameManager } from '../managers/game-manager';
import { RoomManager } from '../managers/room-manager';
import { BroadcastService } from '../services/broadcast.service';

interface TimerContext {
  gameManager: GameManager;
  roomManager: RoomManager;
  broadcast: BroadcastService;
}

/**
 * Handle timer expiry for Input phase
 * Auto-submits prompts for players who haven't submitted
 */
export async function handleInputPhaseExpiry(
  game: Game,
  room: Room,
  context: TimerContext
): Promise<void> {
  console.log(`[TIMER] Input phase expired for room ${room.id} in game ${game.id}`);

  // Check if room already has a prompt entry
  const hasPrompt = room.chain.some(e => e.type === EntryType.PROMPT);
  
  if (!hasPrompt && room.currentPlayerId) {
    // Auto-submit default prompt
    const autoEntry: ChainEntry = {
      type: EntryType.PROMPT,
      playerId: room.currentPlayerId,
      content: '[Time expired - no prompt submitted]',
      timestamp: Date.now()
    };
    
    context.roomManager.addChainEntry(room, autoEntry);
    console.log(`[TIMER] Auto-submitted prompt for player ${room.currentPlayerId}`);
  }

  // Check if all rooms have prompts now
  const allSubmitted = game.rooms.every(r => 
    r.chain.some(e => e.type === EntryType.PROMPT)
  );

  if (allSubmitted) {
    // Rotate players to next room and advance to draw phase
    game.players.forEach((player, playerIndex) => {
      const nextRoomIndex = (playerIndex + 1) % game.rooms.length;
      const nextRoom = game.rooms[nextRoomIndex];
      
      player.currentRoomId = nextRoom.id;
      nextRoom.currentPlayerId = player.id;
      nextRoom.phase = Phase.DRAW;
      nextRoom.phaseStartedAt = Date.now();
      
      // Calculate draw duration: start at 60s, decrease by 10s each round, minimum 20s
      const roundNumber = Math.floor(nextRoom.chain.length / 2);
      const drawDuration = Math.max(20, 60 - (roundNumber * 10));
      nextRoom.phaseDuration = drawDuration;
    });

    // Broadcast phase change to all players
    context.broadcast.toGame(game, {
      type: 'phaseAdvanced',
      payload: { game }
    });

    console.log(`[TIMER] All prompts submitted (including auto-submit). Advancing to DRAW phase.`);
  }
}

/**
 * Handle timer expiry for Draw phase
 * Auto-submits empty drawings for players who haven't submitted
 */
export async function handleDrawPhaseExpiry(
  game: Game,
  room: Room,
  context: TimerContext
): Promise<void> {
  console.log(`[TIMER] Draw phase expired for room ${room.id} in game ${game.id}`);

  // Check if room already has a drawing entry
  const lastEntry = room.chain[room.chain.length - 1];
  const hasDrawing = lastEntry && lastEntry.type === EntryType.DRAWING;
  
  if (!hasDrawing && room.currentPlayerId) {
    // Auto-submit empty drawing
    const autoEntry: ChainEntry = {
      type: EntryType.DRAWING,
      playerId: room.currentPlayerId,
      drawingData: { strokes: [], width: 800, height: 600 }, // Empty canvas
      timestamp: Date.now()
    };
    
    context.roomManager.addChainEntry(room, autoEntry);
    console.log(`[TIMER] Auto-submitted empty drawing for player ${room.currentPlayerId}`);
  }

  // Count how many rooms are in draw phase and have submitted
  const drawPhaseRooms = game.rooms.filter(r => r.phase === Phase.DRAW);
  const submittedCount = drawPhaseRooms.filter(r => {
    const currentEntry = r.chain[r.chain.length - 1];
    return currentEntry && currentEntry.type === EntryType.DRAWING;
  }).length;

  if (submittedCount === drawPhaseRooms.length) {
    // All players in draw phase have submitted
    // Rotate players to next room and advance to guess phase
    game.players.forEach(player => {
      const currentRoomIndex = game.rooms.findIndex(r => r.id === player.currentRoomId);
      if (currentRoomIndex !== -1) {
        const nextRoomIndex = (currentRoomIndex + 1) % game.rooms.length;
        const nextRoom = game.rooms[nextRoomIndex];
        
        player.currentRoomId = nextRoom.id;
        nextRoom.currentPlayerId = player.id;
        nextRoom.phase = Phase.GUESS;
        nextRoom.phaseStartedAt = Date.now();
        nextRoom.phaseDuration = 20; // GUESS_DURATION
      }
    });

    // Broadcast phase change to all players
    context.broadcast.toGame(game, {
      type: 'phaseAdvanced',
      payload: { game }
    });

    console.log(`[TIMER] All drawings submitted (including auto-submit). Advancing to GUESS phase.`);
  }
}

/**
 * Handle timer expiry for Guess phase
 * Auto-submits guesses for players who haven't submitted
 */
export async function handleGuessPhaseExpiry(
  game: Game,
  room: Room,
  context: TimerContext
): Promise<void> {
  console.log(`[TIMER] Guess phase expired for room ${room.id} in game ${game.id}`);

  // Check if room already has a guess entry
  const lastEntry = room.chain[room.chain.length - 1];
  const hasGuess = lastEntry && lastEntry.type === EntryType.GUESS;
  
  if (!hasGuess && room.currentPlayerId) {
    // Auto-submit default guess
    const autoEntry: ChainEntry = {
      type: EntryType.GUESS,
      playerId: room.currentPlayerId,
      content: '[Time expired - no guess submitted]',
      timestamp: Date.now()
    };
    
    context.roomManager.addChainEntry(room, autoEntry);
    console.log(`[TIMER] Auto-submitted guess for player ${room.currentPlayerId}`);
  }

  // Count how many rooms are in guess phase and have submitted
  const guessPhaseRooms = game.rooms.filter(r => r.phase === Phase.GUESS);
  const submittedCount = guessPhaseRooms.filter(r => {
    const currentEntry = r.chain[r.chain.length - 1];
    return currentEntry && currentEntry.type === EntryType.GUESS;
  }).length;

  if (submittedCount === guessPhaseRooms.length) {
    // All players in guess phase have submitted
    
    // Check if game is complete (all players visited all rooms)
    const totalRooms = game.rooms.length;
    const gameComplete = game.rooms.some(r => r.chain.length >= totalRooms);
    
    if (gameComplete) {
      context.gameManager.endGame(game.id);
      context.broadcast.toGame(game, {
        type: 'gameEnded',
        payload: { game }
      });
      console.log(`[TIMER] Game ${game.id} completed!`);
    } else {
      // Rotate players to next room and advance to draw phase (next round)
      game.players.forEach(player => {
        const currentRoomIndex = game.rooms.findIndex(r => r.id === player.currentRoomId);
        if (currentRoomIndex !== -1) {
          const nextRoomIndex = (currentRoomIndex + 1) % game.rooms.length;
          const nextRoom = game.rooms[nextRoomIndex];
          
          player.currentRoomId = nextRoom.id;
          nextRoom.currentPlayerId = player.id;
          nextRoom.phase = Phase.DRAW;
          nextRoom.phaseStartedAt = Date.now();
          
          // Calculate draw duration: start at 60s, decrease by 10s each round, minimum 20s
          const roundNumber = Math.floor(nextRoom.chain.length / 2);
          const drawDuration = Math.max(20, 60 - (roundNumber * 10));
          nextRoom.phaseDuration = drawDuration;
        }
      });

      // Broadcast phase change to all players
      context.broadcast.toGame(game, {
        type: 'phaseAdvanced',
        payload: { game }
      });

      console.log(`[TIMER] All guesses submitted (including auto-submit). Advancing to DRAW phase.`);
    }
  }
}
