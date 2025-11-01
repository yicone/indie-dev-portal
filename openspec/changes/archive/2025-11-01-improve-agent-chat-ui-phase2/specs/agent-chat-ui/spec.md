# agent-chat-ui Specification Delta - Phase 2

## ADDED Requirements

### Requirement: Session Rename

The system SHALL allow users to rename sessions for better organization and identification.

#### Scenario: Rename active session

- **WHEN** user clicks the edit icon next to the active session name
- **THEN** the session name becomes editable inline
- **AND** save and cancel buttons appear
- **AND** the input field is pre-filled with current session name
- **AND** the input field is focused and text is selected

#### Scenario: Save renamed session

- **WHEN** user edits the session name and clicks save
- **THEN** the session name is updated in the UI
- **AND** the new name is persisted to the backend
- **AND** the edit mode is exited
- **AND** a success indicator is shown briefly

#### Scenario: Cancel rename

- **WHEN** user clicks cancel during rename
- **THEN** the original session name is restored
- **AND** the edit mode is exited
- **AND** no changes are persisted

#### Scenario: Validate session name

- **WHEN** user attempts to save an empty session name
- **THEN** a validation error is displayed
- **AND** the save button is disabled
- **AND** an error message "Session name cannot be empty" is shown

#### Scenario: Validate name length

- **WHEN** user enters a session name longer than 100 characters
- **THEN** the input is truncated at 100 characters
- **AND** a character count indicator shows "100/100"
- **AND** further input is prevented

### Requirement: Message Retry

The system SHALL provide retry functionality for failed messages to improve reliability.

#### Scenario: Display failed message

- **WHEN** a message fails to send
- **THEN** the message is displayed with a failed status indicator
- **AND** a red error icon appears next to the message
- **AND** the message text is shown with reduced opacity (60%)
- **AND** a retry button appears on hover

#### Scenario: Retry failed message

- **WHEN** user clicks the retry button on a failed message
- **THEN** the message is resent via WebSocket
- **AND** the retry button shows a loading spinner
- **AND** the message opacity returns to 100%
- **AND** the error icon is replaced with a sending indicator

#### Scenario: Successful retry

- **WHEN** a retried message is successfully sent
- **THEN** the message status changes to 'sent'
- **AND** the loading spinner is removed
- **AND** a success indicator (checkmark) appears briefly
- **AND** the message appears in normal sent state

#### Scenario: Failed retry

- **WHEN** a retried message fails again
- **THEN** the message returns to failed state
- **AND** the error icon reappears
- **AND** the retry button is shown again
- **AND** an error message is displayed in the error banner

#### Scenario: Multiple retry attempts

- **WHEN** user retries a message multiple times
- **THEN** each retry attempt is tracked
- **AND** after 3 failed attempts, a "Contact support" message is shown
- **AND** the retry button remains available
- **AND** retry count is not shown to user (internal only)

### Requirement: Session Export

The system SHALL allow users to export session conversations for archival and sharing purposes.

#### Scenario: Export to JSON

- **WHEN** user selects "Export as JSON" from the session menu
- **THEN** all messages in the session are exported
- **AND** the export includes session metadata (id, repo, created date, status)
- **AND** the export includes message metadata (id, role, timestamp, content)
- **AND** a JSON file is downloaded with name "session-[repo-name]-[date].json"
- **AND** the JSON is properly formatted and indented

#### Scenario: Export to Markdown

- **WHEN** user selects "Export as Markdown" from the session menu
- **THEN** all messages are formatted as Markdown
- **AND** user messages are prefixed with "**User:**"
- **AND** agent messages are prefixed with "**Agent:**"
- **AND** code blocks are preserved with syntax highlighting markers
- **AND** timestamps are included as comments
- **AND** a .md file is downloaded with name "session-[repo-name]-[date].md"

#### Scenario: Export empty session

- **WHEN** user attempts to export a session with no messages
- **THEN** a warning message is displayed
- **AND** the export proceeds with session metadata only
- **AND** the file contains a note "No messages in this session"

#### Scenario: Export large session

- **WHEN** user exports a session with 100+ messages
- **THEN** a progress indicator is shown
- **AND** the export completes without timeout
- **AND** all messages are included in the export
- **AND** the file size is reasonable (< 10MB for typical sessions)

#### Scenario: Export includes system messages

- **WHEN** a session contains system messages (e.g., "Session created")
- **THEN** system messages are included in the export
- **AND** system messages are clearly marked as "**System:**"
- **AND** system messages are styled differently in Markdown (italic)

### Requirement: Keyboard Shortcuts

The system SHALL provide keyboard shortcuts for common actions to improve productivity.

#### Scenario: Focus session selector

- **WHEN** user presses Cmd/Ctrl+K
- **THEN** the session dropdown receives focus
- **AND** the dropdown opens automatically
- **AND** user can navigate sessions with arrow keys
- **AND** Enter selects the highlighted session

#### Scenario: Create new session

- **WHEN** user presses Cmd/Ctrl+N
- **THEN** the repository selector dropdown opens
- **AND** the dropdown receives focus
- **AND** user can navigate repositories with arrow keys
- **AND** Enter creates a session with the selected repository

#### Scenario: Export current session

- **WHEN** user presses Cmd/Ctrl+E
- **THEN** the export format selector appears
- **AND** user can choose JSON or Markdown with arrow keys
- **AND** Enter triggers the export

#### Scenario: Rename current session

- **WHEN** user presses Cmd/Ctrl+R
- **THEN** the current session enters rename mode
- **AND** the session name input is focused
- **AND** the text is selected for easy replacement

#### Scenario: Close panel

- **WHEN** user presses Esc
- **THEN** the agent chat panel closes
- **AND** focus returns to the main content area
- **AND** any unsaved changes prompt a confirmation

#### Scenario: Show keyboard shortcuts help

- **WHEN** user presses "?" key
- **THEN** a modal or popover displays all available shortcuts
- **AND** shortcuts are grouped by category (Session, Message, Navigation)
- **AND** platform-specific modifiers are shown (Cmd for Mac, Ctrl for Windows/Linux)
- **AND** the help can be dismissed with Esc or clicking outside

#### Scenario: Prevent browser conflicts

- **WHEN** a keyboard shortcut is triggered
- **THEN** the default browser action is prevented
- **AND** only the app-specific action is executed
- **AND** shortcuts don't interfere with text input fields

### Requirement: Enhanced Error Recovery

The system SHALL provide improved error recovery mechanisms to help users resolve issues quickly.

#### Scenario: Retry from error banner

- **WHEN** an error banner is displayed for a failed action
- **THEN** a "Retry" button appears in the error banner
- **AND** clicking retry re-attempts the failed action
- **AND** the error banner shows a loading state during retry
- **AND** the banner disappears on successful retry

#### Scenario: Auto-retry with backoff

- **WHEN** a network error occurs during session creation
- **THEN** the system automatically retries after 2 seconds
- **AND** if the retry fails, it waits 4 seconds before the next attempt
- **AND** if the second retry fails, it waits 8 seconds
- **AND** after 3 failed attempts, auto-retry stops
- **AND** a manual retry button is shown

#### Scenario: Error with action suggestions

- **WHEN** a 429 rate limit error occurs
- **THEN** the error message includes "Please wait 30 seconds and try again"
- **AND** a countdown timer shows remaining wait time
- **AND** the retry button is disabled during the countdown
- **AND** the retry button auto-enables when countdown reaches zero

#### Scenario: Report issue link

- **WHEN** an unexpected error occurs (500, unknown)
- **THEN** the error banner includes a "Report Issue" link
- **AND** clicking the link opens a pre-filled issue template
- **AND** the template includes error details (status code, message, timestamp)
- **AND** the template includes session context (session ID, repo)

## MODIFIED Requirements

None - All Phase 2 features are additive and don't modify existing requirements.
