# Agent Testing Tools - Quick Test Guide

## Quick Start

Test the Agent Testing Tools integration in 3 steps:

### 1. Enable Test Mode

Edit your `.env` file:

```bash
# Enable test mode with network errors
AGENT_TEST_MODE=true
AGENT_TEST_ERROR=network
```

### 2. Restart Backend

```bash
cd api
pnpm dev
```

You should see:

```
[AgentSimulator] Test mode ENABLED
[AgentSimulator] Error type: network
[AgentSimulator] Delay: 0ms
[AgentSimulator] Success rate: 100%
```

### 3. Test in UI

1. Open Agent Chat UI
2. Try to create a new session
3. **Expected**: Session creation fails with "Service Unavailable (Test Mode)"
4. **Expected**: Error banner shows network error message

## Test Scenarios

### Scenario 1: Network Errors (Message Retry)

**Setup**:

```bash
AGENT_TEST_MODE=true
AGENT_TEST_ERROR=network
```

**Test**:

1. Create a session (will fail - that's expected for now)
2. Send a message
3. Message should fail
4. Click retry button
5. Message should fail again

**Expected**: Failed message styling + retry button visible

### Scenario 2: Rate Limiting (429)

**Setup**:

```bash
AGENT_TEST_MODE=true
AGENT_TEST_ERROR=429
```

**Test**:

1. Try to create a session
2. Should get "Too Many Requests (Test Mode)"
3. Error banner should show rate limit message

**Expected**: 429 error with retry-after header

### Scenario 3: Server Errors (500)

**Setup**:

```bash
AGENT_TEST_MODE=true
AGENT_TEST_ERROR=500
```

**Test**:

1. Try to create a session
2. Should get "Internal Server Error (Test Mode)"

**Expected**: 500 error with appropriate message

### Scenario 4: Delays

**Setup**:

```bash
AGENT_TEST_MODE=true
AGENT_TEST_ERROR=none
AGENT_TEST_DELAY=3000
```

**Test**:

1. Create a session
2. Should see loading indicator for 3 seconds
3. Then succeed

**Expected**: Loading state visible during delay

### Scenario 5: Random Failures

**Setup**:

```bash
AGENT_TEST_MODE=true
AGENT_TEST_ERROR=none
AGENT_TEST_SUCCESS_RATE=50
```

**Test**:

1. Try to create multiple sessions
2. About 50% should fail randomly

**Expected**: Intermittent failures

## Disable Test Mode

```bash
AGENT_TEST_MODE=false
# or remove the line
```

Restart backend and test normal operation.

## Troubleshooting

### Simulator not working?

1. Check `.env` file has correct variables
2. Restart backend server
3. Check console logs for simulator status
4. Verify `AGENT_TEST_MODE=true`

### Still seeing real errors?

- Simulator only affects `/api/sessions` endpoints
- Other endpoints work normally
- Check if error message includes "(Test Mode)"

## Integration Status

✅ **Integrated Endpoints**:

- `POST /api/sessions` - Create session
- `POST /api/sessions/:id/prompt` - Send message

⏳ **Not Yet Integrated**:

- WebSocket connections (future)
- Other API endpoints (not needed for agent testing)

## Next Steps

After testing, see:

- Full usage guide: `docs/AGENT_TESTING_TOOLS_USAGE_GUIDE.md`
- Phase 2 testing: `docs/testing/phase2-mvp-testing-guide.md`
