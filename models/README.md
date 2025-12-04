# Monday Painter Models

Shared data models for the Monday Painter multiplayer drawing game.

## Overview

This package provides TypeScript type definitions, validation functions, and serialization utilities for all data models used across the Monday Painter application (frontend and backend).

## Installation

```bash
npm install
npm run build
```

## Usage

```typescript
import {
  Game,
  Player,
  Room,
  GameState,
  Phase,
  validateGame,
  serializeGame,
  deserializeGame,
  CONSTANTS
} from '@monday-painter/models';

// Create a game
const game: Game = {
  id: 'game-123',
  state: GameState.LOBBY,
  hostId: 'player-1',
  players: [],
  rooms: [],
  maxPlayers: 6,
  createdAt: Date.now()
};

// Validate
const result = validateGame(game);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}

// Serialize
const json = serializeGame(game);

// Deserialize
const restored = deserializeGame(json);
```

## Models

- **Game**: Represents a game session
- **Player**: Represents a participant
- **Room**: Represents a player workspace
- **ChainEntry**: Represents a prompt, drawing, or guess
- **DrawingData**: Represents canvas artwork
- **Stroke**: Represents a drawing path

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm test` - Run tests
- `npm run lint` - Lint code

## License

MIT
