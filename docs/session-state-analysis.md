# Session State Analysis & Recommendations

## Current Problems

### Problem 1: 'completed' Status Misalignment

**Original Spec** (agent-session/spec.md):

```markdown
#### Scenario: Completed session

- WHEN a session is gracefully terminated by user request
- THEN the session status is updated to 'completed'
```

**Current Implementation** (sessionService.ts:140):

```typescript
await updateSessionStatus(sessionId, code === 0 ? 'completed' : 'error');
```

**Contradiction**:

- Spec says: User requests termination → `completed`
- Code does: Agent process exits → `completed`
- Reality: Agent process exit ≠ User wants to end conversation

**Modern Agent UX**:

- Cursor, Copilot, Claude Code: Sessions never "complete"
- Users can always continue the conversation
- Users can "archive" sessions (hide but keep)

### Problem 2: ACP Protocol Alignment

**Finding**: ACP protocol does NOT define session states!

ACP only defines:

- `session/new` - Create session
- `session/prompt` - Send message
- `session/cancel` - Cancel session
- `session/update` - Update notification (status?: string, no enum)

**Implication**:

- Session states are **application-level** concerns
- We should design based on UX needs, not protocol constraints
- No need to "align with ACP" because ACP doesn't specify states

### Problem 3: Prisma Data Migration

**Current Issue**:

- Schema migration: ✅ Automatic
- Data migration: ❌ Manual (ran separately after discovering issue)

**Prisma Philosophy**:

- Schema changes: Auto-generated SQL
- Data transformations: Manual (for safety and flexibility)

**What We Did**:

1. Generated schema migration
2. Discovered old data had wrong status
3. Manually updated data with SQL

**Better Approach**:

- Add data transformation directly in migration SQL
- Atomic: Schema + Data in one transaction

---

## Recommended Solution

### New State Model

**Remove 'completed', Add 'archived'**:

```typescript
export type SessionStatus =
  | 'active' // Can send messages, agent may or may not be running
  | 'suspended' // Server restarted, may be resumable
  | 'archived' // User archived, hidden from UI
  | 'error'; // Fatal error, hidden from UI
```

**Rationale**:

- `active`: Default state, always allows continuation
- `suspended`: Technical pause (server restart), transparent to user
- `archived`: User action (like "Archive" in Cursor)
- `error`: Fatal error, needs attention

### State Transitions

```
CREATE → active
         │
         ├─→ suspended (server restart) ──→ active (resume)
         ├─→ archived (user archives)
         └─→ error (fatal error)
```

**Key Changes**:

- Agent process exit does NOT change status
- Session stays `active` until user archives
- `suspended` is temporary, auto-resumes when possible

### Agent Process Lifecycle

**Decouple Process from Session**:

```typescript
// OLD: Process exit → Session completed ❌
process.on('exit', (code) => {
  updateSessionStatus(sessionId, code === 0 ? 'completed' : 'error');
});

// NEW: Process exit → Restart if needed ✅
process.on('exit', (code) => {
  if (code !== 0) {
    logError(sessionId, code);
  }
  // Session stays active
  // Next prompt will restart process if needed
});
```

**Lazy Process Management**:

- Process starts on first prompt
- Process may exit after idle
- Process restarts on next prompt
- Session status unchanged

### Migration Best Practice

**Include Data Migration in SQL**:

```sql
-- migration.sql
PRAGMA foreign_keys=OFF;

-- Schema changes (auto-generated)
CREATE TABLE "new_AgentSession" (...);

-- Data migration (manually added) ⭐
INSERT INTO "new_AgentSession" (...)
SELECT ... FROM "AgentSession";

-- Transform old data ⭐
UPDATE "new_AgentSession"
SET status = CASE
  WHEN status = 'completed' THEN 'active'  -- Allow continuation
  WHEN status = 'cancelled' THEN 'archived'  -- User archived
  WHEN status = 'active' THEN 'active'
  WHEN status = 'error' THEN 'error'
  ELSE 'active'
END;

DROP TABLE "AgentSession";
ALTER TABLE "new_AgentSession" RENAME TO "AgentSession";

PRAGMA foreign_keys=ON;
```

---

## Implementation Plan

### Phase 1: Update State Model

1. Update `SessionStatus` type

   ```typescript
   - export type SessionStatus = 'active' | 'suspended' | 'completed' | 'cancelled' | 'error';
   + export type SessionStatus = 'active' | 'suspended' | 'archived' | 'error';
   ```

2. Update Prisma schema comments

   ```prisma
   - status String // 'active', 'suspended', 'completed', 'cancelled', 'error'
   + status String // 'active', 'suspended', 'archived', 'error'
   ```

3. Create migration with data transformation
   ```sql
   UPDATE AgentSession
   SET status = CASE
     WHEN status IN ('completed', 'cancelled') THEN 'archived'
     ELSE status
   END;
   ```

### Phase 2: Decouple Process from Session

1. Remove status update on process exit

   ```typescript
   // sessionService.ts
   - await updateSessionStatus(sessionId, code === 0 ? 'completed' : 'error');
   + // Session stays active
   + if (code !== 0) {
   +   await logProcessError(sessionId, code);
   + }
   ```

2. Implement lazy process management
   ```typescript
   async function sendPrompt(sessionId: string, prompt: string) {
     let process = getProcess(sessionId);
     if (!process || !process.isAlive()) {
       process = await startProcess(sessionId); // Restart if needed
     }
     await process.sendPrompt(prompt);
   }
   ```

### Phase 3: Add Archive Feature

1. Add archive endpoint

   ```typescript
   POST /sessions/:id/archive
   ```

2. Update UI
   - Add "Archive" button
   - Filter archived sessions by default
   - Add "Show Archived" toggle

### Phase 4: Update Specs

1. Modify `agent-session/spec.md`
   - Remove "Completed session" scenario
   - Add "Archived session" scenario
   - Update process lifecycle description

2. Update `agent-session-states.md`
   - Remove `completed` documentation
   - Add `archived` documentation
   - Update state diagram

---

## Benefits

### User Experience

- ✅ Can always continue conversations (like Cursor)
- ✅ Explicit archive action (user control)
- ✅ No confusion about "completed" vs "can I continue?"

### Technical

- ✅ Simpler state model (4 states instead of 5)
- ✅ Process lifecycle independent of session
- ✅ Better resource management (lazy start)

### Alignment

- ✅ Matches modern agent UX patterns
- ✅ ACP-agnostic (protocol doesn't define states)
- ✅ Clear semantics for each state

---

## Migration Path

### For Existing Data

```sql
-- Convert old states to new model
UPDATE AgentSession SET status = 'archived'
WHERE status IN ('completed', 'cancelled');

-- All other sessions stay active
UPDATE AgentSession SET status = 'active'
WHERE status NOT IN ('active', 'suspended', 'archived', 'error');
```

### For Users

- Old "completed" sessions → Now "active" (can continue)
- Old "cancelled" sessions → Now "archived" (hidden by default)
- No breaking changes to API (status field still exists)

---

## Open Questions

1. **Idle Timeout**: Should we auto-archive sessions after X days of inactivity?
   - Recommendation: Yes, after 30 days → `archived`

2. **Process Cleanup**: When to terminate idle processes?
   - Recommendation: After 5 minutes of no activity

3. **Resume Suspended**: Should we auto-resume on next prompt?
   - Recommendation: Yes, transparent to user

4. **Archive vs Delete**: Should users be able to delete sessions?
   - Recommendation: Archive is soft delete, add hard delete later if needed
