# agent-chat-ui Specification

## Purpose

TBD - created by archiving change add-agent-chat-ui. Update Purpose after archive.

## Requirements

### Requirement: Agent Chat Panel Component

The system SHALL provide a slide-in chat panel with repository-aware header and consistent visual design.

#### Scenario: Open chat panel

- **WHEN** user clicks the floating AI Assistant button
- **THEN** the chat panel slides in from the right with spring animation
- **AND** the panel has a fixed width of 420px
- **AND** the panel has a dark theme background (crust color)
- **AND** the panel has a left border (surface1 color)
- **AND** displays the active session or prompts to create new session

#### Scenario: Close chat panel

- **WHEN** user clicks the close button or presses Escape key
- **THEN** the panel slides out and disappears
- **AND** WebSocket connection remains active
- **AND** conversation state is preserved

#### Scenario: Panel header structure

- **WHEN** viewing the chat panel header
- **THEN** the header displays Repository Selector on the left
- **AND** the header displays Plus button and Close button on the right
- **AND** the header has bottom border separation (surface0 color)
- **AND** header elements use consistent padding (px-4 py-3)
- **AND** below the header is the Session Selector with px-4 pb-3 padding

#### Scenario: Input area styling

- **WHEN** viewing the message input area
- **THEN** the input has surface0 background with surface1 border
- **AND** the input has mauve focus ring
- **AND** the send button has mauve background
- **AND** the send button is embedded in the input (absolute positioning)
- **AND** agent/model selectors are displayed above the input

### Requirement: Chat Message Display

The system SHALL display chat messages with role-based styling, compact spacing, timestamps, and copy functionality.

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

#### Scenario: Compact message spacing and layout

- **WHEN** messages are displayed in the chat area
- **THEN** each message has consistent vertical spacing (minimum 1rem between messages)
- **THEN** message bubbles have compact padding (px-3 py-2)
- **AND** messages are wrapped in a container with space-y-3
- **AND** the wrapper has py-4 padding
- **AND** user messages have base text color
- **AND** message bubbles maintain rounded-2xl corners
- **AND** proper spacing is maintained with typing indicator

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

The system SHALL provide UI for creating, switching, and managing agent sessions with repository-based filtering and quick session creation.

#### Scenario: Header with repository selector

- **WHEN** viewing the chat panel header
- **THEN** display a Repository Selector dropdown at the top left
- **AND** the selector shows "All Repositories" or selected repository name
- **AND** the selector has FolderGit2 icon and ChevronDown icon
- **AND** clicking opens dropdown with all available repositories
- **AND** selecting a repository filters sessions to show only that repo's sessions

#### Scenario: Quick session creation

- **WHEN** a repository is selected in the header
- **THEN** display a Plus button next to the repository selector
- **AND** the button is disabled when no repository is selected
- **AND** the button shows a ring highlight when repo is selected but no sessions exist
- **AND** clicking the button creates a new session for the selected repository immediately
- **AND** no dialog is shown - session is created directly

#### Scenario: Session selector with filtering

- **WHEN** viewing the session selector dropdown below the header
- **THEN** display a compact button (h-8) showing current session name
- **AND** the button is disabled when a repository is selected but has no sessions
- **AND** the button shows placeholder text based on filter state
- **AND** clicking opens dropdown with filtered sessions

#### Scenario: Session dropdown with search

- **WHEN** the session dropdown is opened
- **THEN** display a search input at the top with Search icon
- **AND** the search input filters sessions by name in real-time
- **AND** the dropdown shows filtered active sessions first
- **AND** the dropdown shows filtered archived sessions in a separate section
- **AND** the dropdown width is 380px with mantle background

#### Scenario: Session list item with hover actions

- **WHEN** hovering over a session in the dropdown
- **THEN** hide the timestamp
- **AND** show Edit2 (rename) icon
- **AND** show Archive icon
- **AND** clicking rename icon enters inline edit mode
- **AND** clicking archive icon archives the session with confirmation

#### Scenario: Inline session rename in dropdown

- **WHEN** user clicks rename icon on a session
- **THEN** switch to edit mode with input field
- **AND** the input is pre-filled with current name and focused
- **AND** display Check and X buttons
- **AND** pressing Enter or clicking Check saves the new name
- **AND** pressing Escape or clicking X cancels editing

#### Scenario: Repository-based empty states

- **WHEN** no repository is selected and no session is active
- **THEN** show "Select a repository or create a session" message
- **AND** display FolderGit2 icon

- **WHEN** a repository is selected but has no sessions
- **THEN** show "No Sessions Yet" message
- **AND** show "Create your first chat session" description
- **AND** display a "Create Session" button with mauve background

- **WHEN** a repository is selected and has sessions but none are active
- **THEN** show "Select a session from the dropdown above" message

#### Scenario: Switch sessions

- **WHEN** user selects a different session from dropdown
- **THEN** the active session changes
- **AND** messages for the new session are loaded
- **AND** input is enabled/disabled based on session status

#### Scenario: Session status display

- **WHEN** viewing the session dropdown
- **THEN** each session displays custom name (if set) or repository name
- **AND** displays repository name below in muted text (text-xs)
- **AND** displays last active time on the right (text-xs)
- **AND** shows a green dot indicator for the currently active session
- **AND** archived sessions show in separate section with reduced opacity

#### Scenario: Archive session action

- **WHEN** hovering over a session in the dropdown
- **THEN** display Archive icon on hover
- **AND** clicking triggers confirmation dialog
- **AND** archived sessions can be unarchived

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

- **WHEN** user clicks an archived session in the session dropdown
- **THEN** the archived session is selected and its history is displayed

#### Scenario: Archived session empty state

- **WHEN** user views an archived session
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

### Requirement: Empty State Display

The system SHALL provide informative empty states with repository context and different session conditions.

#### Scenario: Active session with no messages

- **WHEN** an active session has no messages
- **THEN** display a centered empty state with FolderGit2 icon
- **AND** the icon is in a rounded square container (w-16 h-16, rounded-2xl, bg-surface0)
- **AND** display "Start a Conversation" heading
- **AND** display helpful description text with repository name
- **AND** all text is center-aligned with proper spacing

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

### Requirement: Agent and Model Selector UI

The system SHALL provide compact agent and model selectors at the bottom of the panel.

#### Scenario: Selector layout

- **WHEN** viewing the input area
- **THEN** display agent and model selectors above the message input
- **AND** display a Plus button on the left for attachments
- **AND** display a Mic button on the right for voice input
- **AND** all buttons are compact (h-7 w-7) with ghost variant
- **AND** all buttons have hover state (hover:bg-surface0/50)
- **AND** selectors are separated by small gaps (gap-1)

#### Scenario: Agent selector display

- **WHEN** viewing the agent selector
- **THEN** display current agent icon and name (e.g., "Gemini")
- **AND** display a ChevronDown icon
- **AND** the selector is a compact button with proper styling
- **AND** clicking opens a dropdown with available agents

#### Scenario: Model selector display

- **WHEN** viewing the model selector
- **THEN** display current model name (e.g., "Gemini 2.5 Pro")
- **AND** display a ChevronDown icon
- **AND** the selector is a compact button with proper styling
