import { HandlerContext } from '../types';

export async function handleCreateGame(context: HandlerContext): Promise<void> {
  const { displayName, maxPlayers, gameName } = context.message.payload;

  // Create player
  const player = context.playerManager.createPlayer(displayName);

  // Create game
  const game = context.gameManager.createGame(player.id, {
    maxPlayers: maxPlayers || 6,
    name: gameName
  });

  // Add player to game
  context.gameManager.addPlayerToGame(game.id, player);

  // Associate connection
  context.connection.playerId = player.id;
  context.connection.gameId = game.id;
  context.connectionManager.associatePlayer(context.connection.id, player.id, game.id);

  // Broadcast updated game list
  context.broadcast.toAllConnections({
    type: 'gameListUpdate',
    payload: { games: context.gameManager.getActiveGames() }
  });

  // Send success response with playerId
  const successMsg = JSON.stringify({
    type: 'gameCreated',
    payload: { game, playerId: player.id }
  });
  context.connection.ws.send(successMsg);

  console.log(`Player ${displayName} (${player.id}) created game ${game.id}`);
}
