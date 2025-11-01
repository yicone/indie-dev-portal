# Improve Agent Chat UI - Phase 2.5

## Why

Phase 2 MVP delivered session rename, message retry, and error recovery. Users now need the remaining productivity features: session export for saving conversations and keyboard shortcuts for faster navigation.

## What Changes

- Add session export functionality (JSON and Markdown formats)
- Add keyboard shortcuts for common actions (Cmd+K, Cmd+N, Cmd+E, Cmd+R, Esc)

## Impact

### Affected Specs

- **MODIFIED**: `agent-chat-ui` - Add session export and keyboard shortcuts requirements

### Affected Code

- **New**: `lib/utils/sessionExport.ts` - Export to JSON/Markdown
- **Modified**: `components/agent/AgentChatPanel.tsx` - Add export UI and keyboard handlers
- **Modified**: `lib/contexts/AgentChatContext.tsx` - Add export session method

### Dependencies

None (uses existing libraries)

## Non-Goals

- Batch export (multiple sessions at once)
- Custom export formats (PDF, HTML)
- Keyboard shortcut customization

## Timeline

**Estimated Effort**: 1 day

**Priority**: Low (nice-to-have productivity features)

**Dependencies**: Phase 2 MVP must be completed

## Success Criteria

- Users can export sessions in JSON format
- Users can export sessions in Markdown format
- Keyboard shortcuts work for common actions (Cmd+K, Cmd+N, Cmd+E, Cmd+R, Esc)
- All features have proper error handling
