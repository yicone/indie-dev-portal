# agent-session-api Specification

## Purpose

TBD - created by archiving change add-agent-chat-ui. Update Purpose after archive.

## Requirements

### Requirement: Session State Management

The system SHALL support multiple session states to enable future session resumption capabilities.

#### Scenario: Create session with initial state

- **WHEN** POST /sessions with repository ID
- **THEN** creates new session with status 'active'
- **AND** returns session ID and metadata
- **AND** initializes agent process

#### Scenario: Update session to suspended state

- **WHEN** server shutdown is initiated
- **THEN** active sessions are updated to 'suspended' status
- **AND** session data is preserved in database
- **AND** agent processes are terminated gracefully

#### Scenario: Query sessions by status

- **WHEN** GET /sessions with optional status filter
- **THEN** returns sessions matching the filter
- **AND** includes session metadata (status, repo, timestamps)
- **AND** excludes error and archived sessions by default

### Requirement: Session Status Types

The system SHALL support the following session statuses for future extensibility.

#### Scenario: Active session

- **WHEN** session is actively processing requests
- **THEN** status is 'active'
- **AND** input is enabled
- **AND** agent process is running

#### Scenario: Suspended session

- **WHEN** server restarts or agent process terminates
- **THEN** status is 'suspended'
- **AND** session data is preserved
- **AND** may be resumable in future (agent-dependent)

#### Scenario: Archived session

- **WHEN** user explicitly archives session
- **THEN** status is 'archived'
- **AND** session is hidden from UI by default
- **AND** cannot accept new messages

#### Scenario: Error session

- **WHEN** agent encounters fatal error
- **THEN** status is 'error'
- **AND** session is hidden from UI
- **AND** error details are logged

### Requirement: Message History API

The system SHALL provide API to retrieve historical messages for sessions.

#### Scenario: Load session messages

- **WHEN** GET /sessions/:id/messages
- **THEN** returns all messages for the session
- **AND** includes parsed content for display
- **AND** orders messages by timestamp
- **AND** works for any session status
