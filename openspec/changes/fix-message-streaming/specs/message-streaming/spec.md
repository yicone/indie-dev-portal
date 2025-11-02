# Message Streaming Specification

## ADDED Requirements

### Requirement: Streaming Protocol

The system SHALL implement a WebSocket-based streaming protocol for agent messages that ensures message integrity across page refreshes.

#### Scenario: Start streaming message

- **WHEN** agent begins generating a response
- **THEN** backend sends `message.start` event with unique messageId
- **AND** frontend creates placeholder message with streaming state
- **AND** message is marked as incomplete

#### Scenario: Stream content chunks

- **WHEN** agent generates content incrementally
- **THEN** backend sends `message.chunk` events with same messageId
- **AND** frontend appends content to existing message
- **AND** UI displays streaming progress indicator

#### Scenario: Complete streaming message

- **WHEN** agent finishes generating response
- **THEN** backend sends `message.end` event with complete content
- **AND** backend stores single complete message in database
- **AND** frontend marks message as complete
- **AND** streaming indicator is removed

### Requirement: Message Storage

The system SHALL store only complete, merged messages in the database.

#### Scenario: Store complete message

- **WHEN** streaming completes with `message.end`
- **THEN** backend stores one message record with complete content
- **AND** message includes all streamed content
- **AND** no intermediate chunks are stored

#### Scenario: Load historical messages

- **WHEN** user loads session history
- **THEN** backend returns complete messages
- **AND** each message represents full agent response
- **AND** messages display identically to when first streamed

### Requirement: Frontend State Management

The system SHALL maintain consistent message state during streaming and after page refresh.

#### Scenario: Handle streaming state

- **WHEN** receiving `message.start`
- **THEN** create message with `isStreaming: true`
- **AND** display streaming indicator
- **AND** prepare for content updates

#### Scenario: Update streaming content

- **WHEN** receiving `message.chunk`
- **THEN** append content to existing message
- **AND** maintain message order
- **AND** auto-scroll to show new content

#### Scenario: Finalize message

- **WHEN** receiving `message.end`
- **THEN** set `isStreaming: false`
- **AND** remove streaming indicator
- **AND** mark message as complete

#### Scenario: Refresh consistency

- **WHEN** page refreshes during or after streaming
- **THEN** load complete messages from backend
- **AND** display messages in single bubbles
- **AND** maintain same appearance as before refresh

### Requirement: Error Handling

The system SHALL gracefully handle streaming errors and network interruptions.

#### Scenario: Network interruption during streaming

- **WHEN** connection lost during `message.chunk`
- **THEN** mark message as incomplete
- **AND** display error indicator
- **AND** allow retry when connection restored

#### Scenario: Streaming timeout

- **WHEN** no `message.end` received within timeout period
- **THEN** mark message as incomplete
- **AND** display timeout message
- **AND** preserve partial content

#### Scenario: Duplicate message events

- **WHEN** receiving duplicate `message.start` for same messageId
- **THEN** ignore duplicate event
- **AND** continue with existing message
- **AND** log warning for debugging

### Requirement: Backward Compatibility

The system SHALL support gradual migration from old message protocol.

#### Scenario: Handle legacy messages

- **WHEN** receiving old-format messages without streaming events
- **THEN** display messages using fallback logic
- **AND** maintain existing functionality
- **AND** log deprecation warning

#### Scenario: Mixed protocol support

- **WHEN** session contains both old and new format messages
- **THEN** display all messages correctly
- **AND** apply appropriate rendering for each format
- **AND** maintain message order

### Requirement: Performance

The system SHALL maintain responsive UI during message streaming.

#### Scenario: Large message streaming

- **WHEN** streaming message exceeds 10KB
- **THEN** UI remains responsive
- **AND** content updates smoothly
- **AND** no visible lag or freezing

#### Scenario: Concurrent streaming

- **WHEN** multiple messages stream simultaneously in different sessions
- **THEN** each message updates independently
- **AND** messages are isolated by sessionId
- **AND** no cross-session message pollution occurs
- **AND** UI performance remains acceptable
- **AND** message order is preserved within each session

### Requirement: WebSocket Message Format

The system SHALL use standardized message format for streaming events.

#### Scenario: Message start format

- **WHEN** sending `message.start` event
- **THEN** include required fields: type, sessionId, messageId, role, timestamp
- **AND** messageId is unique and stable across chunks
- **AND** role is 'agent'

#### Scenario: Message chunk format

- **WHEN** sending `message.chunk` event
- **THEN** include same messageId as start event
- **AND** include incremental content in content.text
- **AND** maintain content type consistency

#### Scenario: Message end format

- **WHEN** sending `message.end` event
- **THEN** include complete merged content
- **AND** set isComplete flag to true
- **AND** include final timestamp
