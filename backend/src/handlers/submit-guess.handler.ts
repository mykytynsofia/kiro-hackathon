import { HandlerContext } from '../types';
import { EntryType, Phase } from '@monday-painter/models';

export async function handleSubmitGuess(context: HandlerContext): Promise<void> {
  const { guess } = context.message.payload;
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
  
  if (!room || room.phase !== Phase.GUESS) {
    const errorMsg = JSON.stringify({
      type: 'error',
      payload: { message: 'Not in guess phase' }
    });
    context.connection.ws.send(errorMsg);
    return;
  }

  // Validate guess
  if (!guess || guess.trim().length < 3 || guess.trim().length > 100) {
    const errorMsg = JSON.stringify({
      type: 'error',
      payload: { message: 'Guess must be between 3 and 100 characters' }
    });
    context.connection.ws.send(errorMsg);
    return;
  }

  // Add entry to room chain
  const entry = {
    type: EntryType.GUESS,
    playerId: context.connection.playerId!,
    content: guess.trim(),
    timestamp: Date.now()
  };

  context.roomManager.addChainEntry(room, entry);

  // Send confirmation to player
  const confirmMsg = JSON.stringify({
    type: 'guessSubmitted',
    payload: { success: true }
  });
  context.connection.ws.send(confirmMsg);

  // Count how many rooms are in guess phase and have submitted
  const guessPhaseRooms = game.rooms.filter(r => r.phase === Phase.GUESS);
  const submittedCount = guessPhaseRooms.filter(r => {
    // Check if this room has a guess entry from current player
    const currentEntry = r.chain[r.chain.length - 1];
    return currentEntry && currentEntry.type === EntryType.GUESS;
  }).length;

  if (submittedCount === guessPhaseRooms.length) {
    // All players in guess phase have submitted
    
    // Check if game is complete (all players visited all rooms)
    // Each player should have visited all rooms once
    const totalRooms = game.rooms.length;
    const maxEntriesPerRoom = totalRooms; // Each room gets visited by each player once
    
    // Check if any room has reached max entries
    const gameComplete = game.rooms.some(r => r.chain.length >= maxEntriesPerRoom);
    
    if (gameComplete) {
      context.gameManager.endGame(game.id);
      context.broadcast.toGame(game, {
        type: 'gameEnded',
        payload: { game }
      });
      console.log(`Game ${game.id} completed!`);
    } else {
      // Rotate players to next room and advance to draw phase (next round)
      game.players.forEach(player => {
        // Find current room index
        const currentRoomIndex = game.rooms.findIndex(r => r.id === player.currentRoomId);
        if (currentRoomIndex !== -1) {
          // Move player to next room (rotate right)
          const nextRoomIndex = (currentRoomIndex + 1) % game.rooms.length;
          const nextRoom = game.rooms[nextRoomIndex];
          
          player.currentRoomId = nextRoom.id;
          nextRoom.currentPlayerId = player.id;
          nextRoom.phase = Phase.DRAW;
          nextRoom.phaseStartedAt = Date.now();
          nextRoom.phaseDuration = 90; // DRAW_DURATION
        }
      });

      // Broadcast phase change to all players
      context.broadcast.toGame(game, {
        type: 'phaseAdvanced',
        payload: { game }
      });

      console.log(`All players submitted guesses. Players rotated to next rooms. Advancing to DRAW phase in game ${game.id}`);
    }
  } else {
    console.log(`Player ${context.connection.playerId} submitted guess. Waiting for others... (${submittedCount}/${guessPhaseRooms.length})`);
  }
}
