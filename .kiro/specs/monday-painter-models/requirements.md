# Requirements Document

## Introduction

This document specifies the requirements for the shared data models used across the Monday Painter application. These models define the core data structures for games, players, rooms, and game state that must be consistent between frontend and backend implementations. The models shall support serialization for network transmission and storage, validation of data integrity, and type safety across the application.

## Glossary

- **Data Model**: A structured representation of an entity with defined fields and types
- **Game Model**: The data structure representing a complete game session
- **Player Model**: The data structure representing a participant in a game
- **Room Model**: The data structure representing a player's workspace within a game
- **Chain Model**: The data structure representing the sequence of prompts, drawings, and guesses
- **Phase**: An enumeration of possible room states (input, draw, guess)
- **Game State**: An enumeration of possible game states (lobby, started, ended)
- **Validation**: Ensuring data conforms to expected types, ranges, and constraints
- **Serialization**: Converting data models to and from JSON format

## Requirements

### Requirement 1

**User Story:** As a developer, I want a Game model, so that I can represent game sessions consistently across the application.

#### Acceptance Criteria

1. THE Game model SHALL include a unique game identifier field of type string
2. THE Game model SHALL include a game state field with values lobby, started, or ended
3. THE Game model SHALL include a host player identifier field of type string
4. THE Game model SHALL include a players array containing Player model references
5. THE Game model SHALL include a rooms array containing Room model references
6. THE Game model SHALL include a maximum players field of type number with range 3 to 10
7. THE Game model SHALL include a created timestamp field of type number
8. THE Game model SHALL include an optional game name field of type string

### Requirement 2

**User Story:** As a developer, I want a Player model, so that I can represent participants consistently across the application.

#### Acceptance Criteria

1. THE Player model SHALL include a unique player identifier field of type string
2. THE Player model SHALL include a display name field of type string with length between 1 and 20 characters
3. THE Player model SHALL include a connection status field with values connected or disconnected
4. THE Player model SHALL include a joined timestamp field of type number
5. THE Player model SHALL include a current room identifier field of type string or null

### Requirement 3

**User Story:** As a developer, I want a Room model, so that I can represent player workspaces consistently across the application.

#### Acceptance Criteria

1. THE Room model SHALL include a unique room identifier field of type string
2. THE Room model SHALL include a room index field of type number
3. THE Room model SHALL include a current phase field with values input, draw, or guess
4. THE Room model SHALL include a current player identifier field of type string or null
5. THE Room model SHALL include a chain array containing Chain Entry models
6. THE Room model SHALL include a phase start timestamp field of type number
7. THE Room model SHALL include a phase duration field of type number in seconds

### Requirement 4

**User Story:** As a developer, I want a Chain Entry model, so that I can represent the sequence of prompts, drawings, and guesses.

#### Acceptance Criteria

1. THE Chain Entry model SHALL include an entry type field with values prompt, drawing, or guess
2. THE Chain Entry model SHALL include a player identifier field of type string indicating who created the entry
3. THE Chain Entry model SHALL include a content field of type string for prompts and guesses
4. THE Chain Entry model SHALL include a drawing data field of type object for drawings
5. THE Chain Entry model SHALL include a timestamp field of type number
6. WHEN entry type is prompt or guess, THE Chain Entry model SHALL require the content field
7. WHEN entry type is drawing, THE Chain Entry model SHALL require the drawing data field

### Requirement 5

**User Story:** As a developer, I want a Drawing Data model, so that I can represent canvas artwork consistently.

#### Acceptance Criteria

1. THE Drawing Data model SHALL include a strokes array containing Stroke models
2. THE Drawing Data model SHALL include a canvas width field of type number
3. THE Drawing Data model SHALL include a canvas height field of type number
4. THE Drawing Data model SHALL support serialization to JSON format
5. THE Drawing Data model SHALL validate that canvas dimensions are positive numbers

### Requirement 6

**User Story:** As a developer, I want a Stroke model, so that I can represent individual drawing paths.

#### Acceptance Criteria

1. THE Stroke model SHALL include a points array containing coordinate objects with x and y fields of type number
2. THE Stroke model SHALL include a color field of type string in hex format
3. THE Stroke model SHALL include a width field of type number between 1 and 50
4. THE Stroke model SHALL include a tool type field with values brush or eraser
5. THE Stroke model SHALL validate that points array contains at least 2 coordinate objects

### Requirement 7

**User Story:** As a developer, I want validation functions for all models, so that I can ensure data integrity.

#### Acceptance Criteria

1. WHEN a Game model is created or updated, THE system SHALL validate all required fields are present
2. WHEN a Player model is created or updated, THE system SHALL validate the display name length is between 1 and 20 characters
3. WHEN a Room model is created or updated, THE system SHALL validate the phase is a valid enum value
4. WHEN a Chain Entry model is created, THE system SHALL validate the entry type matches the content provided
5. WHEN validation fails, THE system SHALL return a descriptive error message indicating which field failed validation

### Requirement 8

**User Story:** As a developer, I want serialization functions for all models, so that I can transmit data over the network.

#### Acceptance Criteria

1. THE system SHALL provide a function to serialize Game models to JSON format
2. THE system SHALL provide a function to deserialize JSON to Game models
3. THE system SHALL provide serialization and deserialization for all model types
4. WHEN deserializing, THE system SHALL validate the data before creating model instances
5. WHEN serialization fails, THE system SHALL throw an error with details about the failure

### Requirement 9

**User Story:** As a developer, I want type definitions for all models, so that I can benefit from type safety in TypeScript.

#### Acceptance Criteria

1. THE system SHALL provide TypeScript interface definitions for all models
2. THE system SHALL provide TypeScript enum definitions for Game State, Phase, Connection Status, Entry Type, and Tool Type
3. THE system SHALL export all type definitions for use in other modules
4. THE system SHALL ensure type definitions match the validation rules
5. THE system SHALL provide utility types for partial updates and optional fields

### Requirement 10

**User Story:** As a developer, I want constants for model constraints, so that I can reference limits consistently across frontend and backend.

#### Acceptance Criteria

1. THE system SHALL define constants for minimum and maximum player counts
2. THE system SHALL define constants for phase durations (input, draw, guess)
3. THE system SHALL define constants for text length limits (display names, prompts, guesses)
4. THE system SHALL define constants for drawing constraints (stroke width range, canvas size limits)
5. THE system SHALL define constants for rate limiting and message size limits
6. THE system SHALL export all constants for use in validation and UI components
