import { HandlerContext } from '../types';
import { EntryType, Phase } from '@monday-painter/models';

export async function handleSubmitGuess(context: HandlerContext): Promise<void> {
  const { guess } = context.message.payload;
  const game = context.gameManager.getGame(context.connection.gameId!);
  
  if (!game) return;

  const room = context.roomManager.getRoomByPlayerId(game, context.connection.playerId!);
  
  if (!room || room.phase !== Phase.GUESS) {
    context.broadcast.toPlayer(context.connection.playerId!, {
      type: 'error',
      payload: { message: 'Not in guess phase' }
    });
    return;
  }

  const entry = {
    type: EntryType.GUESS,
    playerId: context.connection.playerId!,
    content: guess,
    timestamp: Date.now()
  };

  context.roomManager.addChainEntry(room, entry);

  // Check if game is complete
  if (context.roomManager.checkGameComplete(game)) {
    context.gameManager.endGame(game.id);
    context.broadcast.toGame(game, {
      type: 'gameEnded',
      payload: { game }
    });
  } else {
    const nextPlayerId = context.roomManager.getNextPlayerId(game, context.connection.playerId!);
    context.roomManager.advancePhase(room, nextPlayerId);

    context.broadcast.toGame(game, {
      type: 'phaseAdvanced',
      payload: { room, game }
    });
  }
}
