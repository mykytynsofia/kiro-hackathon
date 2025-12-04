# Requirements Document

## Introduction

This document specifies the requirements for Monday Painter, a multiplayer web-based drawing game similar to Telephone/Pictionary. Players join game lobbies, take turns writing prompts and drawing them, then guessing what others have drawn. The game creates separate rooms for each player where they cycle through writing, drawing, and guessing phases. At the end, players see the evolution of prompts through drawings and guesses, creating humorous results.

## Glossary

- **Game**: A multiplayer session with a lobby, active gameplay, and results phases
- **Lobby**: The pre-game state where players join and wait for the game to start
- **Room**: A player-specific workspace where they write, draw, or guess
- **Round**: A complete cycle where all players complete one phase (write/draw/guess)
- **Phase**: The current activity type (input prompt, draw, guess)
- **Player**: A user participating in a game
- **Host**: The player who created the game and can start it
- **Prompt**: Text describing what should be drawn
- **Drawing**: Canvas artwork created by a player
- **Guess**: A player's interpretation of a drawing
- **Chain**: The sequence of prompts, drawings, and guesses that pass through rooms
- **Timer**: A countdown that limits how long players have for each phase

## Requirements

### Requirement 1

**User Story:** As a player, I want to see a list of available games, so that I can choose which game to join.

#### Acceptance Criteria

1. WHEN a player opens the web application, THE system SHALL display a list of all games in lobby state
2. THE system SHALL display each game's name, player count, and maximum player capacity
3. WHEN a game is full, THE system SHALL indicate that the game cannot be joined
4. WHEN a game starts, THE system SHALL remove the game from the available games list
5. THE system SHALL refresh the game list automatically when games are created or started

### Requirement 2

**User Story:** As a player, I want to create a new game, so that I can invite others to play with me.

#### Acceptance Criteria

1. WHEN a player creates a game, THE system SHALL generate a unique game identifier
2. WHEN a game is created, THE system SHALL set the creator as the host
3. WHEN a game is created, THE system SHALL set the game state to lobby
4. THE system SHALL allow the host to configure the maximum number of players between 3 and 10
5. WHEN a game is created, THE system SHALL add the game to the available games list

### Requirement 3

**User Story:** As a player, I want to join an existing game, so that I can play with others.

#### Acceptance Criteria

1. WHEN a player joins a game, THE system SHALL add the player to the game's player list
2. WHEN a player joins a game, THE system SHALL broadcast the updated player list to all players in the lobby
3. WHEN a player attempts to join a full game, THE system SHALL reject the join request and send an error message
4. WHEN a player attempts to join a game that has already started, THE system SHALL reject the join request and send an error message
5. WHEN a player joins a game, THE system SHALL assign the player a unique player identifier within that game

### Requirement 4

**User Story:** As a host, I want to start the game when all players are ready, so that gameplay can begin.

#### Acceptance Criteria

1. WHEN the host starts the game, THE system SHALL change the game state from lobby to started
2. WHEN the game starts, THE system SHALL require at least 3 players in the lobby
3. WHEN the game starts, THE system SHALL create one room for each player
4. WHEN the game starts, THE system SHALL assign each player to their initial room
5. WHEN the game starts, THE system SHALL set all rooms to phase 1 (input prompt)

### Requirement 5

**User Story:** As a player, I want to write a prompt in phase 1, so that other players can draw it.

#### Acceptance Criteria

1. WHEN a room is in phase 1, THE system SHALL display a text input field to the assigned player
2. WHEN a player submits a prompt, THE system SHALL validate the prompt is not empty and contains between 3 and 100 characters
3. WHEN a valid prompt is submitted, THE system SHALL store the prompt in the room's chain
4. WHEN a prompt is submitted, THE system SHALL advance the room to phase 2
5. WHEN the phase 1 timer expires before submission, THE system SHALL use a default prompt and advance to phase 2

### Requirement 6

**User Story:** As a player, I want to draw the prompt in phase 2, so that the next player can guess what it is.

#### Acceptance Criteria

1. WHEN a room is in phase 2, THE system SHALL display the previous prompt or guess to the assigned player
2. WHEN a room is in phase 2, THE system SHALL provide a drawing canvas with basic tools (brush, colors, eraser)
3. WHEN a player submits a drawing, THE system SHALL store the drawing data in the room's chain
4. WHEN a drawing is submitted, THE system SHALL advance the room to phase 3
5. WHEN the phase 2 timer expires, THE system SHALL save the current canvas state and advance to phase 3

### Requirement 7

**User Story:** As a player, I want to guess what was drawn in phase 3, so that I can interpret the artwork.

#### Acceptance Criteria

1. WHEN a room is in phase 3, THE system SHALL display the previous drawing to the assigned player
2. WHEN a room is in phase 3, THE system SHALL provide a text input field for the guess
3. WHEN a player submits a guess, THE system SHALL validate the guess is not empty and contains between 3 and 100 characters
4. WHEN a valid guess is submitted, THE system SHALL store the guess in the room's chain
5. WHEN a guess is submitted, THE system SHALL advance the room to phase 2 with the next player assigned

### Requirement 8

**User Story:** As a player, I want to be automatically rotated to different rooms, so that I interact with all players' chains.

#### Acceptance Criteria

1. WHEN a player completes a phase, THE system SHALL assign the player to the next room in sequence
2. WHEN the next room index exceeds the total room count, THE system SHALL assign the player to room index 0
3. WHEN a player is assigned to a new room, THE system SHALL send the player the room state and current phase
4. THE system SHALL ensure each player visits each room exactly once per round
5. WHEN all players have visited all rooms, THE system SHALL change the game state to ended

### Requirement 9

**User Story:** As a player, I want to see a timer for each phase, so that I know how much time I have remaining.

#### Acceptance Criteria

1. WHEN a player enters a phase, THE system SHALL start a countdown timer
2. THE system SHALL set phase 1 timer to 60 seconds
3. THE system SHALL set phase 2 timer to 90 seconds
4. THE system SHALL set phase 3 timer to 45 seconds
5. WHEN a timer reaches zero, THE system SHALL automatically submit the current state and advance to the next phase

### Requirement 10

**User Story:** As a player, I want to see the game results when it ends, so that I can see how prompts evolved through drawings and guesses.

#### Acceptance Criteria

1. WHEN the game state changes to ended, THE system SHALL compile all room chains into a results view
2. THE system SHALL display each chain showing the sequence of prompts, drawings, and guesses
3. THE system SHALL display which player contributed each element in the chain
4. THE system SHALL allow players to navigate between different chains
5. THE system SHALL provide an option to return to the game list or create a new game

### Requirement 11

**User Story:** As a player, I want to leave a game, so that I can exit if I need to stop playing.

#### Acceptance Criteria

1. WHEN a player leaves during the lobby phase, THE system SHALL remove the player from the game and broadcast the updated player list
2. WHEN the host leaves during the lobby phase, THE system SHALL assign a new host from the remaining players
3. WHEN a player leaves during active gameplay, THE system SHALL mark the player as disconnected and use default submissions for their turns
4. WHEN all players leave a game, THE system SHALL delete the game
5. WHEN a player leaves, THE system SHALL clean up the player's connection resources

### Requirement 12

**User Story:** As a system administrator, I want to protect the server from malicious input, so that the system remains stable.

#### Acceptance Criteria

1. WHEN a message is received, THE system SHALL validate the message size does not exceed 1MB
2. WHEN drawing data is submitted, THE system SHALL validate the data represents a valid canvas state
3. WHEN text input is received, THE system SHALL sanitize the input to prevent injection attacks
4. WHEN a player sends more than 50 messages per second, THE system SHALL implement rate limiting
5. WHEN rate limiting is triggered, THE system SHALL send an error response and temporarily block the player

### Requirement 13

**User Story:** As an operations engineer, I want comprehensive logging, so that I can troubleshoot issues and monitor system health.

#### Acceptance Criteria

1. WHEN games are created, started, or ended, THE system SHALL log game lifecycle events with timestamps and game identifiers
2. WHEN players join or leave, THE system SHALL log player events with player and game identifiers
3. WHEN errors occur, THE system SHALL log error details including error messages and context
4. THE system SHALL expose metrics for active game counts by state
5. THE system SHALL expose metrics for total player count and average game duration
