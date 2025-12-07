import { HandlerContext } from '../types';

export async function handleUpdatePlayerIcon(context: HandlerContext): Promise<void> {
  const { icon } = context.message.payload;
  const game = context.gameManager.getGame(context.connection.gameId!);
  
  if (!game) {
    context.broadcast.toPlayer(context.connection.playerId!, {
      type: 'error',
      payload: { message: 'Game not found' }
    });
    return;
  }

  // Find and update player icon
  const player = game.players.find(p => p.id === context.connection.playerId);
  if (player) {
    player.icon = icon;
    console.log(`[ICON] Player ${player.displayName} selected icon: ${icon}`);
    
    // Broadcast updated game state to all players
    context.broadcast.toGame(game, {
      type: 'gameStateUpdate',
      payload: { game, playerId: context.connection.playerId }
    });
  }
}
