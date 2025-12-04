# Design Document

## Overview

The Monday Painter shared models library provides type-safe, validated data structures for the game application. The library is implemented in TypeScript to provide compile-time type checking and runtime validation. All models are immutable by default and include serialization support for network transmission. The design emphasizes simplicity, type safety, and consistency across frontend and backend implementations.

## Architecture

### Module Structure

```
models/
├── types/
│   ├── game.ts          # Game model and types
│   ├── player.ts        # Player model and types
│   ├── room.ts          # Room model and types
│   ├── chain.ts         # Chain Entry model and types
│   ├── drawing.ts       # Drawing Data and Stroke models
│   └── enums.ts         # Shared enumerations
├── validation/
│   ├── validators.ts    # Validation functions
│   └── schemas.ts       # Validation schemas
├── serialization/
│   ├── serializers.ts   # JSON serialization
│   └── deserializers.ts # JSON deserialization
├── constants.ts         # Application constants
└── index.ts            # Public API exports
```

## Components and Interfaces

### Type Definitions

#### Enumerations

```typescript
enum GameState {
  LOBBY = 'lobby',
  STARTED = 'started',
  ENDED = 'ended'
}

enum Phase {
  INPUT = 'input',
  DRAW = 'draw',
  GUESS = 'guess'
}

enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected'
}

enum EntryType {
  PROMPT = 'prompt',
  DRAWING = 'drawing',
  GUESS = 'guess'
}

enum ToolType {
  BRUSH = 'brush',
  ERASER = 'eraser'
}
```

#### Core Interfaces

```typescript
interface Game {
  id: string;
  state: GameState;
  hostId: string;
  players: Player[];
  rooms: Room[];
  maxPlayers: number;
  createdAt: number;
  name?: string;
}

interface Player {
  id: string;
  displayName: string;
  connectionStatus: ConnectionStatus;
  joinedAt: number;
  currentRoomId: string | null;
}

interface Room {
  id: string;
  index: number;
  phase: Phase;
  currentPlayerId: string | null;
  chain: ChainEntry[];
  phaseStartedAt: number;
  phaseDuration: number;
}

interface ChainEntry {
  type: EntryType;
  playerId: string;
  content?: string;
  drawingData?: DrawingData;
  timestamp: number;
}

interface DrawingData {
  strokes: Stroke[];
  width: number;
  height: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  tool: ToolType;
}

interface Point {
  x: number;
  y: number;
}
```

### Validation Layer

The validation layer uses a schema-based approach with runtime type checking:

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Validator functions
function validateGame(game: unknown): ValidationResult;
function validatePlayer(player: unknown): ValidationResult;
function validateRoom(room: unknown): ValidationResult;
function validateChainEntry(entry: unknown): ValidationResult;
function validateDrawingData(data: unknown): ValidationResult;
function validateStroke(stroke: unknown): ValidationResult;
```

### Serialization Layer

```typescript
// Serialization
function serializeGame(game: Game): string;
function serializePlayer(player: Player): string;
function serializeRoom(room: Room): string;

// Deserialization with validation
function deserializeGame(json: string): Game;
function deserializePlayer(json: string): Player;
function deserializeRoom(json: string): Room;
```

## Data Models

### Game Model

- **id**: UUID v4 string
- **state**: One of GameState enum values
- **hostId**: References a Player id
- **players**: Array of Player objects
- **rooms**: Array of Room objects
- **maxPlayers**: Number between 3-10
- **createdAt**: Unix timestamp in milliseconds
- **name**: Optional string for game identification

### Player Model

- **id**: UUID v4 string
- **displayName**: String, 1-20 characters
- **connectionStatus**: One of ConnectionStatus enum values
- **joinedAt**: Unix timestamp in milliseconds
- **currentRoomId**: String or null

### Room Model

- **id**: UUID v4 string
- **index**: Zero-based room number
- **phase**: One of Phase enum values
- **currentPlayerId**: String or null
- **chain**: Array of ChainEntry objects
- **phaseStartedAt**: Unix timestamp in milliseconds
- **phaseDuration**: Duration in seconds

### Chain Entry Model

- **type**: One of EntryType enum values
- **playerId**: References a Player id
- **content**: String for prompts/guesses (3-100 chars)
- **drawingData**: DrawingData object for drawings
- **timestamp**: Unix timestamp in milliseconds

### Drawing Data Model

- **strokes**: Array of Stroke objects
- **width**: Canvas width in pixels
- **height**: Canvas height in pixels

### Stroke Model

- **points**: Array of Point objects (minimum 2)
- **color**: Hex color string (e.g., "#FF0000")
- **width**: Number between 1-50
- **tool**: One of ToolType enum values

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Serialization round-trip preserves data

*For any* valid Game model, serializing then deserializing should produce an equivalent Game object with all fields intact.
**Validates: Requirements 8.2, 8.3**

### Property 2: Validation rejects invalid data

*For any* object with invalid field values (e.g., negative numbers, wrong types, out-of-range values), validation should return valid: false with descriptive errors.
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 3: Hex color validation accepts valid colors

*For any* string in valid hex color format (#RRGGBB or #RGB), color validation should accept the value.
**Validates: Requirements 7.2**

### Property 4: Display name length validation enforces bounds

*For any* string with length outside 1-20 characters, Player validation should reject the displayName field.
**Validates: Requirements 7.2**

## Error Handling

### Validation Errors

- Return structured ValidationResult with field-specific errors
- Never throw exceptions during validation
- Provide clear, actionable error messages

### Serialization Errors

- Throw TypeError for invalid input types
- Throw ValidationError for data that fails validation
- Include original data in error context for debugging

### Operation Errors

- Throw Error for invalid operations (e.g., adding player to full game)
- Use descriptive error messages with context
- Validate preconditions before performing operations

## Testing Strategy

### Unit Tests

- Test each validation function with valid and invalid inputs
- Test serialization/deserialization with various data structures
- Test operation functions for correct behavior
- Test edge cases (empty arrays, null values, boundary values)
- Test error conditions and error messages

### Property-Based Tests

Property-based tests will use the `fast-check` library for TypeScript. Each test should run a minimum of 100 iterations.

- **Property 1**: Test serialization round-trip with randomly generated Game objects
- **Property 2**: Test validation with randomly generated invalid data
- **Property 3**: Test hex color validation with random color strings
- **Property 4**: Test display name validation with random string lengths

Each property-based test must be tagged with a comment referencing the design document property using the format: `**Feature: monday-painter-models, Property {number}: {property_text}**`
