# Implementation Tasks - Agent Chat UI Phase 2.5

## 1. Session Export Functionality

- [ ] 1.1 Create export utility
  - [ ] Create `lib/utils/sessionExport.ts`
  - [ ] Implement `exportToJSON(session, messages)` function
  - [ ] Implement `exportToMarkdown(session, messages)` function
- [ ] 1.2 Add export UI
  - [ ] Add export button to session dropdown
  - [ ] Add export format selector (JSON/Markdown)
  - [ ] Show export progress indicator
- [ ] 1.3 Implement export logic
  - [ ] Add `exportSession(sessionId, format)` method to context
  - [ ] Fetch all messages for session
  - [ ] Generate export file
  - [ ] Trigger browser download
- [ ] 1.4 Test export functionality
  - [ ] Test JSON export format
  - [ ] Test Markdown export format
  - [ ] Test export with empty session
  - [ ] Test export with large session (100+ messages)
  - [ ] Verify exported content is valid

## 2. Keyboard Shortcuts

- [ ] 2.1 Define keyboard shortcuts
  - [ ] Cmd/Ctrl+K: Focus search/session selector
  - [ ] Cmd/Ctrl+N: Create new session
  - [ ] Cmd/Ctrl+E: Export current session
  - [ ] Cmd/Ctrl+R: Rename current session
  - [ ] Esc: Close panel
- [ ] 2.2 Implement keyboard handler
  - [ ] Add global keyboard event listener
  - [ ] Handle modifier keys (Cmd/Ctrl)
  - [ ] Prevent conflicts with browser shortcuts
  - [ ] Add visual feedback for shortcuts
- [ ] 2.3 Add keyboard shortcuts help
  - [ ] Add "?" button to show shortcuts
  - [ ] Create shortcuts modal/popover
  - [ ] List all available shortcuts
- [ ] 2.4 Test keyboard shortcuts
  - [ ] Test on macOS (Cmd)
  - [ ] Test on Windows/Linux (Ctrl)
  - [ ] Test shortcut conflicts
  - [ ] Test accessibility with keyboard navigation

## 3. Documentation

- [ ] 3.1 Update user documentation
  - [ ] Document export functionality
  - [ ] Document keyboard shortcuts
  - [ ] Add usage examples
- [ ] 3.2 Update spec documentation
  - [ ] Update agent-chat-ui spec with new requirements
  - [ ] Add design decisions

## 4. Testing

- [ ] 4.1 Unit tests
  - [ ] Test export utility functions
  - [ ] Test keyboard event handlers
- [ ] 4.2 Integration testing
  - [ ] Test export + keyboard shortcuts workflow
  - [ ] Test all features together
- [ ] 4.3 Manual testing
  - [ ] Follow testing checklist
  - [ ] Test on different browsers
  - [ ] Test on different OS

## 5. Validation & Cleanup

- [ ] 5.1 Code review
  - [ ] Review TypeScript types
  - [ ] Review error handling
  - [ ] Review accessibility
- [ ] 5.2 Final testing
  - [ ] Run full test suite
  - [ ] Manual testing of all features
  - [ ] Regression testing
- [ ] 5.3 Update tasks.md
  - [ ] Mark all tasks as complete
  - [ ] Validate with `openspec validate --strict`

---

**Estimated Effort**: 1 day  
**Priority**: Low  
**Dependencies**: Phase 2 MVP must be completed
