import { HandlerContext } from '../types';
import { GameState } from '@monday-painter/models';

export async function handleJoinGame(context: HandlerContext): Promise<void> {
  const { gameId, displayName } = context.message.payload;

  // Validate input
  if (!gameId || !displayName) {
    const errorMsg = JSON.stringify({
      type: 'error',
      payload: { message: 'Game ID and display name are required' }
    });
    context.connection.ws.send(errorMsg);
    return;
  }

  const game = context.gameManager.getGame(gameId);
  if (!game) {
    const errorMsg = JSON.stringify({
      type: 'error',
      payload: { message: 'Game not found' }
    });
    context.connection.ws.send(errorMsg);
    return;
  }

  if (game.state !== GameState.LOBBY) {
    const errorMsg = JSON.stringify({
      type: 'error',
      payload: { message: 'Game already started' }
    });
    context.connection.ws.send(errorMsg);
    return;
  }

  if (game.players.length >= game.maxPlayers) {
    const errorMsg = JSON.stringify({
      type: 'error',
      payload: { message: 'Game is full' }
    });
    context.connection.ws.send(errorMsg);
    return;
  }

  const player = context.playerManager.createPlayer(displayName);
  
  try {
    context.gameManager.addPlayerToGame(gameId, player);
    
    // Associate connection with player and game
    context.connection.playerId = player.id;
    context.connection.gameId = gameId;
    context.connectionManager.associatePlayer(context.connection.id, player.id, gameId);

    // Notify all players in game about new player
    context.broadcast.toGame(game, {
      type: 'playerJoined',
      payload: { player, game }
    });

    // Send success response to joining player with full game state
    const successMsg = JSON.stringify({
      type: 'gameJoined',
      payload: { game, playerId: player.id }
    });
    context.connection.ws.send(successMsg);

    console.log(`Player ${displayName} (${player.id}) joined game ${gameId}`);
  } catch (error) {
    const errorMsg = JSON.stringify({
      type: 'error',
      payload: { message: error instanceof Error ? error.message : 'Failed to join game' }
    });
    context.connection.ws.send(errorMsg);
  }
}
