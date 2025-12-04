import { HandlerContext } from '../types';

/**
 * Handle get game list request
 */
export async function handleGetGameList(context: HandlerContext): Promise<void> {
  const { gameManager, connection } = context;

  try {
    // Get all active games (in lobby or started state)
    const games = gameManager.getAllGames();

    // Send game list to requesting client
    const message = JSON.stringify({
      type: 'gameList',
      payload: { games }
    });
    connection.ws.send(message);
  } catch (error) {
    console.error('Error getting game list:', error);
    const errorMessage = JSON.stringify({
      type: 'error',
      payload: { message: 'Failed to get game list' }
    });
    connection.ws.send(errorMessage);
  }
}
