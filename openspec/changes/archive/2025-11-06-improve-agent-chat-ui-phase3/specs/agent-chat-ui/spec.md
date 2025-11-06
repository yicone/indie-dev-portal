# Agent Chat UI - Phase 3 (New Prototype Adjustments) Spec Deltas

## MODIFIED Requirements

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

## ADDED Requirements

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
- **AND** clicking opens a dropdown with available models

## Future Enhancements

The following features are planned for future phases but not included in this implementation:

### Session Export (Deferred)

- Export sessions to JSON/Markdown formats
- Support for empty and large sessions

### Keyboard Shortcuts (Deferred)

- Common shortcuts (Cmd/Ctrl+K, N, E, R, Esc)
- Keyboard shortcuts help modal

### Advanced Message Display (Future)

- Different components based on agent message types
- Rich content rendering (code blocks, tables, charts)
- Interactive elements in messages

### Multi-Agent Support (Future)

- Support for additional AI agents beyond Gemini
- Agent-specific capabilities and configurations
- Seamless switching between agents

### Task Center (Future)

- Task management integration
- Track agent-generated tasks
- Task status and completion tracking
