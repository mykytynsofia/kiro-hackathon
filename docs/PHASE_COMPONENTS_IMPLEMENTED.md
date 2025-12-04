# Phase Components Implemented

## Overview
Implemented all game phase components with waiting states so players can submit their inputs and wait for others to finish before the game advances to the next phase.

## Components Implemented

### 1. ✅ InputPhaseComponent (`input-phase.component.ts`)
**Purpose**: Players write text prompts for others to draw

**Features**:
- Text area with 3-100 character validation
- Real-time character count display
- Warning when below minimum (3 characters)
- Submit button (disabled until valid)
- "Submitted! Waiting for others..." state after submission
- Spinner animation while waiting
- Reactive form with FormControl validation

**User Flow**:
1. Player sees "Write a Prompt" instruction
2. Types in textarea (3-100 chars)
3. Clicks "Submit Prompt"
4. Button changes to "Submitted! Waiting for others..."
5. Spinner shows with message "Waiting for other players to submit their prompts..."
6. Automatically advances when all players submit

### 2. ✅ DrawPhaseComponent (`draw-phase.component.ts`)
**Purpose**: Players draw the prompt they received

**Features**:
- Displays the prompt to draw (large, prominent)
- Canvas placeholder (HTML5 canvas to be implemented later)
- Submit button
- "Submitted! Waiting for others..." state after submission
- Spinner animation while waiting
- Gets prompt from room chain (last entry)

**User Flow**:
1. Player sees "Draw This!" with the prompt
2. Draws on canvas (placeholder for now)
3. Clicks "Submit Drawing"
4. Button changes to "Submitted! Waiting for others..."
5. Spinner shows with message "Waiting for other players to finish drawing..."
6. Automatically advances when all players submit

### 3. ✅ GuessPhaseComponent (`guess-phase.component.ts`)
**Purpose**: Players guess what was drawn

**Features**:
- Displays the drawing (placeholder for now)
- Text input with 3-100 character validation
- Real-time character count display
- Warning when below minimum
- Submit button (disabled until valid)
- "Submitted! Waiting for others..." state after submission
- Spinner animation while waiting
- Gets drawing from room chain (last entry)

**User Flow**:
1. Player sees "What was drawn?" with the drawing
2. Types guess in input field (3-100 chars)
3. Clicks "Submit Guess"
4. Button changes to "Submitted! Waiting for others..."
5. Spinner shows with message "Waiting for other players to submit their guesses..."
6. Automatically advances when all players submit

### 4. ✅ TransitionComponent (`transition.component.ts`)
**Purpose**: Generic waiting/loading screen between phases

**Features**:
- Large spinner animation
- Customizable message (via @Input)
- Customizable sub-message (via @Input)
- Clean, centered design

**Usage**:
```typescript
<app-transition 
  [message]="'Waiting for game to start...'"
  [subMessage]="'The host will start the game soon'">
</app-transition>
```

### 5. ✅ Updated GameComponent
**Purpose**: Main game container that switches between phase components

**Features**:
- Shows game name in header
- Phase badge showing current phase (Write Prompt / Draw / Guess)
- Leave game button with confirmation
- Dynamically switches between phase components based on `currentPhase`
- Shows TransitionComponent when no phase (waiting for game start)
- Restores game state on load
- Auto-redirects to home if no game
- Auto-redirects to results when game ends

**Phase Switching Logic**:
```typescript
*ngIf="currentPhase === Phase.INPUT"  → InputPhaseComponent
*ngIf="currentPhase === Phase.DRAW"   → DrawPhaseComponent
*ngIf="currentPhase === Phase.GUESS"  → GuessPhaseComponent
*ngIf="!currentPhase"                 → TransitionComponent
```

## How It Works

### Submission Flow
1. Player fills out form (prompt/drawing/guess)
2. Clicks submit button
3. Component calls `gameService.submitPrompt/Drawing/Guess()`
4. Component sets `submitted = true`
5. UI shows "Submitted! Waiting for others..." with spinner
6. Backend receives submission
7. Backend checks if all players in room have submitted
8. When all submitted, backend advances phase
9. Backend broadcasts phase change to all players
10. Frontend receives phase change message
11. GameComponent switches to next phase component
12. New component loads with fresh state

### Waiting State
- Each phase component has a `submitted` boolean flag
- When `submitted = true`:
  - Submit button is disabled and shows "Submitted! Waiting for others..."
  - Waiting message appears with spinner
  - Form inputs are disabled
- Component listens to `currentPhase$` observable
- When phase changes away, `submitted` resets to `false`

## Files Created/Modified

### New Files
1. `frontend/src/app/features/game/input-phase/input-phase.component.ts`
2. `frontend/src/app/features/game/draw-phase/draw-phase.component.ts`
3. `frontend/src/app/features/game/guess-phase/guess-phase.component.ts`
4. `frontend/src/app/features/game/transition/transition.component.ts`

### Modified Files
1. `frontend/src/app/features/game/game.component.ts` - Complete rewrite to use phase components
2. `frontend/src/app/app.module.ts` - Registered all new components

## What's Still Placeholder

### Canvas Drawing (DrawPhaseComponent)
- Currently shows placeholder div
- TODO: Implement HTML5 canvas with:
  - Mouse/touch event handlers
  - Stroke tracking
  - Color picker
  - Brush size selector
  - Undo/clear buttons
  - getDrawingData() method

### Canvas Display (GuessPhaseComponent)
- Currently shows placeholder div
- TODO: Implement readonly canvas that:
  - Renders DrawingData
  - Shows strokes from previous player

## Testing

### Test Input Phase
1. Start game with 3 players
2. All players should see "Write a Prompt"
3. Player 1 types "Draw a cat" and submits
4. Player 1 sees "Submitted! Waiting for others..."
5. Players 2 and 3 still see input form
6. When all 3 submit, everyone advances to Draw phase

### Test Draw Phase
1. After input phase completes
2. All players see "Draw This!" with their assigned prompt
3. Player draws (or clicks submit with placeholder)
4. Player sees "Submitted! Waiting for others..."
5. When all submit, everyone advances to Guess phase

### Test Guess Phase
1. After draw phase completes
2. All players see drawing from previous player
3. Player types guess and submits
4. Player sees "Submitted! Waiting for others..."
5. When all submit, game advances (next room or results)

## Next Steps
1. Implement HTML5 canvas drawing in DrawPhaseComponent
2. Implement canvas rendering in GuessPhaseComponent
3. Add timer auto-submit functionality
4. Implement ResultsComponent to show chains
5. Add visual feedback for phase transitions
6. Add sound effects (optional)
