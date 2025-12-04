import { HandlerContext } from '../types';
import { GameState } from '@monday-painter/models';

export async function handleLeaveGame(context: HandlerContext): Promise<void> {
  const game = context.gameManager.getGame(context.connection.gameId!);
  
  if (!game) return;

  if (game.state === GameState.LOBBY) {
    context.gameManager.removePlayerFromGame(game.id, context.connection.playerId!);
    
    if (game.players.length === 0) {
      context.gameManager.deleteGame(game.id);
    } else {
      context.broadcast.toGame(game, {
        type: 'playerLeft',
        payload: { game }
      });
    }
  } else {
    context.playerManager.markPlayerDisconnected(game, context.connection.playerId!);
  }

  context.connection.playerId = null;
  context.connection.gameId = null;

  context.broadcast.toPlayer(context.connection.playerId!, {
    type: 'leftGame',
    payload: {}
  });
}
