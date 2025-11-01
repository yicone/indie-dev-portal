# Session Status Manual Test Checklist

## Test Environment Setup

```bash
# 1. Start dev server
pnpm dev

# 2. Open browser to http://localhost:3000
# 3. Open DevTools Console
# 4. Open SQLite database in another terminal
sqlite3 prisma/dev.db
```

---

## Test Cases

### ✅ Test 1: Create Session (Active Status)

**Steps**:

1. Click "AI Assistant" floating button
2. Click "New Session"
3. Select a repository

**Expected**:

- ✅ Session created with status 'active'
- ✅ Session appears in session list
- ✅ Badge count increases by 1

**Verify in DB**:

```sql
SELECT id, status, createdAt FROM AgentSession ORDER BY createdAt DESC LIMIT 1;
-- Should show: status = 'active'
```

---

### ✅ Test 2: Session Stays Active After Message

**Steps**:

1. In active session, send a message: "Hello"
2. Wait for agent response
3. Check session status

**Expected**:

- ✅ Session remains 'active'
- ✅ Messages appear in chat
- ✅ Session still in list

**Verify in DB**:

```sql
SELECT status FROM AgentSession WHERE id = '<session_id>';
-- Should show: status = 'active'
```

---

### ✅ Test 3: Server Restart → Suspended

**Steps**:

1. Create an active session
2. Stop server: Ctrl+C in terminal
3. Check database

**Expected**:

- ✅ Session status changed to 'suspended'
- ✅ lastActiveAt updated

**Verify in DB**:

```sql
SELECT id, status, lastActiveAt FROM AgentSession WHERE status = 'suspended';
-- Should show: status = 'suspended', recent lastActiveAt
```

**Verify in UI** (after restart):

- ✅ Suspended session still visible
- ✅ Shows "Session is suspended" message
- ✅ Badge count includes suspended session

---

### ✅ Test 4: Process Exit Does NOT Change Status

**Steps**:

1. Create active session
2. Send message that causes agent to exit (e.g., "exit")
3. Wait for process to exit
4. Check session status

**Expected**:

- ✅ Session remains 'active' (NOT completed!)
- ✅ Can send another message
- ✅ Process restarts automatically

**Verify in DB**:

```sql
SELECT status FROM AgentSession WHERE id = '<session_id>';
-- Should show: status = 'active' (NOT 'completed' or 'error')
```

---

### ✅ Test 5: Archive Session (Future Feature)

**Manual DB Update** (simulating archive action):

```sql
UPDATE AgentSession SET status = 'archived' WHERE id = '<session_id>';
```

**Expected in UI**:

- ✅ Session disappears from list
- ✅ Badge count decreases
- ✅ Session not shown in dropdown

**Verify in DB**:

```sql
SELECT id, status FROM AgentSession WHERE status = 'archived';
-- Should show: status = 'archived'
```

---

### ✅ Test 6: UI Filtering

**Setup**:

```sql
-- Create sessions with different statuses
INSERT INTO AgentSession (id, repoId, status, createdAt, updatedAt)
VALUES
  ('test-active', 1, 'active', datetime('now'), datetime('now')),
  ('test-suspended', 1, 'suspended', datetime('now'), datetime('now')),
  ('test-archived', 1, 'archived', datetime('now'), datetime('now')),
  ('test-error', 1, 'error', datetime('now'), datetime('now'));
```

**Expected in UI**:

- ✅ Shows: test-active, test-suspended
- ❌ Hides: test-archived, test-error
- ✅ Badge count = 2

**Verify**:

```javascript
// In browser console
const sessions = Array.from(document.querySelectorAll('[data-session-id]'));
console.log('Visible sessions:', sessions.length); // Should be 2
```

---

### ✅ Test 7: Migration Data Integrity

**Verify Migration Applied**:

```sql
SELECT migration_name, finished_at
FROM _prisma_migrations
WHERE migration_name LIKE '%simplify_session_states%';
-- Should show: 20251101034240_simplify_session_states_to_4
```

**Verify No Old States**:

```sql
SELECT DISTINCT status FROM AgentSession;
-- Should show: active, suspended, archived, error
-- Should NOT show: completed, cancelled
```

**If old states exist**:

```sql
-- Check for old states
SELECT id, status FROM AgentSession WHERE status IN ('completed', 'cancelled');
-- If found, migration didn't run properly
```

---

### ✅ Test 8: Badge Count Accuracy

**Setup**:

```sql
-- Count sessions in DB
SELECT status, COUNT(*) as count
FROM AgentSession
WHERE status IN ('active', 'suspended')
GROUP BY status;
```

**Expected in UI**:

- ✅ Badge number matches DB count
- ✅ Only counts active + suspended
- ✅ Does NOT count archived or error

---

### ✅ Test 9: Session Switching

**Steps**:

1. Create 2 active sessions
2. Switch between them in dropdown
3. Send messages in each

**Expected**:

- ✅ Messages appear in correct session
- ✅ History loads correctly
- ✅ Both sessions remain active

---

### ✅ Test 10: Concurrent Sessions

**Steps**:

1. Open app in 2 browser tabs
2. Create session in Tab 1
3. Check if visible in Tab 2 (after refresh)

**Expected**:

- ✅ Session visible in both tabs
- ✅ Messages sync (via WebSocket)
- ✅ Status consistent across tabs

---

## Summary Checklist

- [ ] Test 1: Create session → active ✅
- [ ] Test 2: Session stays active after messages ✅
- [ ] Test 3: Server restart → suspended ✅
- [ ] Test 4: Process exit does NOT change status ✅
- [ ] Test 5: Archive functionality ✅
- [ ] Test 6: UI filtering (show/hide) ✅
- [ ] Test 7: Migration data integrity ✅
- [ ] Test 8: Badge count accuracy ✅
- [ ] Test 9: Session switching ✅
- [ ] Test 10: Concurrent sessions ✅

---

## Quick Verification Commands

```bash
# Check all session statuses
sqlite3 prisma/dev.db "SELECT status, COUNT(*) FROM AgentSession GROUP BY status;"

# Check recent sessions
sqlite3 prisma/dev.db "SELECT id, status, createdAt FROM AgentSession ORDER BY createdAt DESC LIMIT 5;"

# Check for old statuses (should be empty)
sqlite3 prisma/dev.db "SELECT * FROM AgentSession WHERE status IN ('completed', 'cancelled');"

# Check migration history
sqlite3 prisma/dev.db "SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 3;"
```

---

## Automated Test Script

```bash
#!/bin/bash
# Quick automated checks

echo "🧪 Running Session Status Tests..."

# Test 1: Check migration applied
echo "📝 Test 1: Migration applied"
MIGRATION=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM _prisma_migrations WHERE migration_name = '20251101034240_simplify_session_states_to_4';")
if [ "$MIGRATION" = "1" ]; then
  echo "✅ Migration applied"
else
  echo "❌ Migration NOT applied"
fi

# Test 2: Check no old statuses
echo "📝 Test 2: No old statuses"
OLD_STATUSES=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM AgentSession WHERE status IN ('completed', 'cancelled');")
if [ "$OLD_STATUSES" = "0" ]; then
  echo "✅ No old statuses found"
else
  echo "❌ Found $OLD_STATUSES sessions with old statuses"
fi

# Test 3: Check valid statuses only
echo "📝 Test 3: Valid statuses only"
INVALID=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM AgentSession WHERE status NOT IN ('active', 'suspended', 'archived', 'error');")
if [ "$INVALID" = "0" ]; then
  echo "✅ All statuses valid"
else
  echo "❌ Found $INVALID sessions with invalid statuses"
fi

# Test 4: Check TypeScript compiles
echo "📝 Test 4: TypeScript compilation"
pnpm exec tsc --noEmit > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ TypeScript compiles"
else
  echo "❌ TypeScript errors"
fi

# Test 5: Check OpenSpec validation
echo "📝 Test 5: OpenSpec validation"
openspec validate add-agent-chat-ui --strict > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ OpenSpec valid"
else
  echo "❌ OpenSpec validation failed"
fi

echo ""
echo "📊 Test Summary Complete"
```

Save as `scripts/test-session-status.sh` and run:

```bash
chmod +x scripts/test-session-status.sh
./scripts/test-session-status.sh
```
