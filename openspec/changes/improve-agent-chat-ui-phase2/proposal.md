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

## Design Decisions

1. **Session rename**: Inline editing (decided - implemented)
2. **Retry timestamp**: Preserve original timestamp (decided - message was originally sent at that time)
3. **Export content**: Include all messages including system messages (decided)
4. **Keyboard shortcuts**: Focus on most common actions (Cmd+K, Cmd+N, Cmd+E, Cmd+R, Esc)

## Open Questions

1. Should we add batch export (multiple sessions at once)?
2. Should keyboard shortcuts override browser defaults or work alongside them?
