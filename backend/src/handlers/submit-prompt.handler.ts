import { HandlerContext } from '../types';
import { EntryType, Phase } from '@monday-painter/models';
import { handleDrawPhaseExpiry } from './timer-expiry.handler';

export async function handleSubmitPrompt(context: HandlerContext): Promise<void> {
  const { prompt } = context.message.payload;
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
  
  if (!room || room.phase !== Phase.INPUT) {
    const errorMsg = JSON.stringify({
      type: 'error',
      payload: { message: 'Not in input phase' }
    });
    context.connection.ws.send(errorMsg);
    return;
  }

  // Validate prompt
  if (!prompt || prompt.trim().length < 3 || prompt.trim().length > 100) {
    const errorMsg = JSON.stringify({
      type: 'error',
      payload: { message: 'Prompt must be between 3 and 100 characters' }
    });
    context.connection.ws.send(errorMsg);
    return;
  }

  // Add entry to room chain
  const entry = {
    type: EntryType.PROMPT,
    playerId: context.connection.playerId!,
    content: prompt.trim(),
    timestamp: Date.now()
  };

  context.roomManager.addChainEntry(room, entry);
  
  // Cancel timer for this room
  context.timerManager.cancelTimer(room.id);
  
  // Send confirmation to player
  const confirmMsg = JSON.stringify({
    type: 'promptSubmitted',
    payload: { success: true }
  });
  context.connection.ws.send(confirmMsg);

  // Check if all players have submitted in their rooms
  const allSubmitted = game.rooms.every(r => {
    // Check if this room has a prompt entry
    return r.chain.some(e => e.type === EntryType.PROMPT);
  });

  if (allSubmitted) {
    // Rotate players to next room and advance to draw phase
    game.players.forEach((player, playerIndex) => {
      // Move player to next room (rotate right)
      const nextRoomIndex = (playerIndex + 1) % game.rooms.length;
      const nextRoom = game.rooms[nextRoomIndex];
      
      player.currentRoomId = nextRoom.id;
      nextRoom.currentPlayerId = player.id;
      nextRoom.phase = Phase.DRAW;
      nextRoom.phaseStartedAt = Date.now();
      
      // Calculate draw duration: start at 60s, decrease by 10s each round, minimum 20s
      // Count how many entries are already in the chain to determine round number
      const roundNumber = Math.floor(nextRoom.chain.length / 2); // 0, 1, 2, 3...
      const drawDuration = Math.max(20, 60 - (roundNumber * 10));
      nextRoom.phaseDuration = drawDuration;
    });

    // Start timers for all rooms in DRAW phase
    game.rooms.forEach(nextRoom => {
      context.timerManager.startTimer(nextRoom.id, nextRoom.phaseDuration, async () => {
        await handleDrawPhaseExpiry(game, nextRoom, {
          gameManager: context.gameManager,
          roomManager: context.roomManager,
          broadcast: context.broadcast
        });
      });
    });

    console.log(`[TIMER] Started ${game.rooms.length} timers for DRAW phase (durations vary by round)`);

    // Broadcast phase change to all players
    context.broadcast.toGame(game, {
      type: 'phaseAdvanced',
      payload: { game }
    });

    console.log(`All players submitted prompts. Players rotated to next rooms. Advancing to DRAW phase in game ${game.id}`);
  } else {
    console.log(`Player ${context.connection.playerId} submitted prompt. Waiting for others...`);
  }
}
