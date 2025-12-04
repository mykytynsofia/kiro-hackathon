# Design Document

## Overview

The Monday Painter backend is a Node.js/TypeScript server that implements the game logic for the multiplayer drawing game. It uses the `ws` library for WebSocket connections and imports shared data models from the monday-painter-models package. The architecture separates concerns into managers (game, room, player, timer) and message handlers, enabling clean separation of business logic and communication.

## Architecture

### Module Structure

```
backend/
├── src/
│   ├── server.ts              # Main server entry point
│   ├── websocket/
│   │   ├── connection-manager.ts
│   │   ├── message-router.ts
│   │   └── heartbeat.ts
│   ├── managers/
│   │   ├── game-manager.ts
│   │   ├── room-manager.ts
│   │   ├── player-manager.ts
│   │   └── timer-manager.ts
│   ├── handlers/
│   │   ├── create-game.handler.ts
│   │   ├── join-game.handler.ts
│   │   ├── start-game.handler.ts
│   │   ├── submit-prompt.handler.ts
│   │   ├── submit-drawing.handler.ts
│   │   ├── submit-guess.handler.ts
│   │   └── leave-game.handler.ts
│   ├── services/
│   │   ├── state-sync.service.ts
│   │   ├── broadcast.service.ts
│   │   └── validation.service.ts
│   ├── types/
│   │   ├── connection.ts
│   │   ├── message.ts
│   │   └── handler-context.ts
│   └── utils/
│       ├── logger.ts
│       └── metrics.ts
├── package.json
└── tsconfig.json
```

## Components and Interfaces

### Core Types

```typescript
interface Connection {
  id: string;
  ws: WebSocket;
  playerId: string | null;
  gameId: string | null;
  lastHeartbeat: number;
}

interface Message {
  type: string;
  payload: any;
  messageId?: string;
}

interface HandlerContext {
  connection: Connection;
  message: Message;
  gameManager: GameManager;
  playerManager: PlayerManager;
  roomManager: RoomManager;
  broadcast: BroadcastService;
}

interface MessageHandler {
  (context: HandlerContext): Promise<void>;
}
```

### Connection Manager

Manages WebSocket connections and player associations:

```typescript
class ConnectionManager {
  private connections: Map<string, Connection>;
  
  addConnection(ws: WebSocket): Connection;
  removeConnection(connectionId: string): void;
  getConnection(connectionId: string): Connection | undefined;
  getConnectionByPlayerId(playerId: string): Connection | undefined;
  associatePlayer(connectionId: string, playerId: string, gameId: string): void;
  getAllConnections(): Connection[];
}
```

### Game Manager

Manages game lifecycle and state:

```typescript
class GameManager {
  private games: Map<string, Game>;
  
  createGame(hostId: string, options: Partial<Game>): Game;
  getGame(gameId: string): Game | undefined;
  getAllGames(): Game[];
  getActiveGames(): Game[];
  addPlayerToGame(gameId: string, player: Player): void;
  removePlayerFromGame(gameId: string, playerId: string): void;
  startGame(gameId: string): void;
  endGame(gameId: string): void;
  deleteGame(gameId: string): void;
}
```

### Room Manager

Manages room state and phase transitions:

```typescript
class RoomManager {
  advancePhase(room: Room, nextPlayerId: string): Room;
  addChainEntry(room: Room, entry: ChainEntry): Room;
  getNextPlayerId(game: Game, currentPlayerId: string): string;
  getNextRoomIndex(currentIndex: number, totalRooms: number): number;
  assignPlayerToRoom(game: Game, playerId: string, roomIndex: number): void;
  checkGameComplete(game: Game): boolean;
}
```

### Player Manager

Manages player state and assignments:

```typescript
class PlayerManager {
  createPlayer(displayName: string): Player;
  getPlayer(game: Game, playerId: string): Player | undefined;
  updatePlayerRoom(game: Game, playerId: string, roomId: string): void;
  markPlayerDisconnected(game: Game, playerId: string): void;
  getConnectedPlayers(game: Game): Player[];
}
```

### Timer Manager

Manages phase timers:

```typescript
class TimerManager {
  private timers: Map<string, NodeJS.Timeout>;
  
  startTimer(roomId: string, duration: number, callback: () => void): void;
  cancelTimer(roomId: string): void;
  cancelAllTimers(gameId: string): void;
  getRemainingTime(roomId: string): number;
}
```

### Broadcast Service

Handles message broadcasting:

```typescript
class BroadcastService {
  constructor(private connectionManager: ConnectionManager);
  
  toGame(gameId: string, message: Message): void;
  toPlayer(playerId: string, message: Message): void;
  toAllConnections(message: Message): void;
  toGameExcept(gameId: string, excludePlayerId: string, message: Message): void;
}
```

### State Sync Service

Handles state synchronization:

```typescript
class StateSyncService {
  syncGameState(game: Game, playerId?: string): void;
  syncRoomState(game: Game, room: Room): void;
  syncPlayerState(game: Game, player: Player): void;
  sendGameList(): void;
}
```

### Message Handlers

Each handler processes a specific message type:

```typescript
// Example: Create Game Handler
async function handleCreateGame(context: HandlerContext): Promise<void> {
  const { displayName, maxPlayers, gameName } = context.message.payload;
  
  // Create player
  const player = context.playerManager.createPlayer(displayName);
  
  // Create game
  const game = context.gameManager.createGame(player.id, {
    maxPlayers,
    name: gameName
  });
  
  // Associate connection
  context.connection.playerId = player.id;
  context.connection.gameId = game.id;
  
  // Broadcast updated game list
  context.broadcast.toAllConnections({
    type: 'gameListUpdated',
    payload: context.gameManager.getActiveGames()
  });
  
  // Send success response
  context.broadcast.toPlayer(player.id, {
    type: 'gameCreated',
    payload: { game, player }
  });
}
```

## Data Models

The backend imports all data models from the shared models package:

```typescript
import {
  Game,
  Player,
  Room,
  ChainEntry,
  DrawingData,
  GameState,
  Phase,
  EntryType,
  validateGame,
  validatePlayer,
  validateRoom,
  validateChainEntry,
  serializeGame,
  deserializeGame,
  CONSTANTS
} from '@monday-painter/models';
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Room assignment is cyclic

*For any* game with N rooms and player completing room at index I, the next room index should be (I + 1) % N.
**Validates: Requirements 8.1**

### Property 2: Phase transitions maintain chain order

*For any* room, after adding a chain entry and advancing phase, the chain array should contain all previous entries plus the new entry.
**Validates: Requirements 4.4, 5.4, 6.4**

### Property 3: Game completion detection is accurate

*For any* game, the game should end if and only if all players have visited all rooms exactly once.
**Validates: Requirements 8.5**

### Property 4: Timer expiry triggers default submissions

*For any* phase timer that expires, a default chain entry should be created and the phase should advance.
**Validates: Requirements 7.1, 7.2, 7.3**

### Property 5: State broadcasts reach all game players

*For any* game state change, all connected players in that game should receive the update.
**Validates: Requirements 11.1**

### Property 6: Player removal maintains game consistency

*For any* game with player leaving during lobby, the remaining players list should not contain the removed player.
**Validates: Requirements 10.1, 10.2**

## Error Handling

### Validation Errors

- Use shared model validators for all input
- Return structured error responses with field details
- Log validation failures with context

### State Errors

- Validate game state before transitions
- Prevent invalid operations (e.g., starting ended game)
- Return clear error messages for invalid states

### Connection Errors

- Handle WebSocket errors gracefully
- Clean up player state on disconnect
- Log connection errors with player/game context

## Testing Strategy

### Unit Tests

- Test each manager class independently
- Test message handlers with mocked dependencies
- Test timer management and expiry
- Test state synchronization logic
- Test validation and error handling

### Property-Based Tests

Property-based tests will use `fast-check` library. Each test should run a minimum of 100 iterations.

- **Property 1**: Test room assignment with random game configurations
- **Property 2**: Test phase transitions with random chain states
- **Property 3**: Test game completion with random player/room counts
- **Property 4**: Test timer expiry with random phase types
- **Property 5**: Test broadcasts with random player sets
- **Property 6**: Test player removal with random game states

Each property-based test must be tagged with: `**Feature: monday-painter-backend, Property {number}: {property_text}**`

### Integration Tests

- Test complete game flow from creation to end
- Test multiple concurrent games
- Test player disconnection and reconnection
- Test timer-driven phase transitions
- Test WebSocket message handling end-to-end
