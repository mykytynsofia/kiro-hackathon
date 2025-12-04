# Monday Painter Backend

WebSocket backend server for the Monday Painter multiplayer drawing game.

## Overview

This server implements the game logic for Monday Painter, managing game sessions, player connections, room assignments, and phase transitions. All game state is stored in-memory.

## Installation

```bash
npm install
npm run build
```

## Running

```bash
# Production
npm start

# Development
npm run dev
```

## Configuration

Set environment variables:
- `PORT` - WebSocket server port (default: 8080)

## Architecture

- **Managers**: Game state management (GameManager, PlayerManager, RoomManager, TimerManager)
- **Handlers**: Message processing (create game, join, start, submit actions)
- **Services**: Cross-cutting concerns (broadcast, state sync, validation)
- **WebSocket**: Connection management and message routing

## License

MIT
