# Improve Agent Chat UI/UX

## Why

The Agent Chat UI lacks essential session management and message interaction features. Users cannot archive old sessions, leading to cluttered session lists. Code blocks lack syntax highlighting, making code hard to read. Users cannot easily copy messages or code snippets for reuse. These limitations reduce productivity and create a poor user experience.

## What Changes

- Add session archiving functionality with "Archive Session" button
- Add "Show Archived" toggle to view archived sessions when needed
- Add one-click copy functionality for messages and code blocks
- Add syntax highlighting for code blocks using react-syntax-highlighter
- Improve empty states with icons and better messaging
- Add hover effects and visual feedback for better UX
- Improve code block rendering with custom styling

## Impact

### Affected Specs

- **MODIFIED**: `agent-chat-ui` - Add session archiving, message copy, and syntax highlighting requirements

### Affected Code

- **Modified**: `components/agent/AgentChatPanel.tsx` (280 → 420 lines)
  - Add archive session functionality
  - Add show archived toggle
  - Add message copy handlers
  - Add syntax highlighting integration
  - Improve empty states
  - Add hover effects

### Dependencies

- **New**: `react-syntax-highlighter@16.1.0` - Syntax highlighting for code blocks
- **New**: `@types/react-syntax-highlighter@15.5.13` - TypeScript types

### Migration Path

1. Install new dependencies (already done)
2. Code changes are backward compatible
3. Existing sessions continue to work
4. Archive functionality uses existing API endpoint
5. No database changes required

## Non-Goals

- Session rename functionality (Phase 2)
- Message retry functionality (Phase 2)
- Session export functionality (Phase 2)
- Message pagination (Phase 3)
- Keyboard shortcuts (Phase 3)
