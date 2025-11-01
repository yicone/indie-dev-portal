# Agent Chat UI - Phase 2.5 Spec Deltas

## ADDED Requirements

### Requirement: Session Export

The system SHALL provide session export functionality.

#### Scenario: Export session as JSON

- **WHEN** user clicks export button and selects JSON format
- **THEN** system downloads a JSON file containing session metadata and all messages

#### Scenario: Export session as Markdown

- **WHEN** user clicks export button and selects Markdown format
- **THEN** system downloads a Markdown file with formatted conversation

#### Scenario: Export empty session

- **WHEN** user exports a session with no messages
- **THEN** system exports valid file with session metadata only

#### Scenario: Export large session

- **WHEN** user exports a session with 100+ messages
- **THEN** system successfully generates and downloads complete export

### Requirement: Keyboard Shortcuts

The system SHALL provide keyboard shortcuts for common actions.

#### Scenario: Focus session selector (Cmd/Ctrl+K)

- **WHEN** user presses Cmd+K (Mac) or Ctrl+K (Windows/Linux)
- **THEN** system focuses the session search/selector input

#### Scenario: Create new session (Cmd/Ctrl+N)

- **WHEN** user presses Cmd+N (Mac) or Ctrl+N (Windows/Linux)
- **THEN** system opens new session creation dialog

#### Scenario: Export current session (Cmd/Ctrl+E)

- **WHEN** user presses Cmd+E (Mac) or Ctrl+E (Windows/Linux) with active session
- **THEN** system opens export format selector

#### Scenario: Rename current session (Cmd/Ctrl+R)

- **WHEN** user presses Cmd+R (Mac) or Ctrl+R (Windows/Linux) with active session
- **THEN** system enters rename mode for current session

#### Scenario: Close panel (Esc)

- **WHEN** user presses Esc key
- **THEN** system closes the agent chat panel

#### Scenario: Show keyboard shortcuts help

- **WHEN** user clicks "?" button or presses "?" key
- **THEN** system displays modal with all available shortcuts

#### Scenario: Prevent browser shortcut conflicts

- **WHEN** user triggers a keyboard shortcut
- **THEN** system prevents default browser behavior for that shortcut
