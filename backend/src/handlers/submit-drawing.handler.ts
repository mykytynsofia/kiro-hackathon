import { HandlerContext } from '../types';
import { EntryType, Phase } from '@monday-painter/models';
import { handleGuessPhaseExpiry } from './timer-expiry.handler';

export async function handleSubmitDrawing(context: HandlerContext): Promise<void> {
  const { drawingData } = context.message.payload;
  const game = context.gameManager.getGame(context.connection.gameId!);
  
  if (!game) {
    const errorMsg = JSON.stringify({
      type: 'error',
      payload: { message: 'Game not found' }
    });
    context.connection.ws.send(errorMsg);
    return;
  }

  const room = context.roomManager.getRoomByPlayerId(game, context.connection.playerId!);
  
  if (!room || room.phase !== Phase.DRAW) {
    const errorMsg = JSON.stringify({
      type: 'error',
      payload: { message: 'Not in draw phase' }
    });
    context.connection.ws.send(errorMsg);
    return;
  }

  // Add entry to room chain
  const entry = {
    type: EntryType.DRAWING,
    playerId: context.connection.playerId!,
    content: drawingData,
    timestamp: Date.now()
  };

  context.roomManager.addChainEntry(room, entry);
  
  // Cancel timer for this room
  context.timerManager.cancelTimer(room.id);
  
  // Send confirmation to player
  const confirmMsg = JSON.stringify({
    type: 'drawingSubmitted',
    payload: { success: true }
  });
  context.connection.ws.send(confirmMsg);

  // Count how many rooms are in draw phase and have submitted
  const drawPhaseRooms = game.rooms.filter(r => r.phase === Phase.DRAW);
  const submittedCount = drawPhaseRooms.filter(r => {
    // Check if this room has a drawing entry from current player
    const currentEntry = r.chain[r.chain.length - 1];
    return currentEntry && currentEntry.type === EntryType.DRAWING;
  }).length;

  if (submittedCount === drawPhaseRooms.length) {
    // All players in draw phase have submitted
    // Rotate players to next room and advance to guess phase
    game.players.forEach(player => {
      // Find current room index
      const currentRoomIndex = game.rooms.findIndex(r => r.id === player.currentRoomId);
      if (currentRoomIndex !== -1) {
        // Move player to next room (rotate right)
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
        await handleGuessPhaseExpiry(game, nextRoom, {
          gameManager: context.gameManager,
          roomManager: context.roomManager,
          broadcast: context.broadcast
        });
      });
    });

    console.log(`[TIMER] Started ${game.rooms.length} timers for GUESS phase (${game.rooms[0].phaseDuration}s)`);

    // Broadcast phase change to all players
    context.broadcast.toGame(game, {
      type: 'phaseAdvanced',
      payload: { game }
    });

    console.log(`All players submitted drawings. Players rotated to next rooms. Advancing to GUESS phase in game ${game.id}`);
  } else {
    console.log(`Player ${context.connection.playerId} submitted drawing. Waiting for others... (${submittedCount}/${drawPhaseRooms.length})`);
  }
}
