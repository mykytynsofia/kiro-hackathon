import { Game, Room, Phase, EntryType, GameState, Player } from '@monday-painter/models';
import { handleInputPhaseExpiry, handleDrawPhaseExpiry, handleGuessPhaseExpiry } from '../timer-expiry.handler';
import { GameManager } from '../../managers/game-manager';
import { RoomManager } from '../../managers/room-manager';
import { TimerManager } from '../../managers/timer-manager';
import { BroadcastService } from '../../services/broadcast.service';

describe('Timer Expiry Handlers', () => {
  let gameManager: GameManager;
  let roomManager: RoomManager;
  let timerManager: TimerManager;
  let broadcast: BroadcastService;
  let game: Game;

  beforeEach(() => {
    gameManager = new GameManager();
    roomManager = new RoomManager();
    timerManager = new TimerManager();
    broadcast = {
      toGame: jest.fn(),
      toPlayer: jest.fn(),
      toRoom: jest.fn()
    } as any;

    // Create a test game with 3 players
    const players: Player[] = [
      { id: 'player1', displayName: 'Player 1', currentRoomId: null },
      { id: 'player2', displayName: 'Player 2', currentRoomId: null },
      { id: 'player3', displayName: 'Player 3', currentRoomId: null }
    ];

    const rooms: Room[] = [
      {
        id: 'room1',
        index: 0,
        phase: Phase.INPUT,
        currentPlayerId: 'player1',
        chain: [],
        phaseStartedAt: Date.now(),
        phaseDuration: 20
      },
      {
        id: 'room2',
        index: 1,
        phase: Phase.INPUT,
        currentPlayerId: 'player2',
        chain: [],
        phaseStartedAt: Date.now(),
        phaseDuration: 20
      },
      {
        id: 'room3',
        index: 2,
        phase: Phase.INPUT,
        currentPlayerId: 'player3',
        chain: [],
        phaseStartedAt: Date.now(),
        phaseDuration: 20
      }
    ];

    players[0].currentRoomId = rooms[0].id;
    players[1].currentRoomId = rooms[1].id;
    players[2].currentRoomId = rooms[2].id;

    game = {
      id: 'test-game',
      state: GameState.STARTED,
      hostId: 'player1',
      players,
      rooms,
      maxPlayers: 3,
      createdAt: Date.now()
    };

    // Add game to manager
    (gameManager as any).games.set(game.id, game);
  });

  describe('handleDrawPhaseExpiry', () => {
    it('should auto-submit empty drawing when timer expires without manual submit', async () => {
      // Setup: Room has a prompt, player hasn't drawn yet
      game.rooms[0].phase = Phase.DRAW;
      game.rooms[0].chain = [
        {
          type: EntryType.PROMPT,
          playerId: 'player1',
          content: 'Draw a cat',
          timestamp: Date.now()
        }
      ];

      const context = {
        gameManager,
        roomManager,
        timerManager,
        broadcast
      };

      // Act: Timer expires
      await handleDrawPhaseExpiry(game, game.rooms[0], context);

      // Assert: Empty drawing should be auto-submitted
      expect(game.rooms[0].chain.length).toBe(2);
      expect(game.rooms[0].chain[1].type).toBe(EntryType.DRAWING);
      expect(game.rooms[0].chain[1].playerId).toBe('player1');
      expect(game.rooms[0].chain[1].content).toEqual({
        strokes: [],
        width: 800,
        height: 600
      });
    });

    it('should not auto-submit if drawing already submitted', async () => {
      // Setup: Room has a prompt and a drawing
      game.rooms[0].phase = Phase.DRAW;
      game.rooms[0].chain = [
        {
          type: EntryType.PROMPT,
          playerId: 'player1',
          content: 'Draw a cat',
          timestamp: Date.now()
        },
        {
          type: EntryType.DRAWING,
          playerId: 'player1',
          content: { strokes: [{ points: [], color: '#000', width: 3, tool: 'brush' as any }], width: 800, height: 600 },
          timestamp: Date.now()
        }
      ];

      const context = {
        gameManager,
        roomManager,
        timerManager,
        broadcast
      };

      // Act: Timer expires
      await handleDrawPhaseExpiry(game, game.rooms[0], context);

      // Assert: No additional drawing should be added
      expect(game.rooms[0].chain.length).toBe(2);
    });

    it('should advance to GUESS phase when all players drawings submitted (including auto-submit)', async () => {
      // Setup: All rooms in DRAW phase with prompts
      game.rooms.forEach((room, index) => {
        room.phase = Phase.DRAW;
        room.chain = [
          {
            type: EntryType.PROMPT,
            playerId: game.players[index].id,
            content: `Prompt ${index}`,
            timestamp: Date.now()
          }
        ];
      });

      const context = {
        gameManager,
        roomManager,
        timerManager,
        broadcast
      };

      // Act: Timer expires for all rooms (simulate)
      for (const room of game.rooms) {
        await handleDrawPhaseExpiry(game, room, context);
      }

      // Assert: All rooms should have drawings
      game.rooms.forEach(room => {
        expect(room.chain.length).toBe(2);
        expect(room.chain[1].type).toBe(EntryType.DRAWING);
      });

      // Assert: Should advance to GUESS phase
      game.rooms.forEach(room => {
        expect(room.phase).toBe(Phase.GUESS);
      });

      // Assert: Should broadcast phase change
      expect(broadcast.toGame).toHaveBeenCalled();
    });
  });

  describe('handleInputPhaseExpiry', () => {
    it('should auto-submit prompt when timer expires', async () => {
      const context = {
        gameManager,
        roomManager,
        timerManager,
        broadcast
      };

      // Act: Timer expires for all rooms
      for (const room of game.rooms) {
        await handleInputPhaseExpiry(game, room, context);
      }

      // Assert: All rooms should have prompts
      game.rooms.forEach(room => {
        expect(room.chain.length).toBe(1);
        expect(room.chain[0].type).toBe(EntryType.PROMPT);
        expect(room.chain[0].content).toBe('[Time expired - no prompt submitted]');
      });

      // Assert: Should advance to DRAW phase
      game.rooms.forEach(room => {
        expect(room.phase).toBe(Phase.DRAW);
      });
    });
  });

  describe('handleGuessPhaseExpiry', () => {
    it('should auto-submit guess when timer expires', async () => {
      // Setup: Rooms in GUESS phase with prompt and drawing
      game.rooms.forEach((room, index) => {
        room.phase = Phase.GUESS;
        room.chain = [
          {
            type: EntryType.PROMPT,
            playerId: game.players[index].id,
            content: `Prompt ${index}`,
            timestamp: Date.now()
          },
          {
            type: EntryType.DRAWING,
            playerId: game.players[index].id,
            content: { strokes: [], width: 800, height: 600 },
            timestamp: Date.now()
          }
        ];
      });

      const context = {
        gameManager,
        roomManager,
        timerManager,
        broadcast
      };

      // Act: Timer expires for all rooms
      for (const room of game.rooms) {
        await handleGuessPhaseExpiry(game, room, context);
      }

      // Assert: All rooms should have guesses
      game.rooms.forEach(room => {
        expect(room.chain.length).toBe(3);
        expect(room.chain[2].type).toBe(EntryType.GUESS);
        expect(room.chain[2].content).toBe('[Time expired - no guess submitted]');
      });
    });
  });
});
