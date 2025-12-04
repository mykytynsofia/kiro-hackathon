import { HandlerContext } from '../types';
import { GameState, Phase, EntryType, ChainEntry } from '@monday-painter/models';

export async function handleDisconnect(context: HandlerContext): Promise<void> {
  const { connection, gameManager, playerManager, roomManager, broadcast } = context;
  
  console.log(`[DISCONNECT] Connection ${connection.id} closed. GameId: ${connection.gameId}, PlayerId: ${connection.playerId}`);
  
  // If player is not in a game, just clean up connection
  if (!connection.gameId || !connection.playerId) {
    console.log(`[DISCONNECT] Player not in game, skipping cleanup`);
    return;
  }

  const game = gameManager.getGame(connection.gameId);
  if (!game) {
    console.log(`[DISCONNECT] Game ${connection.gameId} not found`);
    return;
  }

  console.log(`[DISCONNECT] Player ${connection.playerId} disconnected from game ${game.id} (state: ${game.state})`);

  // Handle disconnect based on game state
  if (game.state === GameState.LOBBY) {
    console.log(`[DISCONNECT] Handling lobby disconnect. Players before: ${game.players.length}`);
    
    // Check if this is the host
    const isHost = game.hostId === connection.playerId;
    
    // In lobby: Remove player completely
    gameManager.removePlayerFromGame(game.id, connection.playerId);
    
    console.log(`[DISCONNECT] Players after removal: ${game.players.length}`);
    
    // If host left or no players left, delete the game
    if (isHost || game.players.length === 0) {
      gameManager.deleteGame(game.id);
      console.log(`[DISCONNECT] Game ${game.id} deleted (${isHost ? 'host left' : 'no players left'})`);
      
      // Notify remaining players if any
      if (game.players.length > 0) {
        broadcast.toGame(game, {
          type: 'gameDeleted',
          payload: { message: 'Host left the game' }
        });
      }
    } else {
      // Notify remaining players
      broadcast.toGame(game, {
        type: 'playerLeft',
        payload: { game }
      });
      console.log(`[DISCONNECT] Player ${connection.playerId} removed from lobby. ${game.players.length} players remaining.`);
    }
  } else if (game.state === GameState.STARTED) {
    // In game: Auto-complete their current phase
    const player = game.players.find(p => p.id === connection.playerId);
    if (!player || !player.currentRoomId) {
      return;
    }

    const room = roomManager.getRoom(game, player.currentRoomId);
    if (!room) {
      return;
    }

    // Check if player already submitted for current phase
    const lastEntry = room.chain[room.chain.length - 1];
    const alreadySubmitted = lastEntry && lastEntry.playerId === connection.playerId;

    if (!alreadySubmitted) {
      // Auto-submit based on current phase
      switch (room.phase) {
        case Phase.INPUT:
          {
            const autoEntry: ChainEntry = {
              type: EntryType.PROMPT,
              playerId: connection.playerId,
              content: '[Player disconnected]',
              timestamp: Date.now()
            };
            roomManager.addChainEntry(room, autoEntry);
            console.log(`Auto-submitted ${room.phase} for disconnected player ${connection.playerId}`);
          }
          break;
          
        case Phase.DRAW:
          {
            const autoEntry: ChainEntry = {
              type: EntryType.DRAWING,
              playerId: connection.playerId,
              drawingData: { strokes: [], width: 800, height: 600 }, // Empty drawing
              timestamp: Date.now()
            };
            roomManager.addChainEntry(room, autoEntry);
            console.log(`Auto-submitted ${room.phase} for disconnected player ${connection.playerId}`);
          }
          break;
          
        case Phase.GUESS:
          {
            const autoEntry: ChainEntry = {
              type: EntryType.GUESS,
              playerId: connection.playerId,
              content: '[Player disconnected]',
              timestamp: Date.now()
            };
            roomManager.addChainEntry(room, autoEntry);
            console.log(`Auto-submitted ${room.phase} for disconnected player ${connection.playerId}`);
          }
          break;
      }
    }

    // Mark player as disconnected
    playerManager.markPlayerDisconnected(game, connection.playerId);

    // Check if all players have now submitted (including auto-submit)
    await checkAndAdvancePhase(context, game, room);
  }
}

async function checkAndAdvancePhase(context: HandlerContext, game: any, room: any): Promise<void> {
  const { gameManager, broadcast } = context;

  // Check if all players submitted in their current phase
  if (room.phase === Phase.INPUT) {
    const allSubmitted = game.rooms.every((r: any) => 
      r.chain.some((e: any) => e.type === EntryType.PROMPT)
    );

    if (allSubmitted) {
      // Rotate players and advance to DRAW
      game.players.forEach((player: any, playerIndex: number) => {
        const nextRoomIndex = (playerIndex + 1) % game.rooms.length;
        const nextRoom = game.rooms[nextRoomIndex];
        player.currentRoomId = nextRoom.id;
        nextRoom.currentPlayerId = player.id;
        nextRoom.phase = Phase.DRAW;
        nextRoom.phaseStartedAt = Date.now();
        nextRoom.phaseDuration = 90;
      });

      broadcast.toGame(game, {
        type: 'phaseAdvanced',
        payload: { game }
      });
      console.log(`All players submitted prompts (including disconnected). Advancing to DRAW phase.`);
    }
  } else if (room.phase === Phase.DRAW) {
    const drawPhaseRooms = game.rooms.filter((r: any) => r.phase === Phase.DRAW);
    const submittedCount = drawPhaseRooms.filter((r: any) => {
      const currentEntry = r.chain[r.chain.length - 1];
      return currentEntry && currentEntry.type === EntryType.DRAWING;
    }).length;

    if (submittedCount === drawPhaseRooms.length) {
      // Rotate players and advance to GUESS
      game.players.forEach((player: any) => {
        const currentRoomIndex = game.rooms.findIndex((r: any) => r.id === player.currentRoomId);
        if (currentRoomIndex !== -1) {
          const nextRoomIndex = (currentRoomIndex + 1) % game.rooms.length;
          const nextRoom = game.rooms[nextRoomIndex];
          player.currentRoomId = nextRoom.id;
          nextRoom.currentPlayerId = player.id;
          nextRoom.phase = Phase.GUESS;
          nextRoom.phaseStartedAt = Date.now();
          nextRoom.phaseDuration = 45;
        }
      });

      broadcast.toGame(game, {
        type: 'phaseAdvanced',
        payload: { game }
      });
      console.log(`All players submitted drawings (including disconnected). Advancing to GUESS phase.`);
    }
  } else if (room.phase === Phase.GUESS) {
    const guessPhaseRooms = game.rooms.filter((r: any) => r.phase === Phase.GUESS);
    const submittedCount = guessPhaseRooms.filter((r: any) => {
      const currentEntry = r.chain[r.chain.length - 1];
      return currentEntry && currentEntry.type === EntryType.GUESS;
    }).length;

    if (submittedCount === guessPhaseRooms.length) {
      // Check if game is complete
      const totalRooms = game.rooms.length;
      const gameComplete = game.rooms.some((r: any) => r.chain.length >= totalRooms);

      if (gameComplete) {
        gameManager.endGame(game.id);
        broadcast.toGame(game, {
          type: 'gameEnded',
          payload: { game }
        });
        console.log(`Game ${game.id} completed (including disconnected players).`);
      } else {
        // Rotate players and advance to next DRAW phase
        game.players.forEach((player: any) => {
          const currentRoomIndex = game.rooms.findIndex((r: any) => r.id === player.currentRoomId);
          if (currentRoomIndex !== -1) {
            const nextRoomIndex = (currentRoomIndex + 1) % game.rooms.length;
            const nextRoom = game.rooms[nextRoomIndex];
            player.currentRoomId = nextRoom.id;
            nextRoom.currentPlayerId = player.id;
            nextRoom.phase = Phase.DRAW;
            nextRoom.phaseStartedAt = Date.now();
            nextRoom.phaseDuration = 90;
          }
        });

        broadcast.toGame(game, {
          type: 'phaseAdvanced',
          payload: { game }
        });
        console.log(`All players submitted guesses (including disconnected). Advancing to DRAW phase.`);
      }
    }
  }
}
