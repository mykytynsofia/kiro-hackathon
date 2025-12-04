# Requirements Document

## Introduction

This document specifies the requirements for the Monday Painter frontend application, built with Angular. The application provides a web-based user interface for the multiplayer drawing game, similar to Gartic Phone. Users can browse games, join lobbies, participate in drawing and guessing phases, and view results. The frontend shall consume the shared data models defined in #[[file:../monday-painter-models/requirements.md]] and communicate with the backend via WebSocket connections.

## Glossary

- **Component**: An Angular component that encapsulates UI and behavior
- **Service**: An Angular service that provides business logic or data access
- **Route**: A URL path that maps to a specific component view
- **WebSocket Service**: A service that manages real-time communication with the backend
- **Game List View**: The main screen showing available games
- **Lobby View**: The pre-game screen where players wait
- **Game View**: The active gameplay screen with drawing/guessing
- **Results View**: The end-game screen showing all chains
- **Canvas Component**: A drawing surface for creating artwork

## Requirements

### Requirement 1

**User Story:** As a player, I want to see a home screen with available games, so that I can choose which game to join or create a new one.

#### Acceptance Criteria

1. WHEN the application loads, THE system SHALL display the game list view as the default route
2. THE system SHALL display a list of all games in lobby state with game name, player count, and max players
3. THE system SHALL provide a button to create a new game
4. THE system SHALL provide a button to join each available game
5. WHEN a game is full, THE system SHALL disable the join button and display a "Full" indicator


### Requirement 2

**User Story:** As a player, I want to create a new game with custom settings, so that I can start a game with my preferred configuration.

#### Acceptance Criteria

1. WHEN a player clicks create game, THE system SHALL display a game creation modal or form
2. THE system SHALL provide an input field for game name with a default value
3. THE system SHALL provide a selector for maximum players with range 3 to 10
4. WHEN the player submits the form, THE system SHALL send a create game message to the backend
5. WHEN the game is created successfully, THE system SHALL navigate to the lobby view

### Requirement 3

**User Story:** As a player, I want to enter my display name before joining, so that other players can identify me.

#### Acceptance Criteria

1. WHEN a player joins a game, THE system SHALL prompt for a display name if not already set
2. THE system SHALL validate the display name is between 1 and 20 characters
3. THE system SHALL store the display name in local storage for future sessions
4. WHEN the display name is valid, THE system SHALL send a join game message to the backend
5. WHEN the join is successful, THE system SHALL navigate to the lobby view

### Requirement 4

**User Story:** As a player, I want to see the lobby with all participants, so that I know who is playing and when the game will start.

#### Acceptance Criteria

1. WHEN in the lobby, THE system SHALL display the game name and player count
2. THE system SHALL display a list of all players with their display names
3. WHEN the player is the host, THE system SHALL display a start game button
4. WHEN the player is not the host, THE system SHALL display a waiting message
5. THE system SHALL update the player list in real-time when players join or leave

### Requirement 5

**User Story:** As a host, I want to start the game when ready, so that gameplay can begin.

#### Acceptance Criteria

1. WHEN the host clicks start game, THE system SHALL send a start game message to the backend
2. WHEN there are fewer than 3 players, THE system SHALL disable the start button and show a message
3. WHEN the game starts successfully, THE system SHALL navigate to the game view
4. THE system SHALL display a loading indicator while waiting for the game to start
5. WHEN the game start fails, THE system SHALL display an error message

### Requirement 6

**User Story:** As a player, I want to see which phase I'm in and what I need to do, so that I can participate correctly.

#### Acceptance Criteria

1. WHEN in the game view, THE system SHALL display the current phase (write, draw, or guess)
2. THE system SHALL display instructions for the current phase
3. THE system SHALL display a countdown timer showing remaining time
4. THE system SHALL display the current room number or progress indicator
5. WHEN the phase changes, THE system SHALL update the view to show the new phase

### Requirement 7

**User Story:** As a player, I want to write a prompt in the input phase, so that others can draw it.

#### Acceptance Criteria

1. WHEN in input phase, THE system SHALL display a text input field
2. THE system SHALL validate the prompt is between 3 and 100 characters
3. THE system SHALL provide a submit button to send the prompt
4. WHEN the prompt is submitted, THE system SHALL send the prompt to the backend
5. WHEN the timer expires, THE system SHALL automatically submit the current prompt or use a default

### Requirement 8

**User Story:** As a player, I want to draw on a canvas in the draw phase, so that I can illustrate the prompt.

#### Acceptance Criteria

1. WHEN in draw phase, THE system SHALL display the prompt or guess to draw
2. THE system SHALL provide a canvas component with drawing tools
3. THE system SHALL provide brush color selection with at least 8 colors
4. THE system SHALL provide brush size selection with range 1 to 50 pixels
5. THE system SHALL provide an eraser tool
6. THE system SHALL provide a clear canvas button
7. THE system SHALL provide an undo button to remove the last stroke
8. WHEN the drawing is submitted, THE system SHALL send the canvas data to the backend
9. WHEN the timer expires, THE system SHALL automatically submit the current canvas state

### Requirement 9

**User Story:** As a player, I want to guess what was drawn in the guess phase, so that I can interpret the artwork.

#### Acceptance Criteria

1. WHEN in guess phase, THE system SHALL display the previous drawing
2. THE system SHALL provide a text input field for the guess
3. THE system SHALL validate the guess is between 3 and 100 characters
4. THE system SHALL provide a submit button to send the guess
5. WHEN the guess is submitted, THE system SHALL send the guess to the backend
6. WHEN the timer expires, THE system SHALL automatically submit the current guess or use a default

### Requirement 10

**User Story:** As a player, I want to see a transition screen between phases, so that I know the game is progressing.

#### Acceptance Criteria

1. WHEN a phase is submitted, THE system SHALL display a waiting screen
2. THE system SHALL show a message indicating the game is progressing
3. THE system SHALL display an animation or loading indicator
4. WHEN the next phase is ready, THE system SHALL automatically transition to the new phase
5. THE system SHALL display which room the player is moving to

### Requirement 11

**User Story:** As a player, I want to see the game results when it ends, so that I can see how prompts evolved.

#### Acceptance Criteria

1. WHEN the game ends, THE system SHALL navigate to the results view
2. THE system SHALL display all chains with prompts, drawings, and guesses in sequence
3. THE system SHALL display which player created each element
4. THE system SHALL provide navigation to view different chains
5. THE system SHALL provide a button to return to the game list

### Requirement 12

**User Story:** As a player, I want to leave a game at any time, so that I can exit if needed.

#### Acceptance Criteria

1. THE system SHALL provide a leave game button in the lobby and game views
2. WHEN the player clicks leave, THE system SHALL send a leave game message to the backend
3. WHEN the player leaves, THE system SHALL navigate back to the game list
4. THE system SHALL display a confirmation dialog before leaving during active gameplay
5. WHEN the connection is lost, THE system SHALL automatically return to the game list with an error message

### Requirement 13

**User Story:** As a player, I want responsive design, so that I can play on different devices.

#### Acceptance Criteria

1. THE system SHALL provide a responsive layout that works on desktop, tablet, and mobile devices
2. THE system SHALL adjust the canvas size based on screen dimensions
3. THE system SHALL provide touch support for drawing on mobile devices
4. THE system SHALL use a mobile-friendly navigation pattern
5. THE system SHALL ensure text is readable on all screen sizes

### Requirement 14

**User Story:** As a player, I want visual feedback for my actions, so that I know the system is responding.

#### Acceptance Criteria

1. WHEN a button is clicked, THE system SHALL provide visual feedback (loading state, disabled state)
2. WHEN an error occurs, THE system SHALL display an error message with details
3. WHEN a success action completes, THE system SHALL provide confirmation feedback
4. THE system SHALL display loading indicators for network operations
5. THE system SHALL use animations for transitions between views

### Requirement 15

**User Story:** As a player, I want the application to handle connection issues gracefully, so that I can recover from network problems.

#### Acceptance Criteria

1. WHEN the WebSocket connection is lost, THE system SHALL display a connection lost message
2. THE system SHALL attempt to reconnect automatically with exponential backoff
3. WHEN reconnection succeeds, THE system SHALL restore the player to their current game state
4. WHEN reconnection fails after multiple attempts, THE system SHALL return to the game list
5. THE system SHALL display the connection status in the UI
