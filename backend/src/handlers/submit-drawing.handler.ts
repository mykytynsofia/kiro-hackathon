import { HandlerContext } from '../types';
import { EntryType, Phase } from '@monday-painter/models';

export async function handleSubmitDrawing(context: HandlerContext): Promise<void> {
  const { drawingData } = context.message.payload;
  const game = context.gameManager.getGame(context.connection.gameId!);
  
  if (!game) return;

  const room = context.roomManager.getRoomByPlayerId(game, context.connection.playerId!);
  
  if (!room || room.phase !== Phase.DRAW) {
    context.broadcast.toPlayer(context.connection.playerId!, {
      type: 'error',
      payload: { message: 'Not in draw phase' }
    });
    return;
  }

  const entry = {
    type: EntryType.DRAWING,
    playerId: context.connection.playerId!,
    drawingData,
    timestamp: Date.now()
  };

  context.roomManager.addChainEntry(room, entry);
  
  const nextPlayerId = context.roomManager.getNextPlayerId(game, context.connection.playerId!);
  context.roomManager.advancePhase(room, nextPlayerId);

  context.broadcast.toGame(game, {
    type: 'phaseAdvanced',
    payload: { room, game }
  });
}
