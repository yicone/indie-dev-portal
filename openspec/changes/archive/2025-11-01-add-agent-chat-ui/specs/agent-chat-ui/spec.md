# agent-chat-ui Specification Delta

## ADDED Requirements

### Requirement: Agent Chat Panel Component

The system SHALL provide a slide-in chat panel for real-time agent conversations.

#### Scenario: Open chat panel

- **WHEN** user clicks the floating AI Assistant button
- **THEN** the chat panel slides in from the right side
- **AND** displays the active session or prompts to create new session
- **AND** panel width is 400px on desktop, full-screen on mobile

#### Scenario: Close chat panel

- **WHEN** user clicks the close button or presses Escape key
- **THEN** the panel slides out and disappears
- **AND** WebSocket connection remains active
- **AND** conversation state is preserved

### Requirement: Chat Message Display

The system SHALL display chat messages with role-based styling and timestamps.

#### Scenario: Display user message

- **WHEN** a user message is sent
- **THEN** the message appears right-aligned with user avatar
- **AND** displays the message text
- **AND** shows timestamp in relative format (e.g., "2 minutes ago")

#### Scenario: Display agent message

- **WHEN** an agent message is received
- **THEN** the message appears left-aligned with agent avatar
- **AND** displays the message content (text/plan/tool)
- **AND** shows timestamp

#### Scenario: Display streaming message

- **WHEN** agent is sending a partial response
- **THEN** the message shows a streaming indicator
- **AND** content updates in real-time as chunks arrive
- **AND** auto-scrolls to show latest content

### Requirement: Message Input

The system SHALL provide a text input for composing and sending messages.

#### Scenario: Send message via button

- **WHEN** user types text and clicks Send button
- **THEN** the message is sent via WebSocket
- **AND** input field is cleared
- **AND** message appears in chat immediately

#### Scenario: Send message via Enter key

- **WHEN** user types text and presses Enter (without Shift)
- **THEN** the message is sent
- **AND** Shift+Enter creates a new line

### Requirement: Session Management UI

The system SHALL provide UI for creating, switching, and managing agent sessions with different states.

#### Scenario: Create new session

- **WHEN** user clicks "New Session" button
- **THEN** a repository selector appears
- **AND** user selects a repository
- **AND** a new session is created and becomes active

#### Scenario: Switch sessions

- **WHEN** user selects a different session from the dropdown
- **THEN** the chat displays that session's messages
- **AND** input is enabled if session is active
- **AND** input is disabled if session is suspended or completed

#### Scenario: View suspended session

- **WHEN** user selects a suspended session
- **THEN** the chat displays historical messages in read-only mode
- **AND** shows "Session suspended - may be resumable" message
- **AND** input is disabled

#### Scenario: Filter sessions by status

- **WHEN** session list is displayed
- **THEN** shows active and completed sessions by default
- **AND** hides error and cancelled sessions
- **AND** suspended sessions are shown with resume indicator

### Requirement: Connection Status Indicator

The system SHALL display WebSocket connection status to the user.

#### Scenario: Show connected status

- **WHEN** WebSocket is connected
- **THEN** a green indicator appears
- **AND** no status message is shown

#### Scenario: Show disconnected status

- **WHEN** WebSocket is disconnected
- **THEN** a red indicator appears
- **AND** shows "Disconnected. Retrying..." message

### Requirement: Responsive Design

The system SHALL adapt the chat UI for different screen sizes.

#### Scenario: Desktop layout

- **WHEN** viewport width is ≥768px
- **THEN** panel slides in from right with 400px width
- **AND** main content remains visible

#### Scenario: Mobile layout

- **WHEN** viewport width is <768px
- **THEN** panel takes full screen
- **AND** slides in from bottom
