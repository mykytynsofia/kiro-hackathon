# Requirements Document

## Introduction

This document specifies the requirements for the Monday Painter backend server, which implements the game logic for the multiplayer drawing game. The backend uses the generic WebSocket infrastructure for real-time communication and the shared data models from #[[file:../monday-painter-models/requirements.md]]. The server manages game lifecycle, room assignments, phase transitions, timers, and state synchronization across all connected clients.

## Glossary

- **Backend Server**: The Node.js/TypeScript server that implements game logic and manages WebSocket connections
- **Game Manager**: The service responsible for creating, starting, and ending games
- **Room Manager**: The service responsible for managing room state and phase transitions
- **Player Manager**: The service responsible for tracking player connections and assignments
- **Timer Service**: The service responsible for managing phase timers
- **State Manager**: The service responsible for maintaining and synchronizing game state
- **Message Handler**: A function that processes a specific message type from clients
- **Broadcast**: Sending a message to multiple clients in the same game or room

## Requirements

### Requirement 1

**User Story:** As a backend developer, I want a game manager service, so that I can create and manage game sessions.

#### Acceptance Criteria

1. WHEN a create game message is received, THE Backend Server SHALL create a new Game with a unique identifier
2. WHEN a game is created, THE Backend Server SHALL set the creator as the host and add them to the player list
3. WHEN a game is created, THE Backend Server SHALL set the game state to lobby
4. THE Backend Server SHALL store the game in an in-memory game registry
5. THE Backend Server SHALL broadcast the updated game list to all connected clients

### Requirement 2

**User Story:** As a player, I want to join games, so that I can participate in drawing sessions.

#### Acceptance Criteria

1. WHEN a join game message is received, THE Backend Server SHALL validate the game exists
2. WHEN a player joins a game, THE Backend Server SHALL validate the game is in lobby state
3. WHEN a player joins a game, THE Backend Server SHALL validate the game is not full
4. WHEN a player joins successfully, THE Backend Server SHALL add the player to the game's player list
5. WHEN a player joins, THE Backend Server SHALL broadcast the updated player list to all players in the game

### Requirement 3

**User Story:** As a host, I want to start games, so that gameplay can begin.

#### Acceptance Criteria

1. WHEN a start game message is received, THE Backend Server SHALL validate the sender is the host
2. WHEN starting a game, THE Backend Server SHALL validate there are at least 3 players
3. WHEN a game starts, THE Backend Server SHALL change the game state to started
4. WHEN a game starts, THE Backend Server SHALL create one room for each player
5. WHEN a game starts, THE Backend Server SHALL assign each player to their initial room (player index matches room index)
6. WHEN a game starts, THE Backend Server SHALL set all rooms to phase input
7. WHEN a game starts, THE Backend Server SHALL start phase timers for all rooms
8. WHEN a game starts, THE Backend Server SHALL broadcast the game started event to all players

### Requirement 4

**User Story:** As a player, I want to submit prompts in the input phase, so that others can draw them.

#### Acceptance Criteria

1. WHEN a submit prompt message is received, THE Backend Server SHALL validate the player is in a room in input phase
2. WHEN a prompt is submitted, THE Backend Server SHALL validate the prompt length is between 3 and 100 characters
3. WHEN a valid prompt is submitted, THE Backend Server SHALL create a ChainEntry with type prompt
4. WHEN a prompt is added, THE Backend Server SHALL advance the room to draw phase
5. WHEN advancing to draw phase, THE Backend Server SHALL assign the next player to the room
6. WHEN advancing phases, THE Backend Server SHALL start a new phase timer
7. WHEN advancing phases, THE Backend Server SHALL broadcast the phase change to all players in the game

### Requirement 5

**User Story:** As a player, I want to submit drawings in the draw phase, so that others can guess what they represent.

#### Acceptance Criteria

1. WHEN a submit drawing message is received, THE Backend Server SHALL validate the player is in a room in draw phase
2. WHEN a drawing is submitted, THE Backend Server SHALL validate the drawing data structure
3. WHEN a valid drawing is submitted, THE Backend Server SHALL create a ChainEntry with type drawing
4. WHEN a drawing is added, THE Backend Server SHALL advance the room to guess phase
5. WHEN advancing to guess phase, THE Backend Server SHALL assign the next player to the room
6. WHEN advancing phases, THE Backend Server SHALL start a new phase timer
7. WHEN advancing phases, THE Backend Server SHALL broadcast the phase change to all players in the game

### Requirement 6

**User Story:** As a player, I want to submit guesses in the guess phase, so that I can interpret drawings.

#### Acceptance Criteria

1. WHEN a submit guess message is received, THE Backend Server SHALL validate the player is in a room in guess phase
2. WHEN a guess is submitted, THE Backend Server SHALL validate the guess length is between 3 and 100 characters
3. WHEN a valid guess is submitted, THE Backend Server SHALL create a ChainEntry with type guess
4. WHEN a guess is added, THE Backend Server SHALL advance the room to draw phase
5. WHEN advancing to draw phase, THE Backend Server SHALL assign the next player to the room
6. WHEN all players have visited all rooms, THE Backend Server SHALL end the game instead of continuing
7. WHEN advancing phases, THE Backend Server SHALL broadcast the phase change to all players in the game

### Requirement 7

**User Story:** As a player, I want automatic phase progression when timers expire, so that the game keeps moving.

#### Acceptance Criteria

1. WHEN a phase timer expires in input phase, THE Backend Server SHALL create a default prompt and advance the room
2. WHEN a phase timer expires in draw phase, THE Backend Server SHALL save the current canvas state and advance the room
3. WHEN a phase timer expires in guess phase, THE Backend Server SHALL create a default guess and advance the room
4. THE Backend Server SHALL set input phase timer to 60 seconds
5. THE Backend Server SHALL set draw phase timer to 90 seconds
6. THE Backend Server SHALL set guess phase timer to 45 seconds

### Requirement 8

**User Story:** As a player, I want to be automatically assigned to rooms, so that I participate in all chains.

#### Acceptance Criteria

1. WHEN a player completes a phase, THE Backend Server SHALL calculate the next room index as (current + 1) % total rooms
2. WHEN assigning a player to a room, THE Backend Server SHALL update the player's currentRoomId
3. WHEN assigning a player to a room, THE Backend Server SHALL update the room's currentPlayerId
4. THE Backend Server SHALL ensure each player visits each room exactly once per round
5. WHEN all players have completed all rooms, THE Backend Server SHALL transition the game to ended state

### Requirement 9

**User Story:** As a player, I want to see game results when it ends, so that I can view all the chains.

#### Acceptance Criteria

1. WHEN a game ends, THE Backend Server SHALL change the game state to ended
2. WHEN a game ends, THE Backend Server SHALL compile all room chains into a results structure
3. WHEN a game ends, THE Backend Server SHALL broadcast the game ended event with results to all players
4. THE Backend Server SHALL include all ChainEntry objects for each room in the results
5. THE Backend Server SHALL maintain the game in memory for 5 minutes after ending for result viewing

### Requirement 10

**User Story:** As a player, I want to leave games, so that I can exit when needed.

#### Acceptance Criteria

1. WHEN a leave game message is received during lobby, THE Backend Server SHALL remove the player from the game
2. WHEN a player leaves during lobby, THE Backend Server SHALL broadcast the updated player list
3. WHEN the host leaves during lobby, THE Backend Server SHALL assign a new host from remaining players
4. WHEN a player leaves during active gameplay, THE Backend Server SHALL mark the player as disconnected
5. WHEN a disconnected player's turn comes, THE Backend Server SHALL use default submissions and continue
6. WHEN all players leave a game, THE Backend Server SHALL delete the game after a timeout

### Requirement 11

**User Story:** As a backend developer, I want state synchronization, so that all clients have consistent game state.

#### Acceptance Criteria

1. WHEN game state changes, THE Backend Server SHALL broadcast the updated state to all players in the game
2. WHEN a player reconnects, THE Backend Server SHALL send the current game state to that player
3. THE Backend Server SHALL include the player's current room and phase in state updates
4. THE Backend Server SHALL include remaining time for the current phase in state updates
5. THE Backend Server SHALL validate all state changes before broadcasting

### Requirement 12

**User Story:** As a system administrator, I want input validation, so that the server is protected from invalid data.

#### Acceptance Criteria

1. WHEN any message is received, THE Backend Server SHALL validate the message structure using the shared models
2. WHEN validation fails, THE Backend Server SHALL send an error response with details
3. THE Backend Server SHALL validate player permissions for actions (e.g., only host can start)
4. THE Backend Server SHALL validate game state transitions are valid
5. THE Backend Server SHALL validate room and phase states before processing submissions

### Requirement 13

**User Story:** As an operations engineer, I want comprehensive logging, so that I can troubleshoot issues.

#### Acceptance Criteria

1. WHEN games are created, started, or ended, THE Backend Server SHALL log game lifecycle events
2. WHEN players join or leave, THE Backend Server SHALL log player events
3. WHEN phases advance, THE Backend Server SHALL log phase transitions with room and player information
4. WHEN errors occur, THE Backend Server SHALL log error details with context
5. THE Backend Server SHALL expose metrics for active games, players, and message throughput

### Requirement 14

**User Story:** As a backend developer, I want WebSocket message handlers, so that I can process client messages.

#### Acceptance Criteria

1. THE Backend Server SHALL register handlers for all message types (createGame, joinGame, startGame, submitPrompt, submitDrawing, submitGuess, leaveGame)
2. WHEN a message is received, THE Backend Server SHALL route it to the appropriate handler
3. WHEN a handler processes a message, THE Backend Server SHALL have access to the player's connection and game context
4. WHEN a handler completes, THE Backend Server SHALL send a response to the client
5. WHEN a handler throws an error, THE Backend Server SHALL catch it and send an error response

### Requirement 15

**User Story:** As a backend developer, I want connection management, so that I can track player connections.

#### Acceptance Criteria

1. WHEN a WebSocket connection is established, THE Backend Server SHALL create a connection record with a unique identifier
2. WHEN a player joins a game, THE Backend Server SHALL associate the connection with the player and game
3. WHEN a connection is closed, THE Backend Server SHALL remove the player from their game
4. THE Backend Server SHALL implement heartbeat ping-pong to detect stale connections
5. WHEN a heartbeat timeout occurs, THE Backend Server SHALL close the connection and clean up player state
