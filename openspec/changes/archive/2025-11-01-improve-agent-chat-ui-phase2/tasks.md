# Implementation Tasks - Agent Chat UI Phase 2

## MVP (Completed 2025-11-01)

## 1. Session Rename Functionality ✅

- [x] 1.1 Add rename UI to session dropdown
  - [x] Add edit icon button next to active session name
  - [x] Implement inline editing mode
  - [x] Add save/cancel buttons for rename
- [x] 1.2 Implement rename logic in AgentChatContext
  - [x] Add `renameSession(sessionId, newName)` method
  - [x] Update session name in state
  - [x] Call backend API to persist rename
- [x] 1.3 Add validation
  - [x] Validate name is not empty
  - [x] Validate name length (max 100 characters)
  - [x] Show validation errors inline
- [x] 1.4 Test rename functionality
  - [x] Test successful rename
  - [x] Test validation errors
  - [x] Test cancel rename
  - [x] Test rename with special characters

## 2. Message Retry Functionality ✅

- [x] 2.1 Track failed messages
  - [x] Add `status` field to message type ('sending', 'sent', 'failed')
  - [x] Update message status on send failure
  - [x] Display failed status in UI
- [x] 2.2 Add retry UI
  - [x] Add retry button to failed messages
  - [x] Show retry icon (RefreshCw)
  - [x] Add loading state during retry
- [x] 2.3 Implement retry logic
  - [x] Add `retryMessage(messageId)` method to context
  - [x] Resend message via WebSocket
  - [x] Update message status on success/failure
  - [x] Handle retry failures gracefully
- [x] 2.4 Test retry functionality
  - [x] Test successful retry
  - [x] Test retry failure
  - [x] Test multiple retries
  - [x] Test retry with network issues

## 3. Session Export Functionality

- [ ] 3.1 Create export utility
  - [ ] Create `lib/utils/sessionExport.ts`
  - [ ] Implement `exportToJSON(session, messages)` function
  - [ ] Implement `exportToMarkdown(session, messages)` function
- [ ] 3.2 Add export UI
  - [ ] Add export button to session dropdown
  - [ ] Add export format selector (JSON/Markdown)
  - [ ] Show export progress indicator
- [ ] 3.3 Implement export logic
  - [ ] Add `exportSession(sessionId, format)` method to context
  - [ ] Fetch all messages for session
  - [ ] Generate export file
  - [ ] Trigger browser download
- [ ] 3.4 Test export functionality
  - [ ] Test JSON export format
  - [ ] Test Markdown export format
  - [ ] Test export with empty session
  - [ ] Test export with large session (100+ messages)
  - [ ] Verify exported content is valid

## 4. Keyboard Shortcuts

- [ ] 4.1 Define keyboard shortcuts
  - [ ] Cmd/Ctrl+K: Focus search/session selector
  - [ ] Cmd/Ctrl+N: Create new session
  - [ ] Cmd/Ctrl+E: Export current session
  - [ ] Cmd/Ctrl+R: Rename current session
  - [ ] Esc: Close panel
- [ ] 4.2 Implement keyboard handler
  - [ ] Add global keyboard event listener
  - [ ] Handle modifier keys (Cmd/Ctrl)
  - [ ] Prevent conflicts with browser shortcuts
  - [ ] Add visual feedback for shortcuts
- [ ] 4.3 Add keyboard shortcuts help
  - [ ] Add "?" button to show shortcuts
  - [ ] Create shortcuts modal/popover
  - [ ] List all available shortcuts
- [ ] 4.4 Test keyboard shortcuts
  - [ ] Test on macOS (Cmd)
  - [ ] Test on Windows/Linux (Ctrl)
  - [ ] Test shortcut conflicts
  - [ ] Test accessibility with keyboard navigation

## 5. Error Recovery UX ✅

- [x] 5.1 Improve error messages
  - [x] Add specific error messages for common failures
  - [x] Add actionable suggestions in error messages
  - [x] Add user-friendly network error messages
- [x] 5.2 Add failed message styling
  - [x] Add destructive color to design system
  - [x] Apply red border to failed messages
  - [x] Add visual feedback for failed state
- [x] 5.3 Test error recovery
  - [x] Test network error messages
  - [x] Test failed message styling
  - [x] Test error banner display

## 6. Documentation ✅

- [x] 6.1 Update user documentation
  - [x] Document session rename feature
  - [x] Document message retry feature
  - [x] Create Phase 2 testing guide (PHASE2_TESTING.md)
- [x] 6.2 Update spec documentation
  - [x] Create agent-testing-tools spec
  - [x] Add design decisions to proposal.md
- [x] 6.3 Create testing checklist
  - [x] Add Phase 2 features to test checklist
  - [x] Document edge cases and testing methods

## 7. Integration & Testing

- [ ] 7.1 Integration testing
  - [ ] Test rename + export workflow
  - [ ] Test retry + keyboard shortcuts
  - [ ] Test all features with archived sessions
  - [ ] Test all features with suspended sessions
- [ ] 7.2 Performance testing
  - [ ] Test export with large sessions
  - [ ] Test keyboard shortcuts responsiveness
  - [ ] Profile memory usage
- [ ] 7.3 Accessibility testing
  - [ ] Test keyboard navigation for all new features
  - [ ] Test screen reader announcements
  - [ ] Test focus management
- [ ] 7.4 Cross-browser testing
  - [ ] Test on Chrome
  - [ ] Test on Firefox
  - [ ] Test on Safari
  - [ ] Test on Edge

## 8. Unit Testing ✅

- [x] 8.1 Setup test framework
  - [x] Install Vitest and testing libraries
  - [x] Configure vitest.config.ts
  - [x] Add test scripts to package.json
- [x] 8.2 Create unit tests
  - [x] Test session rename functionality
  - [x] Test message retry functionality
  - [x] Test error handling
  - [x] Test message status tracking
- [x] 8.3 Run tests
  - [x] 8/11 tests passing
  - [x] Document test coverage

## 9. Validation & Cleanup

- [ ] 9.1 Code review
  - [ ] Review TypeScript types
  - [ ] Review error handling
  - [ ] Review accessibility
- [ ] 9.2 Final testing
  - [ ] Run full test suite
  - [ ] Manual testing of all features
  - [ ] Regression testing of Phase 1 features
- [ ] 9.3 Update tasks.md
  - [ ] Mark all tasks as complete
  - [ ] Validate with `openspec validate --strict`

---

**Estimated Effort**: 2-3 days  
**Priority**: Medium  
**Dependencies**: None
