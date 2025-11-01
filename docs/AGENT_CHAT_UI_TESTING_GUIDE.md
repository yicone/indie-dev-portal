# Agent Chat UI Testing Guide

## Overview

Manual testing guide for Phase 1 UI/UX improvements to the Agent Chat Panel.

---

## Test Environment Setup

### Prerequisites

```bash
# 1. Start the development server
pnpm dev

# 2. Open browser
open http://localhost:3000

# 3. Ensure you have at least one repository configured
```

### Test Data Preparation

- Have at least 2-3 repositories available
- Create at least 2-3 sessions for testing
- Send some messages with code blocks for testing

---

## Test Cases

### Test 1: Archive Session ✅

**Objective**: Verify session archiving works correctly

**Steps**:

1. Open Agent Chat Panel (click floating button)
2. Create a new session or select an existing one
3. Send a few messages
4. Click "Archive Session" button
5. Confirm the dialog

**Expected Results**:

- ✅ Confirmation dialog appears
- ✅ Button shows "Archiving..." with spinner
- ✅ Session is archived successfully
- ✅ Active session is cleared (if it was the archived one)
- ✅ Session disappears from the default list
- ✅ No errors in console

**Pass/Fail**: ⬜

**Notes**:

---

### Test 2: Show Archived Toggle ✅

**Objective**: Verify archived sessions can be viewed

**Steps**:

1. Archive at least one session (see Test 1)
2. Click "Show Archived" button
3. Observe the session list
4. Click "Hide Archived" button

**Expected Results**:

- ✅ "Show Archived" button toggles to "Hide Archived"
- ✅ Archived sessions appear in dropdown with "(archived)" label
- ✅ Can select archived session
- ✅ Archived session shows special empty state with Archive icon
- ✅ Cannot send messages in archived session
- ✅ "Archive Session" button is hidden for archived sessions
- ✅ Toggle back hides archived sessions

**Pass/Fail**: ⬜

**Notes**:

---

### Test 3: Message Copy Functionality ✅

**Objective**: Verify message copying works

**Steps**:

1. Select an active session with messages
2. Hover over a message
3. Click the copy button (should appear on hover)
4. Check clipboard

**Expected Results**:

- ✅ Copy button appears on hover
- ✅ Copy button shows Copy icon initially
- ✅ After clicking, shows Check icon
- ✅ Check icon disappears after 2 seconds
- ✅ Message content is copied to clipboard
- ✅ Can paste the copied content

**Pass/Fail**: ⬜

**Notes**:

---

### Test 4: Code Block Copy ✅

**Objective**: Verify code block copying works

**Steps**:

1. Send a message with a code block (e.g., "Show me a JavaScript function")
2. Wait for agent response with code
3. Hover over the code block
4. Click the copy button in the code block

**Expected Results**:

- ✅ Code block has syntax highlighting
- ✅ Copy button appears on hover (top-right of code block)
- ✅ After clicking, shows Check icon
- ✅ Code content is copied to clipboard (without syntax highlighting markup)
- ✅ Can paste the code correctly

**Pass/Fail**: ⬜

**Notes**:

---

### Test 5: Syntax Highlighting ✅

**Objective**: Verify syntax highlighting works for different languages

**Steps**:

1. Ask agent for code examples in different languages:
   - "Show me a JavaScript function"
   - "Show me a Python class"
   - "Show me a TypeScript interface"
   - "Show me a SQL query"
2. Observe the code blocks

**Expected Results**:

- ✅ JavaScript code has proper syntax highlighting
- ✅ Python code has proper syntax highlighting
- ✅ TypeScript code has proper syntax highlighting
- ✅ SQL code has proper syntax highlighting
- ✅ Colors are consistent with VS Code Dark Plus theme
- ✅ Inline code (backticks) doesn't have highlighting
- ✅ Code blocks have rounded corners and proper spacing

**Pass/Fail**: ⬜

**Notes**:

---

### Test 6: Archived Session Empty State ✅

**Objective**: Verify archived session shows correct empty state

**Steps**:

1. Archive a session
2. Enable "Show Archived"
3. Select the archived session
4. Observe the messages area

**Expected Results**:

- ✅ Shows Archive icon (centered)
- ✅ Shows "Archived Session" title
- ✅ Shows descriptive message about viewing history
- ✅ Input area is disabled
- ✅ Send button is disabled
- ✅ Can still view message history (if any)

**Pass/Fail**: ⬜

**Notes**:

---

### Test 7: Session Status Indicators ✅

**Objective**: Verify different session statuses show correctly

**Steps**:

1. Create an active session
2. Observe the session in dropdown
3. Archive the session
4. Enable "Show Archived" and observe

**Expected Results**:

- ✅ Active session shows "- active" in dropdown
- ✅ Archived session shows "- archived (archived)" in dropdown
- ✅ Suspended session shows "- suspended" (if applicable)
- ✅ Status is clearly visible

**Pass/Fail**: ⬜

**Notes**:

---

### Test 8: Hover Effects ✅

**Objective**: Verify all hover effects work smoothly

**Steps**:

1. Hover over messages
2. Hover over code blocks
3. Hover over buttons

**Expected Results**:

- ✅ Message copy button fades in smoothly
- ✅ Code block copy button fades in smoothly
- ✅ Buttons have hover states
- ✅ No flickering or janky animations
- ✅ Opacity transitions are smooth

**Pass/Fail**: ⬜

**Notes**:

---

### Test 9: Multiple Sessions ✅

**Objective**: Verify archiving works with multiple sessions

**Steps**:

1. Create 3 sessions
2. Archive session 1
3. Archive session 2
4. Keep session 3 active
5. Toggle "Show Archived"

**Expected Results**:

- ✅ Default view shows only session 3
- ✅ "Show Archived" shows all 3 sessions
- ✅ Can switch between archived and active sessions
- ✅ Correct empty states for each session type

**Pass/Fail**: ⬜

**Notes**:

---

### Test 10: Error Handling ✅

**Objective**: Verify error handling works

**Steps**:

1. Try to archive a session with network disconnected
2. Observe error handling

**Expected Results**:

- ✅ Shows error alert
- ✅ Button returns to normal state
- ✅ Session is not archived
- ✅ Can retry after fixing network

**Pass/Fail**: ⬜

**Notes**:

---

## Browser Compatibility

Test on the following browsers:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

---

## Performance Checks

### Loading Performance

- [ ] Panel opens quickly (<100ms)
- [ ] Messages render smoothly
- [ ] Syntax highlighting doesn't cause lag
- [ ] Hover effects are smooth (60fps)

### Memory Usage

- [ ] No memory leaks after archiving sessions
- [ ] Syntax highlighter doesn't consume excessive memory
- [ ] Can handle 50+ messages without issues

---

## Accessibility Checks

### Keyboard Navigation

- [ ] Can tab to all interactive elements
- [ ] Enter key works on buttons
- [ ] Escape key closes dialogs
- [ ] Focus indicators are visible

### Screen Reader

- [ ] Buttons have proper labels
- [ ] Status changes are announced
- [ ] Code blocks are readable

---

## Regression Tests

### Existing Functionality

- [ ] Can still create sessions
- [ ] Can still send messages
- [ ] Can still switch sessions
- [ ] WebSocket connection works
- [ ] Typing indicator works
- [ ] Error messages display correctly

---

## Known Issues

### Current Limitations

1. **No undo for archive**: Once archived, can't unarchive (by design)
2. **No batch operations**: Can't archive multiple sessions at once
3. **No search**: Can't search within messages yet
4. **No export**: Can't export conversation history yet

### Future Improvements

See `docs/agent-chat-ui-improvements.md` for planned enhancements.

---

## Bug Report Template

If you find a bug, report it with:

```markdown
**Bug**: [Short description]

**Steps to Reproduce**:

1. ...
2. ...
3. ...

**Expected**: [What should happen]

**Actual**: [What actually happened]

**Environment**:

- Browser: [Chrome/Firefox/Safari]
- OS: [macOS/Windows/Linux]
- Version: [Browser version]

**Screenshots**: [If applicable]

**Console Errors**: [If any]
```

---

## Test Summary

### Overall Results

- Total Tests: 10
- Passed: ⬜
- Failed: ⬜
- Skipped: ⬜

### Critical Issues

[List any critical issues found]

### Minor Issues

[List any minor issues found]

### Recommendations

[Any recommendations for improvements]

---

## Sign-off

**Tester**: **\*\***\_\_\_**\*\***

**Date**: **\*\***\_\_\_**\*\***

**Status**: [ ] Approved [ ] Needs Fixes

**Notes**:
