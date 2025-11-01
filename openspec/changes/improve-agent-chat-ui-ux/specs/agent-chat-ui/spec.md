# agent-chat-ui Specification Delta

## ADDED Requirements

### Requirement: Session Archiving

The system SHALL provide functionality to archive sessions to keep the session list manageable.

#### Scenario: Archive active session

- **WHEN** user clicks "Archive Session" button on an active session
- **THEN** a confirmation dialog appears
- **AND** user confirms the archiving
- **AND** the session status is updated to 'archived'
- **AND** the session is removed from the default session list
- **AND** if the archived session was active, it is cleared from the active session

#### Scenario: View archived sessions

- **WHEN** user clicks "Show Archived" toggle button
- **THEN** the button text changes to "Hide Archived"
- **AND** archived sessions appear in the session dropdown with "(archived)" label
- **AND** user can select an archived session to view its history

#### Scenario: Hide archived sessions

- **WHEN** user clicks "Hide Archived" toggle button
- **THEN** the button text changes to "Show Archived"
- **AND** archived sessions are removed from the session dropdown
- **AND** only active and suspended sessions are visible

#### Scenario: Archived session empty state

- **WHEN** user selects an archived session
- **THEN** the messages area displays an Archive icon
- **AND** shows "Archived Session" title
- **AND** shows descriptive message about viewing history only
- **AND** the input area is disabled
- **AND** the send button is disabled
- **AND** the "Archive Session" button is hidden

### Requirement: Message Copy Functionality

The system SHALL provide one-click copy functionality for messages and code blocks.

#### Scenario: Copy message content

- **WHEN** user hovers over a message
- **THEN** a copy button appears with fade-in animation
- **AND** user clicks the copy button
- **AND** the message content is copied to clipboard
- **AND** the copy button shows a checkmark icon for 2 seconds
- **AND** the button returns to copy icon after 2 seconds

#### Scenario: Copy code block

- **WHEN** user hovers over a code block in an agent message
- **THEN** a copy button appears in the top-right corner of the code block
- **AND** user clicks the copy button
- **AND** the code content is copied to clipboard without syntax highlighting markup
- **AND** the copy button shows a checkmark icon for 2 seconds
- **AND** the button returns to copy icon after 2 seconds

### Requirement: Syntax Highlighting

The system SHALL provide syntax highlighting for code blocks to improve code readability.

#### Scenario: Display syntax-highlighted code

- **WHEN** an agent message contains a code block with language specification
- **THEN** the code block is rendered with syntax highlighting
- **AND** uses VS Code Dark Plus theme for consistency
- **AND** highlights keywords, strings, comments, and other syntax elements
- **AND** maintains proper indentation and formatting

#### Scenario: Detect code language

- **WHEN** a code block has a language specified (e.g., ```javascript)
- **THEN** the system detects the language from the markdown fence
- **AND** applies language-specific syntax highlighting rules
- **AND** supports common languages (JavaScript, TypeScript, Python, Go, SQL, etc.)

#### Scenario: Inline code rendering

- **WHEN** a message contains inline code (single backticks)
- **THEN** the code is rendered without syntax highlighting
- **AND** uses monospace font
- **AND** has subtle background color for distinction

#### Scenario: Code block styling

- **WHEN** a code block is rendered
- **THEN** it has rounded corners (0.5rem border-radius)
- **AND** has proper spacing (margin-top and margin-bottom)
- **AND** uses consistent font size (0.875rem)
- **AND** maintains copy button functionality

## MODIFIED Requirements

### Requirement: Session Management UI

The system SHALL provide UI for creating, switching, and managing agent sessions with different states, including archiving functionality.

#### Scenario: Create new session

- **WHEN** user clicks "New Session" button
- **THEN** a repository selector appears
- **AND** user selects a repository
- **AND** a new session is created and becomes active

#### Scenario: Switch sessions

- **WHEN** user selects a different session from dropdown
- **THEN** the active session changes
- **AND** messages for the new session are loaded
- **AND** input is enabled/disabled based on session status

#### Scenario: Session status display

- **WHEN** viewing the session dropdown
- **THEN** each session displays the repository name (if available)
- **AND** falls back to "Session [id-prefix]" if no repository name exists
- **AND** shows session status after the name (e.g., "repo-name - active")
- **AND** archived sessions show "(archived)" label when "Show Archived" is enabled
- **AND** sessions are filtered based on "Show Archived" toggle state

#### Scenario: Display active repository context

- **WHEN** a session is active
- **THEN** the panel header displays the current repository name
- **AND** provides clear visual context for the current conversation
- **AND** helps users identify which repository they are working with

#### Scenario: Archive session button

- **WHEN** an active or suspended session is selected
- **THEN** an "Archive Session" button is displayed
- **AND** the button shows Archive icon
- **AND** clicking the button triggers confirmation dialog
- **AND** the button is hidden for already archived sessions

### Requirement: Chat Message Display

The system SHALL display chat messages with role-based styling, timestamps, and copy functionality.

#### Scenario: Display user message

- **WHEN** a user message is sent
- **THEN** the message appears right-aligned with user avatar
- **AND** displays the message text
- **AND** shows timestamp in relative format (e.g., "2 minutes ago")
- **AND** shows copy button on hover

#### Scenario: Display agent message

- **WHEN** an agent message is received
- **THEN** the message appears left-aligned with agent avatar
- **AND** displays the message content with markdown rendering
- **AND** shows timestamp
- **AND** shows copy button on hover
- **AND** code blocks have syntax highlighting
- **AND** code blocks have their own copy button

#### Scenario: Display streaming message

- **WHEN** agent is sending a partial response
- **THEN** the message shows a streaming indicator
- **AND** content updates in real-time as chunks arrive
- **AND** auto-scrolls to show latest content

#### Scenario: Message hover effects

- **WHEN** user hovers over a message
- **THEN** the copy button fades in with smooth opacity transition
- **AND** the button is positioned in the bottom-right of the message
- **AND** the button has proper z-index to appear above content

#### Scenario: Message spacing and layout

- **WHEN** messages are displayed in the chat area
- **THEN** each message has consistent vertical spacing (minimum 1rem between messages)
- **AND** message content has adequate padding for comfortable reading
- **AND** the overall layout provides a comfortable reading experience
- **AND** messages do not appear cramped or cluttered

### Requirement: Empty State Display

The system SHALL provide informative empty states with icons for different session conditions.

#### Scenario: No active session

- **WHEN** no session is selected
- **THEN** displays "No active session" message
- **AND** shows instruction to select or create a session

#### Scenario: Archived session empty state

- **WHEN** an archived session is selected
- **THEN** displays Archive icon (centered, 8x8, 50% opacity)
- **AND** shows "Archived Session" title
- **AND** shows descriptive message about viewing history only
- **AND** uses consistent spacing (space-y-2)

#### Scenario: Suspended session empty state

- **WHEN** a suspended session is selected
- **THEN** displays AlertCircle icon (centered, 8x8, 50% opacity)
- **AND** shows "Session is suspended" title
- **AND** shows descriptive message about resumption
- **AND** uses consistent spacing (space-y-2)

#### Scenario: Empty conversation

- **WHEN** an active session has no messages
- **THEN** displays "Start a conversation" message
- **AND** shows instruction to ask questions
