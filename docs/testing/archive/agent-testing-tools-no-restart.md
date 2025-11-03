# Agent Testing Tools - No Restart Required! 🚀

## 🎯 Problem Solved

**Old Problem**:

- ❌ Need to restart backend to change test mode
- ❌ Restart causes sessions to suspend
- ❌ Can't test retry flow properly

**New Solution**:

- ✅ Change test mode via API (no restart!)
- ✅ Sessions stay active
- ✅ Perfect for testing retry flows

---

## 🔧 How It Works

Use the **Test Control API** to change simulator settings dynamically:

```bash
# Enable network errors for messages only
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "errorType": "network",
    "createSessionEnabled": false,
    "sendPromptEnabled": true
  }'
```

---

## 📋 Complete Test Flow (No Restart!)

### Step 1: Start Backend Once

```bash
# Terminal 1
cd api && pnpm dev
```

Keep this running! Don't restart it.

### Step 2: Create a Session

1. Open Agent Chat UI
2. Create a new session
3. Session should work normally

### Step 3: Enable Network Errors (via API)

```bash
# Terminal 2
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "errorType": "network",
    "createSessionEnabled": false,
    "sendPromptEnabled": true
  }'
```

**Response**:

```json
{
  "success": true,
  "config": {
    "enabled": true,
    "errorType": "network",
    "createSessionEnabled": false,
    "sendPromptEnabled": true
  }
}
```

### Step 4: Test Message Retry

1. Send a message → Should fail with network error
2. See retry button appear
3. Click retry → Should fail again

### Step 5: Disable Errors (via API)

```bash
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false
  }'
```

### Step 6: Test Retry Success

1. Click retry button again
2. Message should succeed now!

**✅ No restart needed! Session stays active!**

---

## 🎮 API Reference

### GET /test-control

Get current configuration:

```bash
curl http://localhost:4000/test-control
```

**Response**:

```json
{
  "runtime": {
    "enabled": true,
    "errorType": "network"
  },
  "env": {
    "AGENT_TEST_MODE": "false",
    "AGENT_TEST_ERROR": "none",
    ...
  }
}
```

### POST /test-control

Update configuration:

```bash
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "errorType": "429",
    "delay": 2000,
    "successRate": 50
  }'
```

**Parameters**:

- `enabled` (boolean) - Enable/disable test mode
- `errorType` ('none' | '429' | '500' | 'network') - Error type
- `delay` (number) - Delay in milliseconds (0-10000)
- `successRate` (number) - Success rate percentage (0-100)
- `createSessionEnabled` (boolean) - Override for session creation
- `sendPromptEnabled` (boolean) - Override for sending prompts

### DELETE /test-control

Reset to environment variables:

```bash
curl -X DELETE http://localhost:4000/test-control
```

---

## 🧪 Common Test Scenarios

### Scenario 1: Test Message Retry (Recommended)

```bash
# 1. Enable network errors for messages only
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"errorType":"network","createSessionEnabled":false,"sendPromptEnabled":true}'

# 2. Test in UI (messages fail)

# 3. Disable errors
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":false}'

# 4. Retry in UI (messages succeed)
```

### Scenario 2: Test Rate Limiting

```bash
# Enable 429 errors
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"errorType":"429"}'

# Test in UI

# Disable
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":false}'
```

### Scenario 3: Test with Delays

```bash
# Enable 3-second delay
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"delay":3000,"errorType":"none"}'

# Test in UI (see loading state)

# Disable
curl -X DELETE http://localhost:4000/test-control
```

### Scenario 4: Test Random Failures

```bash
# 50% success rate
curl -X POST http://localhost:4000/test-control \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"successRate":50,"errorType":"none"}'

# Test multiple times

# Reset
curl -X DELETE http://localhost:4000/test-control
```

---

## 💡 Helper Scripts

Create a file `test-helpers.sh`:

```bash
#!/bin/bash

API="http://localhost:4000/test-control"

# Enable network errors for messages
enable_network_errors() {
  curl -X POST $API -H "Content-Type: application/json" \
    -d '{"enabled":true,"errorType":"network","createSessionEnabled":false,"sendPromptEnabled":true}'
}

# Disable all errors
disable_errors() {
  curl -X POST $API -H "Content-Type: application/json" \
    -d '{"enabled":false}'
}

# Reset to env vars
reset() {
  curl -X DELETE $API
}

# Show current config
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

## 🎯 Advantages

1. **No Restart** - Backend stays running
2. **Sessions Stay Active** - No suspension issues
3. **Fast Testing** - Switch modes instantly
4. **Flexible** - Change any setting on the fly
5. **Scriptable** - Automate test scenarios

---

## 📝 Notes

- Test Control API only works in development mode
- Runtime config overrides environment variables
- Use `DELETE /test-control` to reset to `.env` settings
- Perfect for manual testing and debugging

---

## 📚 See Also

- **Cheatsheet**: `docs/testing/agent-testing-tools-cheatsheet.md`
- **Quick Test**: `docs/testing/agent-testing-tools-quick-test.md`
- **Full Guide**: `docs/AGENT_TESTING_TOOLS_USAGE_GUIDE.md`
