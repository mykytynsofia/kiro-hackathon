import { HandlerContext } from '../types';
import { handleInputPhaseExpiry } from './timer-expiry.handler';

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

    // Start timers for all rooms (they all start in INPUT phase)
    game.rooms.forEach(room => {
      context.timerManager.startTimer(room.id, room.phaseDuration, async () => {
        await handleInputPhaseExpiry(game, room, {
          gameManager: context.gameManager,
          roomManager: context.roomManager,
          broadcast: context.broadcast
        });
      });
    });

    console.log(`[TIMER] Started ${game.rooms.length} timers for INPUT phase (${game.rooms[0].phaseDuration}s)`);

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
