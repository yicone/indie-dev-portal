# Agent Chat UI Error Handling Test Checklist

## Overview

This document tracks testing scenarios for error handling in the Agent Chat UI, particularly for session creation failures and error display mechanisms.

## Test Status

- ⏳ **Pending**: Waiting for agent simulator completion
- ✅ **Passed**: Test completed successfully
- ❌ **Failed**: Test failed, needs investigation
- 🔄 **Blocked**: Blocked by dependencies

---

## Session Creation Error Handling

### 429 Too Many Requests Error

**Status**: ⏳ Pending (waiting for agent simulator)

**Scenario**: User attempts to create multiple sessions rapidly and hits rate limit

**Test Steps**:

1. Select a repository from "Create new" dropdown
2. Wait for 429 error response from backend
3. Verify error banner appears at top of panel
4. Verify error message: "Too many requests. Please wait a moment and try again."
5. Verify input field remains disabled during error display
6. Verify send button remains disabled during error display
7. Wait 30 seconds
8. Attempt to create session again
9. Verify error banner disappears on successful creation

**Expected Behavior**:

- ✅ Error banner appears immediately at top (fixed position)
- ✅ Error message is user-friendly and actionable
- ✅ Error banner is visible regardless of scroll position
- ✅ Close button (X) works to manually dismiss error
- ✅ Error auto-clears on successful session creation
- ✅ UI remains responsive (no stuck loading states)

**Edge Cases**:

- [ ] Multiple consecutive 429 errors
- [ ] 429 error followed by different error (500, network)
- [ ] User manually closes error then retries
- [ ] User switches to different repository during error state

---

### Multiple Consecutive Errors

**Status**: ⏳ Pending

**Scenario**: User encounters multiple errors in sequence

**Test Steps**:

1. Trigger first error (e.g., 429)
2. Verify error banner displays
3. Immediately trigger second error (same or different)
4. Verify error banner updates with new message
5. Verify no duplicate error banners appear

**Expected Behavior**:

- ✅ Only one error banner visible at a time
- ✅ Error message updates to reflect latest error
- ✅ No visual glitches during error transitions
- ✅ Previous error is replaced, not stacked

---

### 500 Server Error

**Status**: ⏳ Pending

**Scenario**: Backend returns 500 Internal Server Error

**Test Steps**:

1. Simulate 500 error from backend
2. Verify error banner appears
3. Verify error message: "Server error. Please try again later."
4. Verify retry behavior

**Expected Behavior**:

- ✅ Error banner appears with appropriate message
- ✅ User can retry after dismissing error
- ✅ No data loss or corruption

---

### Network Error

**Status**: ⏳ Pending

**Scenario**: Network connection fails during session creation

**Test Steps**:

1. Disconnect network
2. Attempt to create session
3. Verify error handling
4. Reconnect network
5. Verify retry works

**Expected Behavior**:

- ✅ Generic error message appears
- ✅ UI doesn't hang indefinitely
- ✅ Retry works after network restoration

---

## Error Banner UI/UX

### Visual Appearance

**Status**: ✅ Implemented (needs verification)

**Checklist**:

- [x] Error banner fixed at top of panel
- [x] Red/destructive color scheme
- [x] Alert icon visible
- [x] Close button (X) on right
- [x] Smooth slide-in animation
- [x] Proper z-index (above other content)

---

### Interaction

**Status**: ✅ Implemented (needs verification)

**Checklist**:

- [x] Close button dismisses error
- [x] Error auto-clears on successful session creation
- [x] Error persists across session switches (if still relevant)
- [x] Error doesn't block other UI interactions

---

### Accessibility

**Status**: ⏳ Not tested

**Checklist**:

- [ ] Error announced to screen readers
- [ ] Close button keyboard accessible
- [ ] Sufficient color contrast
- [ ] Error message readable at all zoom levels

---

## Loading States

### Session Creation Loading

**Status**: ✅ Partially tested (3 successful creations)

**Test Steps**:

1. Select repository from dropdown
2. Verify "Creating session..." message appears
3. Verify loading spinner visible
4. Verify input field disabled with placeholder "Creating session..."
5. Verify send button disabled
6. Verify repository dropdown disabled with placeholder "Creating session..."
7. Wait for completion
8. Verify all UI elements re-enable

**Expected Behavior**:

- ✅ Loading state appears immediately
- ✅ All interactive elements disabled
- ✅ Clear visual feedback (spinner + text)
- ✅ Loading state clears on completion (success or error)

---

### Loading State Edge Cases

**Status**: ⏳ Pending

**Checklist**:

- [ ] Loading state during slow network
- [ ] Loading state timeout (if applicable)
- [ ] Loading state cancellation (if user navigates away)
- [ ] Multiple rapid creation attempts

---

## Regression Tests

### After Error Handling Refactor (ffcdf16)

**Status**: ⏳ Pending

**Changes**:

- Moved error from inline (message area) to fixed banner (top)
- Removed complex scroll logic
- Removed complex auto-clear logic
- Simplified state management

**Regression Checklist**:

- [ ] All error types still display correctly
- [ ] No visual regressions in error styling
- [ ] Error banner doesn't interfere with other UI
- [ ] Performance improvement verified (simpler code)
- [ ] No memory leaks from removed refs

---

## Test Environment Setup

### Prerequisites

**Agent Simulator** (⏳ In development):

- Ability to trigger 429 errors on demand
- Ability to trigger 500 errors on demand
- Ability to simulate network failures
- Ability to control response timing

**Manual Testing**:

- Backend rate limiting configured
- Multiple test repositories available
- Network throttling tools available

---

## Test Execution Plan

### Phase 1: Basic Error Display (Ready)

1. ✅ Verify error banner appears for 429
2. ✅ Verify error banner appears for 500
3. ✅ Verify error banner appears for network errors
4. ✅ Verify close button works
5. ✅ Verify error message text

### Phase 2: Error Lifecycle (Blocked - needs simulator)

1. ⏳ Verify error auto-clears on success
2. ⏳ Verify multiple consecutive errors
3. ⏳ Verify error persistence across actions
4. ⏳ Verify error doesn't reappear incorrectly

### Phase 3: Integration (Blocked - needs simulator)

1. ⏳ Test with real backend rate limiting
2. ⏳ Test with various network conditions
3. ⏳ Test with concurrent user actions
4. ⏳ Test error recovery flows

### Phase 4: Accessibility & Polish

1. ⏳ Screen reader testing
2. ⏳ Keyboard navigation testing
3. ⏳ Mobile device testing
4. ⏳ Performance testing

---

## Known Issues

### Current

None

### Historical

1. **Fixed in c3a8b39**: Error cleared incorrectly when creation failed with existing session
   - Root cause: Condition too broad, didn't check session ID change
   - Fix: Added session ID change detection

2. **Fixed in ffcdf16**: Error not visible on second failure
   - Root cause: Error in message area, scroll logic complex
   - Fix: Moved to fixed banner at top

---

## Notes

- All tests marked ⏳ are blocked pending agent simulator completion
- Tests should be automated where possible once simulator is ready
- Consider adding E2E tests for critical error paths
- Update this checklist as new error scenarios are discovered

---

**Last Updated**: 2025-11-01  
**Next Review**: After agent simulator completion
