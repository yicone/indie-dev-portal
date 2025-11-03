# Agent Testing Tools - Complete Guide

> **Single Source of Truth** for agent testing tools documentation.
>
> **Quick Reference**: See [Cheatsheet](./agent-testing-tools-cheatsheet.md) for common commands.

## Overview

Environment-variable and API-based testing tools for simulating agent errors, delays, and failures without modifying production code.

### Key Features

- ✅ **No Code Changes** - Pure configuration-based testing
- ✅ **Runtime Control** - Change settings via API without restart
- ✅ **Fine-Grained** - Control specific endpoints independently
- ✅ **Session Preservation** - Test retry flows without session suspension

### Requirements

For complete requirements and scenarios, see [agent-testing-tools spec](../../openspec/specs/agent-testing-tools/spec.md).

---

## Quick Start (5 Minutes)

### Method 1: API Control (Recommended - No Restart!)

1. **Start backend once**:

   ```bash
   cd api && pnpm dev
   ```

2. **Enable test mode via API**:

   ```bash
   curl -X POST http://localhost:4000/test-control \
     -H "Content-Type: application/json" \
     -d '{
       "enabled": true,
       "errorType": "network",
       "createSessionEnabled": false,
       "sendPromptEnabled": true
     }'
   ```

3. **Test in UI**:
   - Create session (works normally)
   - Send message (fails with network error)
   - Click retry button

4. **Disable errors**:

   ```bash
   curl -X POST http://localhost:4000/test-control \
     -H "Content-Type: application/json" \
     -d '{"enabled": false}'
   ```

5. **Retry message** - Should succeed!

**Advantages**: No restart, sessions stay active, instant switching.

### Method 2: Environment Variables (Requires Restart)

1. **Edit `.env`**:

   ```bash
   AGENT_TEST_MODE=true
   AGENT_TEST_ERROR=network
   AGENT_TEST_CREATE_SESSION=false
   AGENT_TEST_SEND_PROMPT=true
   ```

2. **Restart backend**:

   ```bash
   cd api && pnpm dev
   ```

3. **Test in UI** (same as Method 1)

**Use when**: You want persistent settings across restarts.

---

## Configuration

### Environment Variables

Add to `.env` file:

```bash
# Enable test mode
AGENT_TEST_MODE=true

# Error type: none | 429 | 500 | network
AGENT_TEST_ERROR=none

# Delay in milliseconds (0-10000)
AGENT_TEST_DELAY=0

# Success rate percentage (0-100)
AGENT_TEST_SUCCESS_RATE=100

# Fine-grained control (optional)
AGENT_TEST_CREATE_SESSION=false  # Override for session creation
AGENT_TEST_SEND_PROMPT=true      # Override for sending prompts
```

### Runtime API

#### GET /test-control

Get current configuration:

```bash
curl http://localhost:4000/test-control
```

**Response**:

```json
{
  "runtime": {
    "enabled": true,
    "errorType": "network",
    "createSessionEnabled": false,
    "sendPromptEnabled": true
  },
  "env": {
    "AGENT_TEST_MODE": "false",
    "AGENT_TEST_ERROR": "none"
  }
}
```

#### POST /test-control

Update configuration (no restart required):

```bash
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "errorType": "429",
    "delay": 2000,
    "successRate": 50,
    "createSessionEnabled": true,
    "sendPromptEnabled": false
  }'
```

**Parameters**:

- `enabled` (boolean) - Enable/disable test mode
- `errorType` ('none' | '429' | '500' | 'network') - Error type to simulate
- `delay` (number) - Response delay in milliseconds (0-10000)
- `successRate` (number) - Success rate percentage (0-100)
- `createSessionEnabled` (boolean) - Override for session creation endpoint
- `sendPromptEnabled` (boolean) - Override for message sending endpoint

#### DELETE /test-control

Reset to environment variables:

```bash
curl -X DELETE http://localhost:4000/test-control
```

---

## Testing Scenarios

### Scenario 1: Message Retry Flow (Recommended)

**Goal**: Test message retry without session suspension.

**Setup**:

```bash
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"errorType":"network","createSessionEnabled":false,"sendPromptEnabled":true}'
```

**Steps**:

1. Create session → ✅ Succeeds
2. Send message → ❌ Fails with network error
3. See retry button appear
4. Click retry → ❌ Fails again
5. Disable errors: `curl -X POST http://localhost:4000/test-control -H "Content-Type: application/json" -d '{"enabled":false}'`
6. Click retry → ✅ Succeeds!

**Expected**: Session stays active throughout, retry flow works perfectly.

### Scenario 2: Rate Limiting (429)

**Setup**:

```bash
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"errorType":"429"}'
```

**Test**: Try to create session or send message.

**Expected**:

- 429 error with "Too Many Requests (Test Mode)"
- Retry-after header included
- Error banner displays rate limit message

### Scenario 3: Server Errors (500)

**Setup**:

```bash
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"errorType":"500"}'
```

**Test**: Try to create session or send message.

**Expected**: 500 error with "Internal Server Error (Test Mode)"

### Scenario 4: Network Failures

**Setup**:

```bash
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"errorType":"network"}'
```

**Test**: Try to create session or send message.

**Expected**: Network error with "Service Unavailable (Test Mode)"

### Scenario 5: Response Delays

**Setup**:

```bash
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"delay":3000,"errorType":"none"}'
```

**Test**: Create session or send message.

**Expected**:

- Loading indicator visible for 3 seconds
- Then operation completes successfully

### Scenario 6: Random Failures

**Setup**:

```bash
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"successRate":50,"errorType":"none"}'
```

**Test**: Try multiple operations.

**Expected**: About 50% succeed, 50% fail randomly

### Scenario 7: Session Creation Only

**Setup**:

```bash
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"errorType":"429","createSessionEnabled":true,"sendPromptEnabled":false}'
```

**Test**:

1. Try to create session → ❌ Fails with 429
2. Disable errors
3. Create session → ✅ Succeeds
4. Send messages → ✅ Work normally

**Expected**: Only session creation is affected, messages work fine.

---

## Helper Scripts

Create `test-helpers.sh` for quick testing:

```bash
#!/bin/bash

API="http://localhost:4000/test-control"

# Enable network errors for messages only
enable_network_errors() {
  curl -X POST $API -H "Content-Type: application/json" \
    -d '{"enabled":true,"errorType":"network","createSessionEnabled":false,"sendPromptEnabled":true}'
}

# Enable rate limiting
enable_rate_limit() {
  curl -X POST $API -H "Content-Type: application/json" \
    -d '{"enabled":true,"errorType":"429"}'
}

# Enable delays
enable_delays() {
  curl -X POST $API -H "Content-Type: application/json" \
    -d '{"enabled":true,"delay":3000,"errorType":"none"}'
}

# Disable all errors
disable_errors() {
  curl -X POST $API -H "Content-Type: application/json" \
    -d '{"enabled":false}'
}

# Reset to environment variables
reset() {
  curl -X DELETE $API
}

# Show current configuration
show() {
  curl $API | jq
}

# Run the function passed as argument
"$@"
```

**Usage**:

```bash
chmod +x test-helpers.sh
./test-helpers.sh enable_network_errors
./test-helpers.sh show
./test-helpers.sh disable_errors
```

---

## Integration

The simulator is integrated into API routes using middleware:

```typescript
import { getSimulatorConfig, applySimulator } from './testing/agentSimulator';

// In your route handler
const config = getSimulatorConfig();

const result = await applySimulator(config, async () => {
  // Your normal logic here
  return await sessionService.sendPrompt(id, request);
});
```

**Integrated Endpoints**:

- ✅ `POST /api/sessions` - Create session
- ✅ `POST /api/sessions/:id/prompt` - Send message

**Not Integrated** (not needed for agent testing):

- WebSocket connections
- Other API endpoints

---

## Troubleshooting

### Simulator Not Working

**Check**:

1. Is `AGENT_TEST_MODE=true` set?
2. Did you restart backend (if using .env)?
3. Are you seeing `[AgentSimulator]` logs on startup?
4. Do error messages include "(Test Mode)"?

**Console Logs**:

```
[AgentSimulator] Test mode ENABLED
[AgentSimulator] Error type: network
[AgentSimulator] Delay: 0ms
[AgentSimulator] Success rate: 100%
```

### Can't Create Sessions

**Problem**: Sessions fail when you want them to succeed.

**Solution**: Disable simulator for session creation:

```bash
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"createSessionEnabled":false}'
```

Or in `.env`:

```bash
AGENT_TEST_CREATE_SESSION=false
```

### Sessions Suspend During Testing

**Problem**: Restarting backend suspends active sessions.

**Solution**: Use API control instead of .env changes:

- No restart needed
- Sessions stay active
- Perfect for retry testing

### Still Seeing Real Errors

**Check**:

- Simulator only affects `/api/sessions` endpoints
- Other endpoints work normally
- Test mode errors include "(Test Mode)" in message

---

## Best Practices

1. **Use API Control** - Avoid restarts, keep sessions active
2. **Fine-Grained Control** - Test specific endpoints independently
3. **Helper Scripts** - Automate common test scenarios
4. **Check Logs** - Verify simulator status on startup
5. **Reset After Testing** - Use `DELETE /test-control` to clean up

---

## Notes

- Test Control API only works in development mode
- Runtime configuration overrides environment variables
- Changes via API apply immediately (no restart)
- Environment variables require backend restart
- Test mode indicator: "(Test Mode)" in error messages
- Not for production use

---

## Related Documentation

- **Quick Reference**: [Cheatsheet](./agent-testing-tools-cheatsheet.md)
- **Requirements**: [Spec](../../openspec/specs/agent-testing-tools/spec.md)
- **Phase 2 Testing**: [MVP Testing Guide](./phase2-mvp-testing-guide.md)
