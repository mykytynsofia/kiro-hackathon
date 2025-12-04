import { HandlerContext } from '../types';

export async function handleStartGame(context: HandlerContext): Promise<void> {
  const game = context.gameManager.getGame(context.connection.gameId!);
  
  if (!game) {
    context.broadcast.toPlayer(context.connection.playerId!, {
      type: 'error',
      payload: { message: 'Game not found' }
    });
    return;
  }

  if (game.hostId !== context.connection.playerId) {
    context.broadcast.toPlayer(context.connection.playerId!, {
      type: 'error',
      payload: { message: 'Only host can start the game' }
    });
    return;
  }

  try {
    context.gameManager.startGame(game.id);

    context.broadcast.toGame(game, {
      type: 'gameStarted',
      payload: { game }
    });
  } catch (error) {
    context.broadcast.toPlayer(context.connection.playerId!, {
      type: 'error',
      payload: { message: error instanceof Error ? error.message : 'Failed to start game' }
    });
  }
}
