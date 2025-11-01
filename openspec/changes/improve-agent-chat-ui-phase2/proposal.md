# Improve Agent Chat UI - Phase 2

## Why

Phase 1 delivered core session management and message interaction features. Users now need additional productivity features to manage sessions more effectively and recover from errors. Session renaming would help users organize conversations by topic. Message retry functionality would improve reliability when messages fail to send. Session export would enable users to save important conversations for reference or sharing.

## What Changes

- Add session rename functionality with inline editing
- Add message retry mechanism for failed messages
- Add session export functionality (JSON and Markdown formats)
- Add keyboard shortcuts for common actions
- Improve error recovery UX

## Impact

### Affected Specs

- **MODIFIED**: `agent-chat-ui` - Add session rename, message retry, and export requirements

### Affected Code

- **Modified**: `components/agent/AgentChatPanel.tsx`
  - Add session rename UI and handlers
  - Add message retry UI and logic
  - Add export functionality
  - Add keyboard shortcut handlers
- **Modified**: `lib/contexts/AgentChatContext.tsx`
  - Add rename session method
  - Add retry message method
  - Add export session method
- **New**: `lib/utils/sessionExport.ts`
  - Export to JSON format
  - Export to Markdown format

### Dependencies

None (uses existing libraries)

### Migration Path

1. All changes are backward compatible
2. Existing sessions continue to work
3. New features are opt-in (user-initiated)
4. No database schema changes required

## Non-Goals

- Message pagination (Phase 3)
- Advanced search within conversations (Phase 3)
- Session templates or presets (Future)
- Collaborative sessions (Future)
- Message editing (Future - requires backend support)

## Timeline

**Estimated Effort**: 2-3 days

**Priority**: Medium (productivity enhancements)

**Dependencies**: None

## Success Criteria

- Users can rename sessions with 2 clicks
- Failed messages can be retried with 1 click
- Sessions can be exported in JSON and Markdown formats
- Keyboard shortcuts work for common actions
- All features have proper error handling

## Open Questions

1. Should session rename be inline or modal-based?
2. Should retry preserve original message timestamp or use new timestamp?
3. What keyboard shortcuts are most valuable to users?
4. Should export include system messages or only user/agent messages?
5. Should we add batch export (multiple sessions at once)?
