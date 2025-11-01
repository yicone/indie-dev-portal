# Agent Testing Tools - Usage Guide

## Overview

Simple environment-variable-based testing tools for simulating agent errors and delays.

## Environment Variables

Add these to your `.env` file or set them before starting the server:

```bash
# Enable test mode
AGENT_TEST_MODE=true

# Error type: none | 429 | 500 | network
AGENT_TEST_ERROR=none

# Delay in milliseconds (0-10000)
AGENT_TEST_DELAY=0

# Success rate percentage (0-100)
# 100 = always succeed, 0 = always fail
AGENT_TEST_SUCCESS_RATE=100
```

## Usage Examples

### Test Message Retry with Network Errors

```bash
# .env
AGENT_TEST_MODE=true
AGENT_TEST_ERROR=network
```

Restart backend:

```bash
cd api && pnpm dev
```

Now all agent requests will fail with network errors, allowing you to test the retry functionality.

### Test Rate Limiting (429)

```bash
# .env
AGENT_TEST_MODE=true
AGENT_TEST_ERROR=429
```

### Test Server Errors (500)

```bash
# .env
AGENT_TEST_MODE=true
AGENT_TEST_ERROR=500
```

### Test with Delays

```bash
# .env
AGENT_TEST_MODE=true
AGENT_TEST_DELAY=2000  # 2 second delay
```

### Test Random Failures

```bash
# .env
AGENT_TEST_MODE=true
AGENT_TEST_SUCCESS_RATE=50  # 50% success rate
```

## Disable Test Mode

```bash
# .env
AGENT_TEST_MODE=false
# or simply remove the variable
```

## Integration Example

The simulator is designed to be integrated into your API routes:

```typescript
import { getSimulatorConfig, applySimulator } from './testing/agentSimulator';

// In your route handler
const config = getSimulatorConfig();

const result = await applySimulator(config, async () => {
  // Your normal logic here
  return await sessionService.sendPrompt(id, request);
});
```

## Testing Scenarios

### Scenario 1: Message Retry Flow

1. Set `AGENT_TEST_ERROR=network`
2. Send a message in Agent Chat
3. Message should fail and show retry button
4. Set `AGENT_TEST_ERROR=none`
5. Click retry
6. Message should succeed

### Scenario 2: Error Recovery

1. Set `AGENT_TEST_ERROR=500`
2. Try to create a session
3. Should see error banner
4. Set `AGENT_TEST_ERROR=none`
5. Try again
6. Should succeed

### Scenario 3: Loading States

1. Set `AGENT_TEST_DELAY=3000`
2. Send a message
3. Should see loading indicator for 3 seconds
4. Message should complete

## Notes

- Test mode only affects agent-related endpoints
- Changes require backend restart
- Not for production use
- Console logs show current simulator status on startup
