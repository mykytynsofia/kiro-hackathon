import { Game, Room, Phase, EntryType } from '@monday-painter/models';
import { GameManager } from '../managers/game-manager';
import { RoomManager } from '../managers/room-manager';
import { TimerManager } from '../managers/timer-manager';
import { BroadcastService } from '../services/broadcast.service';

interface TimerContext {
  gameManager: GameManager;
  roomManager: RoomManager;
  timerManager: TimerManager;
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
  console.log(`[TIMER] Frontend should auto-submit. Checking if all rooms have prompts...`);

  // Check if all rooms have prompts (frontend auto-submits)
  const allSubmitted = game.rooms.every(r => 
    r.chain.some(e => e.type === EntryType.PROMPT)
  );

  console.log(`[TIMER] All prompts submitted: ${allSubmitted}`);

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

    // Start timers for all rooms in DRAW phase
    game.rooms.forEach(nextRoom => {
      context.timerManager.startTimer(nextRoom.id, nextRoom.phaseDuration, async () => {
        await handleDrawPhaseExpiry(game, nextRoom, context);
      });
    });

    console.log(`[TIMER] Started ${game.rooms.length} timers for DRAW phase (durations vary by round)`);

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
  console.log(`[TIMER] Frontend should auto-submit. Checking if all rooms have drawings...`);

  // Count how many rooms are in draw phase and have submitted (frontend auto-submits)
  const drawPhaseRooms = game.rooms.filter(r => r.phase === Phase.DRAW);
  console.log(`[TIMER] Total rooms in DRAW phase: ${drawPhaseRooms.length}`);
  
  const submittedCount = drawPhaseRooms.filter(r => {
    const currentEntry = r.chain[r.chain.length - 1];
    const isDrawing = currentEntry && currentEntry.type === EntryType.DRAWING;
    console.log(`[TIMER] Room ${r.id}: chain = [${r.chain.map(e => e.type).join(', ')}], last = ${currentEntry?.type}, isDrawing = ${isDrawing}`);
    return isDrawing;
  }).length;
  
  console.log(`[TIMER] Submitted count: ${submittedCount}/${drawPhaseRooms.length}`);

  if (submittedCount === drawPhaseRooms.length && drawPhaseRooms.length > 0) {
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

    // Start timers for all rooms in GUESS phase
    game.rooms.forEach(nextRoom => {
      context.timerManager.startTimer(nextRoom.id, nextRoom.phaseDuration, async () => {
        await handleGuessPhaseExpiry(game, nextRoom, context);
      });
    });

    console.log(`[TIMER] Started ${game.rooms.length} timers for GUESS phase (${game.rooms[0].phaseDuration}s)`);

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
  console.log(`[TIMER] Frontend should auto-submit. Checking if all rooms have guesses...`);

  // Count how many rooms are in guess phase and have submitted (frontend auto-submits)
  const guessPhaseRooms = game.rooms.filter(r => r.phase === Phase.GUESS);
  const submittedCount = guessPhaseRooms.filter(r => {
    const currentEntry = r.chain[r.chain.length - 1];
    return currentEntry && currentEntry.type === EntryType.GUESS;
  }).length;
  
  console.log(`[TIMER] Submitted count: ${submittedCount}/${guessPhaseRooms.length}`);

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

      // Start timers for all rooms in DRAW phase
      game.rooms.forEach(nextRoom => {
        context.timerManager.startTimer(nextRoom.id, nextRoom.phaseDuration, async () => {
          await handleDrawPhaseExpiry(game, nextRoom, context);
        });
      });

      console.log(`[TIMER] Started ${game.rooms.length} timers for DRAW phase (durations vary by round)`);

      // Broadcast phase change to all players
      context.broadcast.toGame(game, {
        type: 'phaseAdvanced',
        payload: { game }
      });

      console.log(`[TIMER] All guesses submitted (including auto-submit). Advancing to DRAW phase.`);
    }
  }
}
