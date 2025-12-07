// Manual test to verify timer auto-submit behavior
const { Phase, EntryType, GameState } = require('../models/dist');

// Simulate game state
const game = {
  id: 'test-game',
  state: GameState.STARTED,
  hostId: 'player1',
  players: [
    { id: 'player1', displayName: 'Player 1', currentRoomId: 'room1' },
    { id: 'player2', displayName: 'Player 2', currentRoomId: 'room2' },
    { id: 'player3', displayName: 'Player 3', currentRoomId: 'room3' }
  ],
  rooms: [
    {
      id: 'room1',
      index: 0,
      phase: Phase.DRAW,
      currentPlayerId: 'player2', // Player 2 is now in room 1 (rotated)
      chain: [
        {
          type: EntryType.PROMPT,
          playerId: 'player1',
          content: 'Draw a cat',
          timestamp: Date.now()
        }
      ],
      phaseStartedAt: Date.now(),
      phaseDuration: 60
    },
    {
      id: 'room2',
      index: 1,
      phase: Phase.DRAW,
      currentPlayerId: 'player3', // Player 3 is now in room 2 (rotated)
      chain: [
        {
          type: EntryType.PROMPT,
          playerId: 'player2',
          content: 'Draw a dog',
          timestamp: Date.now()
        }
      ],
      phaseStartedAt: Date.now(),
      phaseDuration: 60
    },
    {
      id: 'room3',
      index: 2,
      phase: Phase.DRAW,
      currentPlayerId: 'player1', // Player 1 is now in room 3 (rotated)
      chain: [
        {
          type: EntryType.PROMPT,
          playerId: 'player3',
          content: 'Draw a bird',
          timestamp: Date.now()
        }
      ],
      phaseStartedAt: Date.now(),
      phaseDuration: 60
    }
  ],
  maxPlayers: 3,
  createdAt: Date.now()
};

console.log('=== INITIAL STATE ===');
console.log('Game has', game.rooms.length, 'rooms');
game.rooms.forEach(room => {
  console.log(`Room ${room.id}:`);
  console.log(`  - Phase: ${room.phase}`);
  console.log(`  - Current Player: ${room.currentPlayerId}`);
  console.log(`  - Chain:`, room.chain.map(e => `${e.type} by ${e.playerId}`));
});

console.log('\n=== SIMULATING TIMER EXPIRY ===');

// Simulate timer expiry for each room
game.rooms.forEach(room => {
  console.log(`\nTimer expired for room ${room.id}`);
  
  const lastEntry = room.chain[room.chain.length - 1];
  const hasDrawing = lastEntry && lastEntry.type === EntryType.DRAWING;
  
  console.log(`  Last entry type: ${lastEntry?.type}`);
  console.log(`  Has drawing: ${hasDrawing}`);
  
  if (!hasDrawing && room.currentPlayerId) {
    const autoEntry = {
      type: EntryType.DRAWING,
      playerId: room.currentPlayerId,
      content: { strokes: [], width: 800, height: 600 },
      timestamp: Date.now()
    };
    
    room.chain.push(autoEntry);
    console.log(`  ✓ Auto-submitted empty drawing for player ${room.currentPlayerId}`);
  }
});

console.log('\n=== AFTER AUTO-SUBMIT ===');
game.rooms.forEach(room => {
  console.log(`Room ${room.id}:`);
  console.log(`  - Chain:`, room.chain.map(e => `${e.type} by ${e.playerId}`));
});

console.log('\n=== CHECKING IF ALL SUBMITTED ===');
const drawPhaseRooms = game.rooms.filter(r => r.phase === Phase.DRAW);
console.log(`Rooms in DRAW phase: ${drawPhaseRooms.length}`);

const submittedCount = drawPhaseRooms.filter(r => {
  const currentEntry = r.chain[r.chain.length - 1];
  const isDrawing = currentEntry && currentEntry.type === EntryType.DRAWING;
  console.log(`  Room ${r.id}: last entry = ${currentEntry?.type}, isDrawing = ${isDrawing}`);
  return isDrawing;
}).length;

console.log(`Submitted: ${submittedCount}/${drawPhaseRooms.length}`);

if (submittedCount === drawPhaseRooms.length) {
  console.log('\n✓ All rooms have submitted! Should advance to GUESS phase.');
} else {
  console.log('\n✗ Not all rooms have submitted. Game will wait.');
}
