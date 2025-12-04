# Monday Painter Frontend

Angular frontend for the Monday Painter multiplayer drawing game.

## Development

```bash
npm install
npm start
```

Navigate to `http://localhost:4200/`

## Build

```bash
npm run build
```

## Features

- Real-time multiplayer drawing game
- WebSocket communication
- Responsive design for mobile and desktop
- Canvas drawing with multiple tools
- Game lobby and results screens

## Architecture

- **Core**: Services for WebSocket, game state, and player management
- **Shared**: Reusable components (timer, player list, loading spinner)
- **Features**: Game-specific components (game list, lobby, drawing, results)
