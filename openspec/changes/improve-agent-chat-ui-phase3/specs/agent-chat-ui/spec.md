# Agent Chat UI - Phase 3 (Latest Design) Spec Deltas

## ADDED Requirements

### Requirement: Visual Design System

The system SHALL implement the latest UI/UX design with consistent styling, spacing, and visual hierarchy.

#### Scenario: Panel dimensions and layout

- **WHEN** the chat panel is opened
- **THEN** the panel has a fixed width of 420px
- **AND** the panel slides in from the right with spring animation
- **AND** the panel has a dark theme background (crust color)
- **AND** the panel has a left border (surface0 color)

#### Scenario: Header styling

- **WHEN** viewing the chat panel header
- **THEN** the header displays "AI Assistant" with MessageSquare icon in mauve color
- **AND** the header has a close button (X icon) on the right
- **AND** the header has bottom border separation (surface0 color)
- **AND** all header elements use consistent padding (px-4 py-3)

#### Scenario: Message bubble styling

- **WHEN** viewing chat messages
- **THEN** user messages have mauve background with base text color
- **AND** assistant messages have surface0 background with text color
- **AND** message bubbles have rounded corners (rounded-2xl)
- **AND** message bubbles have proper padding (px-4 py-2.5)
- **AND** message bubbles are max 85% width
- **AND** timestamps are displayed with reduced opacity (opacity-60)

#### Scenario: Input area styling

- **WHEN** viewing the message input area
- **THEN** the input has surface0 background with surface1 border
- **AND** the input has mauve focus ring
- **AND** the send button has mauve background
- **AND** the send button is embedded in the input (absolute positioning)
- **AND** agent/model selectors are displayed above the input

#### Scenario: Empty state design

- **WHEN** a session has no messages
- **THEN** display a centered empty state with MessageSquare icon
- **AND** the icon is in a rounded square container (w-16 h-16, rounded-2xl, bg-surface0)
- **AND** display "Start a Conversation" heading
- **AND** display helpful description text with repository name
- **AND** all text is center-aligned with proper spacing

### Requirement: Session Dropdown UI

The system SHALL provide an enhanced session selector dropdown with improved organization and visual clarity.

#### Scenario: Compact session selector button

- **WHEN** viewing the session selector
- **THEN** display a compact button (h-8) with current session name
- **AND** the button has surface0/50 background with surface1 border
- **AND** the button shows a ChevronDown icon on the right
- **AND** the button text truncates if too long
- **AND** the button spans full width with proper padding (px-3)

#### Scenario: Dropdown menu structure

- **WHEN** the session dropdown is opened
- **THEN** the dropdown has mantle background with surface0 border
- **AND** the dropdown width is 380px
- **AND** the dropdown aligns to the start (left)
- **AND** active sessions are shown first
- **AND** archived sessions are shown in a separate section at the bottom

#### Scenario: Active session item display

- **WHEN** viewing an active session in the dropdown
- **THEN** display session name with truncation
- **AND** display repository name below in muted text (text-xs)
- **AND** display last active time on the right (text-xs)
- **AND** show a green dot indicator for the currently active session
- **AND** the item has hover state (hover:bg-surface0)
- **AND** all items have consistent padding (px-3 py-2)

#### Scenario: Archived session section

- **WHEN** there are archived sessions
- **THEN** display a separator before archived section
- **AND** display "Archived" label in muted text
- **AND** archived sessions have reduced opacity (opacity-60)
- **AND** archived sessions show same information as active sessions
- **AND** clicking an archived session makes it active

#### Scenario: New session action

- **WHEN** viewing the session dropdown
- **THEN** display "+ New Chat Session" option after active sessions
- **AND** the option has a Plus icon
- **AND** the option has separator above it
- **AND** clicking opens the new session dialog

#### Scenario: Archive session action

- **WHEN** viewing the session dropdown with an active session
- **THEN** display "Archive Session" option with Archive icon
- **AND** the option has separator above it
- **AND** clicking archives the current session
- **AND** if session is archived, show "Unarchive" instead

### Requirement: Inline Session Title Editing

The system SHALL allow users to edit session titles inline with repository information display.

#### Scenario: Display mode

- **WHEN** viewing the session title area
- **THEN** display session name in small text (text-xs)
- **AND** display "Repo: [repository-name]" below in muted text
- **AND** display Edit2 icon on hover (opacity-0 group-hover:opacity-50)
- **AND** the entire area is clickable with hover effect (hover:bg-surface0/30)
- **AND** the area has proper padding (p-2) and rounded corners

#### Scenario: Edit mode activation

- **WHEN** user clicks the session title area
- **THEN** switch to edit mode with input field
- **AND** the input field is pre-filled with current session name
- **AND** the input field is focused and text is selected
- **AND** the input has compact height (h-7) and small text (text-xs)
- **AND** display Check and X buttons next to the input

#### Scenario: Save title changes

- **WHEN** user presses Enter or clicks Check button in edit mode
- **THEN** save the new session name
- **AND** exit edit mode
- **AND** display the updated name in display mode
- **AND** update the session name in the dropdown

#### Scenario: Cancel title editing

- **WHEN** user presses Escape or clicks X button in edit mode
- **THEN** discard changes
- **AND** exit edit mode
- **AND** restore the original session name

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

### Requirement: New Session Dialog

The system SHALL provide a modal dialog for creating new chat sessions with repository selection.

#### Scenario: Dialog appearance

- **WHEN** user clicks "New Chat Session" or presses Cmd/Ctrl+N
- **THEN** display a modal dialog overlay
- **AND** the dialog has a close button (X icon) in the top-right
- **AND** the dialog title is "New Chat Session"
- **AND** the dialog description explains the purpose
- **AND** the dialog has proper padding and spacing

#### Scenario: Session name input

- **WHEN** viewing the new session dialog
- **THEN** display a "Session Name" input field
- **AND** the input has placeholder text (e.g., "Refactor authentication module")
- **AND** the input is focused by default
- **AND** the input has proper styling matching the design system

#### Scenario: Repository selector

- **WHEN** viewing the new session dialog
- **THEN** display a "Repository" dropdown selector
- **AND** the selector shows "Choose a repository..." placeholder
- **AND** the dropdown lists all available repositories
- **AND** the dropdown has proper styling and hover states
- **AND** if initialRepository is provided, pre-select it

#### Scenario: Create session action

- **WHEN** user fills in session name and selects repository
- **THEN** enable the "Create Session" button (mauve background)
- **AND** clicking the button creates the new session
- **AND** close the dialog
- **AND** switch to the newly created session
- **AND** display empty state in the chat area

#### Scenario: Cancel session creation

- **WHEN** user clicks Cancel button or close icon
- **THEN** close the dialog without creating a session
- **AND** discard any entered information
- **AND** return to the previous state

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
