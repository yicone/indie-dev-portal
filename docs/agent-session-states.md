# Agent Session State Machine

## State Definitions

### `active`

**Definition**: Session is currently running and accepting messages.

**Entry Conditions**:

- New session created via `POST /sessions`
- Session resumed (future feature)

**Exit Conditions**:

- Agent process exits normally → `completed`
- Agent process exits with error → `error`
- Server shutdown → `suspended`
- User cancels session → `cancelled`

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

### `completed`

**Definition**: Session finished successfully. Agent completed all tasks and exited normally.

**Entry Conditions**:

- Agent process exits with code 0
- Session was in `active` state

**Exit Conditions**:

- None (terminal state)

**User Actions**:

- ❌ Cannot send messages
- ✅ Can view message history
- ℹ️ Shows "Session is completed"

**Code Reference**:

```typescript
// api/services/sessionService.ts:140
await updateSessionStatus(sessionId, code === 0 ? 'completed' : 'error');
```

**Example Scenario**:

1. User: "Please update the README"
2. Agent: Updates README, commits changes
3. Agent: "Task completed successfully"
4. Agent process exits with code 0
5. Session status → `completed`

---

### `cancelled`

**Definition**: Session cancelled by user or system. Not resumable.

**Entry Conditions**:

- User explicitly cancels session (future feature)
- Manual intervention

**Exit Conditions**:

- None (terminal state)

**User Actions**:

- ❌ Cannot send messages
- ❌ Hidden from UI (filtered out)

**UI Behavior**:

- Not shown in session list
- Not counted in badge

**Note**: Currently, `cancelled` sessions are migrated to `suspended` for better UX.

---

### `error`

**Definition**: Session encountered a fatal error and cannot continue.

**Entry Conditions**:

- Agent process exits with non-zero code
- Session was in `active` state
- Fatal exception during execution

**Exit Conditions**:

- None (terminal state)

**User Actions**:

- ❌ Cannot send messages
- ❌ Hidden from UI (filtered out)

**Code Reference**:

```typescript
// api/services/sessionService.ts:140
await updateSessionStatus(sessionId, code === 0 ? 'completed' : 'error');
```

**Example Scenario**:

1. User: "Please deploy the app"
2. Agent: Attempts deployment
3. Agent: Encounters authentication error
4. Agent process crashes with code 1
5. Session status → `error`

---

## State Transition Diagram

```
                    ┌─────────────┐
                    │   CREATE    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
              ┌────▶│   active    │◀────┐
              │     └──────┬──────┘     │
              │            │            │
              │            │            │ (future)
    (future)  │     ┌──────┼──────┐     │ resume
    resume    │     │      │      │     │
              │     │      │      │     │
              │     ▼      ▼      ▼     │
         ┌────┴────┐  ┌────────┐  ┌────┴────┐
         │suspended│  │completed│  │cancelled│
         └─────────┘  └────────┘  └─────────┘
              ▲                         ▲
              │                         │
              │      ┌────────┐         │
              └──────│ error  │─────────┘
                     └────────┘

Legend:
  ─────▶  Implemented transition
  ─ ─ ▶  Future transition
```

---

## UI Filtering Rules

### Visible in Session List

- ✅ `active`
- ✅ `suspended`
- ✅ `completed`
- ❌ `cancelled`
- ❌ `error`

### Counted in Badge

- ✅ `active`
- ✅ `suspended`
- ✅ `completed`
- ❌ `cancelled`
- ❌ `error`

### Input Enabled

- ✅ `active` only
- ❌ All others

---

## Database Schema

```prisma
model AgentSession {
  status String // 'active' | 'suspended' | 'completed' | 'cancelled' | 'error'

  @@index([status])
}
```

**Type Definition**:

```typescript
export type SessionStatus = 'active' | 'suspended' | 'completed' | 'cancelled' | 'error';
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
