# Implementation Plan

- [x] 1. Set up Node.js/TypeScript project


  - Initialize npm project with TypeScript
  - Install dependencies (ws, uuid, shared models package)
  - Configure tsconfig.json for Node.js
  - Set up project structure (websocket/, managers/, handlers/, services/, types/, utils/)
  - Configure build and start scripts
  - _Requirements: All_




- [ ] 2. Implement core types and interfaces
  - Create Connection interface
  - Create Message interface
  - Create HandlerContext interface


  - Create MessageHandler type
  - Export all types from types/index.ts
  - _Requirements: 14.1-14.5, 15.1-15.5_

- [ ] 3. Implement ConnectionManager
  - Create ConnectionManager class with Map storage
  - Implement addConnection method


  - Implement removeConnection method
  - Implement getConnection and getConnectionByPlayerId methods
  - Implement associatePlayer method
  - Implement getAllConnections method
  - _Requirements: 15.1-15.5_

- [x] 4. Implement WebSocket server and message router


  - Create WebSocket server with ws library
  - Implement connection event handler
  - Implement message event handler with JSON parsing
  - Create MessageRouter to dispatch messages to handlers
  - Implement error handling for invalid JSON
  - Implement close event handler


  - _Requirements: 14.1-14.5, 15.1-15.5_

- [ ] 5. Implement heartbeat mechanism
  - Create heartbeat service with ping-pong
  - Send ping messages every 30 seconds
  - Track last heartbeat timestamp per connection
  - Detect stale connections (no pong for 60 seconds)
  - Close stale connections and clean up
  - _Requirements: 15.4, 15.5_



- [ ] 6. Implement GameManager
  - Create GameManager class with Map storage
  - Implement createGame method with UUID generation
  - Implement getGame, getAllGames, getActiveGames methods
  - Implement addPlayerToGame with validation
  - Implement removePlayerFromGame method


  - Implement startGame with room creation logic
  - Implement endGame method
  - Implement deleteGame method
  - _Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.8, 9.1-9.5, 10.1-10.6_

- [ ] 7. Implement PlayerManager
  - Create PlayerManager class
  - Implement createPlayer method with UUID generation


  - Implement getPlayer method
  - Implement updatePlayerRoom method
  - Implement markPlayerDisconnected method
  - Implement getConnectedPlayers method
  - _Requirements: 2.1-2.5, 10.1-10.6, 15.1-15.5_

- [x] 8. Implement RoomManager


  - Create RoomManager class
  - Implement advancePhase method with phase logic (input→draw→guess→draw...)
  - Implement addChainEntry method
  - Implement getNextPlayerId method (cyclic assignment)
  - Implement getNextRoomIndex method ((current + 1) % total)
  - Implement assignPlayerToRoom method
  - Implement checkGameComplete method (all players visited all rooms)


  - _Requirements: 4.1-4.7, 5.1-5.7, 6.1-6.7, 8.1-8.5_

- [ ] 9. Implement TimerManager
  - Create TimerManager class with Map storage for timers
  - Implement startTimer method with setTimeout
  - Implement cancelTimer method with clearTimeout
  - Implement cancelAllTimers method for a game


  - Implement getRemainingTime method
  - Handle timer expiry callbacks
  - _Requirements: 7.1-7.6_

- [ ] 10. Implement BroadcastService
  - Create BroadcastService class
  - Implement toGame method (send to all players in game)
  - Implement toPlayer method (send to specific player)


  - Implement toAllConnections method (send to everyone)
  - Implement toGameExcept method (send to game except one player)
  - Handle serialization of messages to JSON
  - _Requirements: 11.1-11.5_

- [ ] 11. Implement StateSyncService
  - Create StateSyncService class
  - Implement syncGameState method
  - Implement syncRoomState method
  - Implement syncPlayerState method
  - Implement sendGameList method
  - Use BroadcastService for sending updates
  - _Requirements: 11.1-11.5_

- [ ] 12. Implement ValidationService
  - Create ValidationService class
  - Use shared model validators for validation
  - Implement validateMessage method
  - Implement validateGameState method
  - Implement validatePlayerPermissions method
  - Return structured error responses
  - _Requirements: 12.1-12.5_

- [ ] 13. Implement message handlers
  - [ ] 13.1 Implement handleCreateGame
    - Validate payload (displayName, maxPlayers, gameName)
    - Create player and game
    - Associate connection with player and game
    - Broadcast updated game list
    - Send success response
    - _Requirements: 1.1-1.5_
  - [ ] 13.2 Implement handleJoinGame
    - Validate game exists and is in lobby state
    - Validate game is not full
    - Create player and add to game
    - Associate connection with player and game
    - Broadcast updated player list to game
    - Send success response with game state
    - _Requirements: 2.1-2.5_
  - [ ] 13.3 Implement handleStartGame
    - Validate sender is host
    - Validate at least 3 players
    - Change game state to started
    - Create rooms (one per player)
    - Assign players to initial rooms
    - Set all rooms to input phase
    - Start phase timers
    - Broadcast game started event
    - _Requirements: 3.1-3.8_
  - [ ] 13.4 Implement handleSubmitPrompt
    - Validate player is in room in input phase
    - Validate prompt length (3-100 characters)
    - Create ChainEntry with type prompt
    - Add entry to room chain
    - Advance room to draw phase
    - Assign next player to room
    - Start new phase timer
    - Broadcast phase change
    - _Requirements: 4.1-4.7_
  - [ ] 13.5 Implement handleSubmitDrawing
    - Validate player is in room in draw phase
    - Validate drawing data structure
    - Create ChainEntry with type drawing


    - Add entry to room chain
    - Advance room to guess phase
    - Assign next player to room
    - Start new phase timer
    - Broadcast phase change
    - _Requirements: 5.1-5.7_


  - [ ] 13.6 Implement handleSubmitGuess
    - Validate player is in room in guess phase
    - Validate guess length (3-100 characters)
    - Create ChainEntry with type guess
    - Add entry to room chain
    - Check if game is complete
    - If complete, end game; otherwise advance to draw phase

    - Assign next player to room
    - Start new phase timer
    - Broadcast phase change or game ended
    - _Requirements: 6.1-6.7_
  - [ ] 13.7 Implement handleLeaveGame
    - Get player's game
    - If in lobby, remove player and broadcast updated list
    - If host leaves lobby, assign new host
    - If in active game, mark player as disconnected


    - If all players leave, delete game after timeout
    - Send success response
    - _Requirements: 10.1-10.6_

- [ ] 14. Implement timer expiry handlers
  - Create handleInputPhaseExpiry function
  - Create handleDrawPhaseExpiry function
  - Create handleGuessPhaseExpiry function
  - Generate default submissions (prompt, drawing, guess)
  - Call appropriate advance phase logic
  - _Requirements: 7.1-7.6_

- [ ] 15. Implement logging and metrics
  - Create Logger utility with structured logging
  - Log game lifecycle events (create, start, end)
  - Log player events (join, leave, disconnect)
  - Log phase transitions
  - Log errors with context
  - Create Metrics utility for tracking active games, players, messages
  - _Requirements: 13.1-13.5_

- [ ] 16. Register all message handlers
  - Register handleCreateGame for 'createGame' type
  - Register handleJoinGame for 'joinGame' type
  - Register handleStartGame for 'startGame' type
  - Register handleSubmitPrompt for 'submitPrompt' type
  - Register handleSubmitDrawing for 'submitDrawing' type
  - Register handleSubmitGuess for 'submitGuess' type
  - Register handleLeaveGame for 'leaveGame' type
  - _Requirements: 14.1-14.5_

- [ ] 17. Implement server startup and initialization
  - Create main server.ts entry point
  - Initialize all managers and services
  - Start WebSocket server on configured port
  - Set up graceful shutdown handlers
  - Log server startup information
  - _Requirements: All_

- [ ] 18. Write unit tests for managers
  - Test GameManager game lifecycle operations
  - Test PlayerManager player operations
  - Test RoomManager phase transitions and assignments
  - Test TimerManager timer operations
  - Test ConnectionManager connection tracking
  - _Requirements: All_

- [ ] 19. Write unit tests for handlers
  - Test handleCreateGame with valid and invalid inputs
  - Test handleJoinGame with various game states
  - Test handleStartGame with permission checks
  - Test handleSubmitPrompt, handleSubmitDrawing, handleSubmitGuess
  - Test handleLeaveGame in different scenarios
  - Mock dependencies (managers, services)
  - _Requirements: All_

- [ ] 20. Write property-based tests
  - [ ]* 20.1 Property test for room assignment
    - **Property 1: Room assignment is cyclic**
    - **Validates: Requirements 8.1**
  - [ ]* 20.2 Property test for phase transitions
    - **Property 2: Phase transitions maintain chain order**
    - **Validates: Requirements 4.4, 5.4, 6.4**
  - [ ]* 20.3 Property test for game completion
    - **Property 3: Game completion detection is accurate**
    - **Validates: Requirements 8.5**
  - [ ]* 20.4 Property test for timer expiry
    - **Property 4: Timer expiry triggers default submissions**
    - **Validates: Requirements 7.1, 7.2, 7.3**
  - [ ]* 20.5 Property test for broadcasts
    - **Property 5: State broadcasts reach all game players**
    - **Validates: Requirements 11.1**
  - [ ]* 20.6 Property test for player removal
    - **Property 6: Player removal maintains game consistency**
    - **Validates: Requirements 10.1, 10.2**

- [ ] 21. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
