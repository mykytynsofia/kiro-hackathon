import { Game, Room, ChainEntry, Phase } from '@monday-painter/models';
import { DRAW_DURATION, GUESS_DURATION } from '@monday-painter/models';

/**
 * Manages room state and phase transitions
 */
export class RoomManager {
  /**
   * Advance room to next phase
   */
  advancePhase(room: Room, nextPlayerId: string): Room {
    // Determine next phase
    let nextPhase: Phase;
    let phaseDuration: number;

    if (room.phase === Phase.INPUT) {
      nextPhase = Phase.DRAW;
      phaseDuration = DRAW_DURATION;
    } else if (room.phase === Phase.DRAW) {
      nextPhase = Phase.GUESS;
      phaseDuration = GUESS_DURATION;
    } else {
      // GUESS -> DRAW
      nextPhase = Phase.DRAW;
      phaseDuration = DRAW_DURATION;
    }

    room.phase = nextPhase;
    room.currentPlayerId = nextPlayerId;
    room.phaseStartedAt = Date.now();
    room.phaseDuration = phaseDuration;

    return room;
  }

  /**
   * Add chain entry to room
   */
  addChainEntry(room: Room, entry: ChainEntry): void {
    room.chain.push(entry);
  }

  /**
   * Get next player ID in cyclic order
   */
  getNextPlayerId(game: Game, currentPlayerId: string): string {
    const currentIndex = game.players.findIndex(p => p.id === currentPlayerId);
    const nextIndex = (currentIndex + 1) % game.players.length;
    return game.players[nextIndex].id;
  }

  /**
   * Get next room index in cyclic order
   */
  getNextRoomIndex(currentIndex: number, totalRooms: number): number {
    return (currentIndex + 1) % totalRooms;
  }

  /**
   * Assign player to room
   */
  assignPlayerToRoom(game: Game, playerId: string, roomIndex: number): void {
    const player = game.players.find(p => p.id === playerId);
    const room = game.rooms[roomIndex];

    if (player && room) {
      player.currentRoomId = room.id;
      room.currentPlayerId = playerId;
    }
  }

  /**
   * Check if game is complete (all players visited all rooms)
   */
  checkGameComplete(game: Game): boolean {
    // Each room should have entries from all players
    const expectedEntries = game.players.length;

    for (const room of game.rooms) {
      if (room.chain.length < expectedEntries) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get room by ID
   */
  getRoom(game: Game, roomId: string): Room | undefined {
    return game.rooms.find(r => r.id === roomId);
  }

  /**
   * Get room by player ID
   */
  getRoomByPlayerId(game: Game, playerId: string): Room | undefined {
    const player = game.players.find(p => p.id === playerId);
    if (!player || !player.currentRoomId) return undefined;
    return this.getRoom(game, player.currentRoomId);
  }
}
