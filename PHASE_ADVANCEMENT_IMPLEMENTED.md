# Phase Advancement Logic Implemented

## Overview
Implemented backend logic that waits for ALL players to submit before advancing to the next phase.

## How It Works

### Submit Prompt (Input Phase → Draw Phase)
1. Player submits prompt
2. Backend adds entry to player's room chain
3. Backend sends confirmation to player
4. Backend checks if ALL rooms have a prompt entry
5. If yes: Advance ALL rooms to DRAW phase and broadcast
6. If no: Wait for other players

### Submit Drawing (Draw Phase → Guess Phase)
1. Player submits drawing
2. Backend adds entry to player's room chain
3. Backend sends confirmation to player
4. Backend counts rooms in DRAW phase that have submitted
5. If all submitted: Advance ALL draw phase rooms to GUESS phase
6. If not: Wait for other players

### Submit Guess (Guess Phase → Next Round or End)
1. Player submits guess
2. Backend adds entry to player's room chain
3. Backend sends confirmation to player
4. Backend counts rooms in GUESS phase that have submitted
5. If all submitted:
   - Check if game is complete (all rooms have all entries)
   - If complete: End game
   - If not: Advance to next round (DRAW phase)
6. If not: Wait for other players

## Files Modified

### Backend
1. `backend/src/handlers/submit-prompt.handler.ts`
2. `backend/src/handlers/submit-drawing.handler.ts`
3. `backend/src/handlers/submit-guess.handler.ts`

### Frontend
1. `frontend/src/app/core/services/game.service.ts`
   - Added `phaseAdvanced` message handler
   - Updated `updateCurrentRoom()` to find player's actual room

## Testing
1. Start game with 3 players
2. All write prompts - game advances when last player submits
3. All draw - game advances when last player submits
4. All guess - game advances or ends when last player submits
