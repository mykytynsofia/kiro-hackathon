# Implementation Plan

- [ ] 1. Set up Angular project and dependencies
  - Create new Angular project with routing
  - Install dependencies (RxJS, WebSocket libraries)
  - Configure TypeScript strict mode
  - Set up project structure (core, shared, features folders)
  - Import shared models from monday-painter-models
  - Configure environment files for WebSocket URL
  - _Requirements: All_

- [ ] 2. Implement core WebSocket service
  - Create WebSocketService with connection management
  - Implement connect, disconnect, and send methods
  - Create message observable with RxJS Subject
  - Implement message type filtering (onMessage method)
  - Add connection status observable
  - Handle reconnection logic with exponential backoff
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 3. Implement core game service
  - Create GameService with game state management
  - Implement createGame method
  - Implement joinGame method
  - Implement leaveGame method
  - Implement startGame method
  - Create observables for current game, room, and phase
  - Handle WebSocket message subscriptions for game updates
  - _Requirements: 2.1-2.5, 3.1-3.5, 4.1-4.5, 5.1-5.5_

- [ ] 4. Implement player service
  - Create PlayerService for player data management
  - Implement setDisplayName and getDisplayName methods
  - Store display name in localStorage
  - Create player observable
  - _Requirements: 3.1-3.5_

- [ ] 5. Set up routing and navigation guards
  - Configure app routing module with routes (home, lobby, game, results)
  - Create GameGuard to protect game routes
  - Implement canActivate logic to check game state
  - Handle navigation on connection loss
  - _Requirements: 1.1, 12.1-12.5_

- [ ] 6. Implement shared components
  - [ ] 6.1 Create TimerComponent
    - Display countdown timer
    - Emit event when timer reaches zero
    - Update every second
    - _Requirements: 6.3, 9.1-9.6_
  - [ ] 6.2 Create PlayerListComponent
    - Display list of players with names
    - Show connection status indicators
    - Update in real-time
    - _Requirements: 4.1-4.5_
  - [ ] 6.3 Create LoadingSpinnerComponent
    - Display loading animation
    - Show loading message
    - _Requirements: 14.4_

- [ ] 7. Implement GameListComponent
  - Create component with game list display
  - Fetch available games from GameService
  - Display game cards with name, player count, max players
  - Implement create game button with modal/form
  - Implement join game button for each game
  - Disable join button for full games
  - Handle real-time game list updates
  - _Requirements: 1.1-1.5, 2.1-2.5_

- [ ] 8. Implement LobbyComponent
  - Create component with player list display
  - Display game name and player count
  - Show start button for host only
  - Disable start button when fewer than 3 players
  - Implement leave game button
  - Handle real-time player list updates
  - Navigate to game view when game starts
  - _Requirements: 4.1-4.5, 5.1-5.5, 12.1-12.5_

- [ ] 9. Implement GameComponent container
  - Create main game container component
  - Display timer component
  - Switch between phase components based on current phase
  - Handle phase transitions
  - Display room progress indicator
  - Implement leave game with confirmation dialog
  - _Requirements: 6.1-6.5, 10.1-10.5, 12.1-12.5_

- [ ] 10. Implement InputPhaseComponent
  - Create component with text input form
  - Implement reactive form with validation (3-100 characters)
  - Display character count
  - Implement submit button
  - Handle auto-submit on timer expiry
  - Send prompt to GameService
  - _Requirements: 7.1-7.5_

- [ ] 11. Implement CanvasComponent
  - [ ] 11.1 Create canvas with HTML5 drawing
    - Set up canvas element with configurable width/height
    - Implement mouse event handlers (mousedown, mousemove, mouseup)
    - Implement touch event handlers for mobile
    - Draw strokes on canvas in real-time
    - _Requirements: 8.1-8.9, 13.1-13.5_
  - [ ] 11.2 Implement drawing state management
    - Track current stroke being drawn
    - Store all strokes in array
    - Apply current color and width to strokes
    - Support brush and eraser tools
    - _Requirements: 8.1-8.9_
  - [ ] 11.3 Implement canvas operations
    - Implement undo method (remove last stroke)
    - Implement clear method (remove all strokes)
    - Implement getDrawingData method for serialization
    - Support readonly mode for displaying drawings
    - Render existing DrawingData on canvas
    - _Requirements: 8.1-8.9_

- [ ] 12. Implement DrawPhaseComponent
  - Create component with canvas and toolbar
  - Display prompt to draw
  - Integrate CanvasComponent
  - Create toolbar with color picker (8+ colors)
  - Create toolbar with brush size selector (1-50 pixels)
  - Add eraser tool button
  - Add undo button
  - Add clear canvas button
  - Implement submit button
  - Handle auto-submit on timer expiry
  - Send drawing data to GameService
  - _Requirements: 8.1-8.9_

- [ ] 13. Implement GuessPhaseComponent
  - Create component with canvas display and text input
  - Display previous drawing in readonly canvas
  - Implement reactive form with validation (3-100 characters)
  - Implement submit button
  - Handle auto-submit on timer expiry
  - Send guess to GameService
  - _Requirements: 9.1-9.6_

- [ ] 14. Implement TransitionComponent
  - Create waiting screen component
  - Display progress message
  - Show loading animation
  - Display next room information
  - Auto-transition when next phase is ready
  - _Requirements: 10.1-10.5_

- [ ] 15. Implement ResultsComponent
  - Create component with chain navigation
  - Fetch all chains from GameService
  - Display current chain with prompts, drawings, and guesses
  - Show player names for each element
  - Implement previous/next chain navigation
  - Implement return to game list button
  - _Requirements: 11.1-11.5_

- [ ] 16. Implement responsive design and styling
  - Create global styles with color scheme
  - Implement responsive layouts for all components
  - Add mobile-friendly navigation
  - Ensure canvas scales properly on different screens
  - Add touch support for mobile drawing
  - Test on desktop, tablet, and mobile viewports
  - _Requirements: 13.1-13.5_

- [ ] 17. Implement error handling and user feedback
  - Add error interceptor for HTTP errors
  - Display error messages with toast/snackbar
  - Add loading states to buttons
  - Show connection status indicator
  - Display success confirmations
  - Add transition animations between views
  - _Requirements: 14.1-14.5, 15.1-15.5_

- [ ] 18. Write unit tests for services
  - Test WebSocketService connection and message handling
  - Test GameService state management and operations
  - Test PlayerService localStorage operations
  - Mock WebSocket connections in tests
  - _Requirements: All_

- [ ] 19. Write unit tests for components
  - Test GameListComponent game display and interactions
  - Test LobbyComponent player list and start logic
  - Test GameComponent phase switching
  - Test InputPhaseComponent form validation
  - Test CanvasComponent drawing operations
  - Test GuessPhaseComponent display and form
  - Test ResultsComponent chain navigation
  - _Requirements: All_

- [ ] 20. Write property-based tests
  - [ ]* 20.1 Property test for canvas serialization
    - **Property 1: Canvas serialization round-trip preserves strokes**
    - **Validates: Requirements 8.8**
  - [ ]* 20.2 Property test for form validation
    - **Property 2: Form validation rejects invalid input**
    - **Validates: Requirements 7.2, 9.3**
  - [ ]* 20.3 Property test for timer countdown
    - **Property 3: Timer countdown decreases monotonically**
    - **Validates: Requirements 6.3**
  - [ ]* 20.4 Property test for phase transitions
    - **Property 4: Phase transitions preserve game state**
    - **Validates: Requirements 6.5**
  - [ ]* 20.5 Property test for reconnection
    - **Property 5: WebSocket reconnection restores state**
    - **Validates: Requirements 15.3**

- [ ] 21. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
