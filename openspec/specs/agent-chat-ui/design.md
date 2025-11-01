# Agent Chat UI Design Decisions

## Overview

This document captures key design decisions, architectural patterns, and UX rationale for the Agent Chat UI capability.

---

## Error Display Strategy

### Context

**Date**: 2025-11-01  
**Decision**: Use fixed error banner instead of inline error messages  
**Commit**: `ffcdf16`

### Problem

Initial implementation displayed errors inline within the message area (at the bottom). This created several UX issues:

1. **Visibility**: Errors could be outside viewport if user hadn't scrolled to bottom
2. **Scroll complexity**: Required monitoring `error` state changes to trigger auto-scroll
3. **State management**: Complex logic with `useRef` to track previous states
4. **Multiple errors**: Second error wouldn't trigger scroll (error value unchanged)
5. **Code complexity**: ~40 lines of complex state tracking and cleanup logic

### Solution Considered

#### Option A: Toast Notifications (Preferred but unavailable)

**Pros**:

- Standard pattern for transient notifications
- Always visible (fixed position)
- Auto-dismiss after timeout
- Non-intrusive
- Stackable for multiple errors

**Cons**:

- Requires additional dependency (`react-hot-toast` or similar)
- May be dismissed too quickly by users
- Not in current component library

**Decision**: Not chosen due to lack of existing toast component

#### Option B: Fixed Error Banner (Chosen)

**Pros**:

- Always visible at top of panel
- No scroll logic needed
- Simple implementation (~15 lines)
- Stays visible until user dismisses or error resolves
- Doesn't interfere with message area
- Clear visual hierarchy

**Cons**:

- Takes up vertical space when visible
- Requires manual dismissal (but also auto-clears on success)

**Decision**: ✅ **Chosen** - Best balance of simplicity and UX

#### Option C: Modal Dialog

**Pros**:

- Impossible to miss
- Forces user acknowledgment

**Cons**:

- Too intrusive for non-critical errors
- Blocks all interaction
- Poor UX for recoverable errors like 429

**Decision**: ❌ Rejected - Too disruptive

### Implementation Details

**Location**: Top of panel, below header, above session selector

```tsx
{
  /* Error Banner - Fixed at top */
}
{
  error && (
    <div className="bg-destructive/10 border-b border-destructive/20 p-3 animate-in slide-in-from-top">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
        <p className="text-sm text-destructive flex-1">{error}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearError}
          className="h-6 w-6 p-0 hover:bg-destructive/20"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
```

**Styling**:

- Background: `bg-destructive/10` (10% opacity red)
- Border: `border-destructive/20` (20% opacity red border-bottom)
- Icon: `AlertCircle` from lucide-react
- Animation: `animate-in slide-in-from-top` (Tailwind CSS animation)
- Text: `text-sm text-destructive`

**Behavior**:

- Appears immediately when `error` state is set
- Persists until:
  - User clicks close button (X)
  - Session creation succeeds (auto-clears)
- Does not auto-dismiss on timeout (user must take action)

### Code Simplification

**Before** (Complex):

```tsx
// 3 refs to track state
const prevCreatingRef = useRef(false);
const prevSessionIdRef = useRef<string | null>(null);

// Complex scroll logic
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, isTyping, error]); // Monitors error

// Complex auto-clear logic
useEffect(() => {
  const wasCreating = prevCreatingRef.current;
  const prevSessionId = prevSessionIdRef.current;
  const justFinishedCreating = wasCreating && !isCreatingSession;
  const sessionChanged = activeSessionId !== prevSessionId;

  if (justFinishedCreating && sessionChanged && activeSessionId && error) {
    clearError();
  }

  prevCreatingRef.current = isCreatingSession;
  prevSessionIdRef.current = activeSessionId;
}, [isCreatingSession, activeSessionId, error, clearError]);

// Inline error in message area
{
  error && (
    <div className="flex justify-center">
      <div className="bg-destructive/10 ...">...</div>
    </div>
  );
}
```

**After** (Simple):

```tsx
// 1 ref for messages
const messagesEndRef = useRef<HTMLDivElement>(null);

// Simple scroll logic
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, isTyping]); // No error monitoring

// No auto-clear logic needed
// User dismisses manually or it clears on success via context

// Fixed error banner at top
{
  error && <div className="bg-destructive/10 border-b ...">...</div>;
}
```

**Metrics**:

- Lines of code: 59 → 40 (-32%)
- useRef count: 3 → 1 (-67%)
- useEffect count: 3 → 2 (-33%)
- Complexity: High → Low

### Trade-offs

**Accepted**:

- ✅ Error takes up vertical space (acceptable for rare errors)
- ✅ Requires manual dismissal (but provides clear user control)
- ✅ No auto-dismiss timeout (ensures users see the error)

**Rejected**:

- ❌ Complex scroll logic (not worth the complexity)
- ❌ Auto-clear on any state change (too aggressive, could hide errors)
- ❌ Multiple error stacking (single error at a time is clearer)

### Future Considerations

**If toast component is added**:

- Consider migrating to toast for transient errors (429, network)
- Keep banner for critical errors (500, auth failures)
- Add auto-dismiss timeout (3-5 seconds) for non-critical errors

**If multiple error types need different treatments**:

- Add error severity levels (info, warning, error, critical)
- Different styling per severity
- Different dismiss behaviors per severity

---

## Session Creation Loading State

### Context

**Date**: 2025-11-01  
**Commits**: `37bda67`, `fbd4d35`, `53c4700`

### Problem

Users had no feedback during session creation, leading to:

- Uncertainty about whether action was registered
- Multiple clicks on repository selector
- Confusion when creation failed

### Solution

**Loading Indicator**:

```tsx
{isCreatingSession ? (
  <div className="text-center text-muted-foreground py-8 space-y-2">
    <Loader2 className="h-8 w-8 mx-auto animate-spin" />
    <p className="font-medium">Creating session...</p>
    <p className="text-sm">Please wait</p>
  </div>
) : /* ... normal content ... */}
```

**Disabled States**:

- Input field: `disabled={isCreatingSession || ...}`
- Send button: `disabled={isCreatingSession || ...}`
- Repository selector: `disabled={isCreatingSession}`
- Placeholders updated to show "Creating session..."

### Design Rationale

**Visual Feedback**:

- Spinner icon (Loader2) provides motion feedback
- Centered in message area for prominence
- Two-line message: status + instruction

**Interaction Prevention**:

- Disable all input controls to prevent:
  - Double-submission
  - State conflicts
  - User confusion

**Placeholder Updates**:

- Input: "Creating session..." (instead of "Ask me anything...")
- Repository: "Creating session..." (instead of "Choose a repository...")
- Provides context-aware feedback

---

## Message Display Architecture

### Streaming vs Static Messages

**Streaming Messages**:

- Display partial content as it arrives
- Show streaming indicator
- Auto-scroll to latest content
- Merge rapid updates (2-second window)

**Static Messages**:

- Display complete content
- No streaming indicator
- Standard message styling

### Code Block Rendering

**Library**: `react-syntax-highlighter@16.1.0`

**Rationale**:

- Industry-standard syntax highlighting
- Supports 100+ languages
- Customizable themes
- Good performance for typical code snippets

**Styling**:

- Dark theme for code blocks
- Copy button per code block
- Rounded corners (0.5rem)
- Proper spacing and padding

---

## Session Management

### Archive vs Delete

**Decision**: Archive instead of delete

**Rationale**:

- Preserves conversation history
- Allows review of past sessions
- Safer than permanent deletion
- Can be hidden from view when not needed

**Implementation**:

- Status change: `active` → `archived`
- Hidden by default in session list
- "Show Archived" toggle to reveal
- Read-only when viewing archived sessions

---

## Performance Considerations

### Message Rendering

**Current**: Render all messages in DOM

**Limitations**:

- May slow down with 100+ messages
- No virtualization

**Future**: Consider virtual scrolling if needed

### State Management

**Current**: React Context for global state

**Rationale**:

- Simple for current scale
- Sufficient for single-panel UI
- Easy to understand and maintain

**Future**: Consider Zustand/Redux if state grows complex

---

## Accessibility

### Current Status

**Implemented**:

- Semantic HTML structure
- Proper heading hierarchy
- Button labels and ARIA attributes
- Keyboard navigation for buttons

**Not Implemented** (Future):

- Screen reader announcements for errors
- Screen reader announcements for new messages
- Keyboard shortcuts
- Focus management for modal dialogs
- ARIA live regions for dynamic content

---

## Mobile Responsiveness

### Current Status

**Implemented**:

- Responsive layout (Tailwind breakpoints)
- Touch-friendly button sizes
- Scrollable message area

**Not Implemented** (Future):

- Mobile-specific optimizations
- Touch gestures (swipe to archive, etc.)
- Mobile keyboard handling
- Reduced motion preferences

---

## Error Message Guidelines

### Tone

- **Friendly**: Avoid technical jargon
- **Actionable**: Tell user what to do next
- **Specific**: Explain what went wrong

### Examples

**Good**:

- ✅ "Too many requests. Please wait a moment and try again."
- ✅ "Server error. Please try again later."
- ✅ "Network connection lost. Check your internet and retry."

**Bad**:

- ❌ "Error 429"
- ❌ "Request failed"
- ❌ "An error occurred"

### HTTP Status Code Mapping

| Status | User Message                                             | Action           |
| ------ | -------------------------------------------------------- | ---------------- |
| 429    | "Too many requests. Please wait a moment and try again." | Wait, then retry |
| 500    | "Server error. Please try again later."                  | Retry later      |
| 503    | "Service temporarily unavailable. Please try again."     | Retry later      |
| 401    | "Session expired. Please refresh the page."              | Refresh          |
| 403    | "You don't have permission to perform this action."      | Contact admin    |
| 404    | "Resource not found. Please try a different action."     | Try different    |
| Other  | "Failed to create session. Please try again."            | Retry            |

---

## Design Principles

### Simplicity First

- Prefer simple solutions over complex ones
- Add complexity only when clearly needed
- Refactor to simplify when possible

### User Feedback

- Always provide feedback for user actions
- Loading states for async operations
- Clear error messages for failures
- Success indicators where appropriate

### Progressive Enhancement

- Core functionality works without JavaScript
- Enhanced experience with JavaScript
- Graceful degradation for older browsers

### Consistency

- Consistent spacing and sizing
- Consistent color usage
- Consistent interaction patterns
- Consistent terminology

---

## Open Questions

1. **Toast component**: Should we add a toast library for better error UX?
2. **Virtual scrolling**: At what message count should we implement virtualization?
3. **Offline support**: Should we cache messages for offline viewing?
4. **Message search**: Do users need to search within conversations?
5. **Export**: Should users be able to export conversation history?

---

**Last Updated**: 2025-11-01  
**Next Review**: After Phase 2 features discussion
