# Agent Session State Machine

## Overview

**4-State Model**: `active`, `suspended`, `archived`, `error`

This model aligns with modern coding agent UX (Cursor, Copilot, Claude Code) where sessions don't "complete" - users can always continue conversations.

## State Definitions

### `active`

**Definition**: Session is currently running and accepting messages.

**Entry Conditions**:

- New session created via `POST /sessions`
- Session resumed (future feature)

**Exit Conditions**:

- Server shutdown → `suspended`
- User archives session → `archived`
- Fatal error (future) → `error`

**Note**: Agent process exit does NOT change session status. Session stays active to allow continuation.

**User Actions**:

- ✅ Can send messages
- ✅ Can view messages
- ✅ Can cancel session

---

### `suspended`

**Definition**: Session paused due to server restart or process termination. May be resumable when agent supports it.

**Entry Conditions**:

- Server graceful shutdown (SIGTERM/SIGINT)
- All active sessions are marked as suspended

**Exit Conditions**:

- Session resumed → `active` (future feature)
- Manual cleanup → stays `suspended`

**User Actions**:

- ❌ Cannot send messages
- ✅ Can view message history
- ℹ️ Shows "may be resumable when agent supports it"

**Code Reference**:

```typescript
// api/services/sessionService.ts:419-426
await prisma.agentSession.updateMany({
  where: { status: 'active' },
  data: {
    status: 'suspended',
    lastActiveAt: new Date(),
  },
});
```

---

### `archived`

**Definition**: Session archived by user. Hidden from UI by default but can be viewed.

**Entry Conditions**:

- User explicitly archives session
- Old `cancelled` or `completed` sessions migrated to `archived`

**Exit Conditions**:

- None (terminal state)

**User Actions**:

- ❌ Cannot send messages
- ✅ Can view message history (in "Show Archived" mode)
- ℹ️ Shows "Session is archived"

**UI Behavior**:

- Hidden from session list by default
- Not counted in badge
- Can be shown with "Show Archived" toggle

**Code Reference**:

```typescript
// api/services/sessionService.ts:269
await updateSessionStatus(sessionId, 'archived');
```

**Example Scenario**:

1. User has finished working on a feature
2. User clicks "Archive Session" button
3. Session status → `archived`
4. Session disappears from active list
5. User can view it later in "Show Archived"

---

### `error`

**Definition**: Session encountered a fatal error and cannot continue.

**Entry Conditions**:

- Fatal exception during execution (future implementation)
- Unrecoverable agent error

**Exit Conditions**:

- None (terminal state)

**User Actions**:

- ❌ Cannot send messages
- ❌ Hidden from UI (filtered out)

**Note**: Currently, agent process crashes do NOT set error status. Session stays active. Error status is reserved for future fatal errors that truly prevent continuation.

---

## State Transition Diagram

```
                    ┌─────────────┐
                    │   CREATE    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
              ┌────▶│   active    │
              │     └──────┬──────┘
              │            │
              │            │
    (future)  │     ┌──────┼──────┐
    resume    │     │      │      │
              │     │      │      │
              │     ▼      ▼      ▼
         ┌────┴────┐  ┌────────┐  ┌────────┐
         │suspended│  │archived│  │ error  │
         └─────────┘  └────────┘  └────────┘

Legend:
  ─────▶  Implemented transition
  ─ ─ ▶  Future transition (resume)

Note: Agent process exit does NOT change state
      Session stays active for continuation
```

---

## UI Filtering Rules

### Visible in Session List

- ✅ `active`
- ✅ `suspended`
- ❌ `archived` (hidden by default, shown with "Show Archived" toggle)
- ❌ `error`

### Counted in Badge

- ✅ `active`
- ✅ `suspended`
- ❌ `archived`
- ❌ `error`

### Input Enabled

- ✅ `active` only
- ❌ All others

---

## Database Schema

```prisma
model AgentSession {
  status String // 'active' | 'suspended' | 'archived' | 'error'

  @@index([status])
}
```

**Type Definition**:

```typescript
export type SessionStatus = 'active' | 'suspended' | 'archived' | 'error';
```

**Migration**:

```sql
-- Migrate from 5-state to 4-state model
UPDATE AgentSession
SET status = CASE
  WHEN status = 'completed' THEN 'active'
  WHEN status = 'cancelled' THEN 'archived'
  ELSE status
END
WHERE status IN ('completed', 'cancelled');
```

---

## Future Enhancements

### Session Resumption (Gemini CLI v0.12+)

**New Transitions**:

- `suspended` → `active` (resume session)

**Requirements**:

- Agent supports `session/resume` ACP method
- `supportsResume` flag is true
- `resumeData` contains valid resume context

**API**:

```typescript
POST /sessions/:id/resume
Response: { sessionId, status: 'active' }
```

### User Cancellation

**New Transitions**:

- `active` → `cancelled` (user cancels)

**API**:

```typescript
POST /sessions/:id/cancel
Response: { sessionId, status: 'cancelled' }
```

**UI**:

- Add "Cancel Session" button
- Confirmation dialog
- Graceful cleanup

---

## Cleanup Strategy

### Suspended Sessions

- Keep for 7 days
- After 7 days → archive or delete
- If `supportsResume: true` → keep longer (30 days)

### Error Sessions

- Keep for 24 hours for debugging
- After 24 hours → archive or delete

### Cancelled Sessions

- Keep for 24 hours
- After 24 hours → delete

**Implementation**:

```typescript
// Cleanup job (runs daily)
const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
await prisma.agentSession.deleteMany({
  where: {
    status: { in: ['suspended', 'error', 'cancelled'] },
    lastActiveAt: { lt: threshold },
  },
});
```
