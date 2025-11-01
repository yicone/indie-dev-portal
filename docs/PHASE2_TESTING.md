# Phase 2 MVP Testing Guide

## Quick Start

```bash
# Terminal 1: Frontend
pnpm dev

# Terminal 2: Backend
cd api && pnpm dev
```

## Test 1: Session Rename

### Steps

1. Open Agent Chat Panel
2. Click ✏️ next to "Active Sessions:"
3. Type new name: `"My Test Session"`
4. Press Enter or click ✓

### Expected

- ✅ Name updates immediately
- ✅ Persists after refresh

### Test Cases

- Empty name → Error
- 101 characters → Rejected
- Special chars `"测试🚀"` → Works
- Escape → Cancels

## Test 2: Message Retry

### Method A: Manual Disconnect (Recommended)

1. Open Agent Chat Panel
2. **Disconnect WiFi**
3. Send message: `"test"`
4. Wait for failure (red border + Retry button)
5. **Reconnect WiFi**
6. Click 🔄 Retry

### Expected Results

- ✅ Red border on failed message
- ✅ Retry button appears
- ✅ **Timestamp KEEPS original time** (message was sent at that time)
- ✅ Message resends successfully
- ✅ Status changes from "Failed" to normal

### Method B: DevTools (Quick)

1. Open DevTools (F12) → Network tab
2. Select "Offline"
3. Send message → Fails
4. Select "Online"
5. Click Retry → Success

### Method C: Backend Simulation (Most Accurate)

Temporarily add to `api/sessions.ts` line 106:

```typescript
if (request.text.includes('test-error')) {
  throw new Error('Simulated error');
}
```

1. Send: `"test-error"` → Fails
2. Remove code
3. Retry → Success

## Test 3: Error Recovery

### 429 Rate Limit

1. Send 5+ messages quickly
2. Observe error banner

Expected:

```
⚠️ Too many requests
   Please wait 30 seconds before trying again
```

### Network Error

1. Stop backend (`Ctrl+C`)
2. Send message

Expected:

```
⚠️ Failed to send message
```

## Integration Test

Complete flow:

```
1. Create session
2. Rename → "Integration Test"
3. Send → "Hello" (success)
4. Disconnect network
5. Send → "Test" (fails)
6. Reconnect network
7. Retry → Success
8. Verify timestamp UNCHANGED (keeps original)
9. Archive session
```

## Checklist

### Session Rename

- [ ] Normal rename works
- [ ] Empty name rejected
- [ ] Long name (100+ chars) rejected
- [ ] Special characters work
- [ ] Enter saves
- [ ] Escape cancels
- [ ] Persists after refresh

### Message Retry

- [ ] Network failure shows failed state
- [ ] Red border on failed message
- [ ] Retry button appears
- [ ] Retry resends message
- [ ] **Timestamp KEEPS original time**
- [ ] Success updates status
- [ ] Multiple retries work

### Error Recovery

- [ ] 429 shows wait message
- [ ] 500 shows generic error
- [ ] Network error shows message
- [ ] Error banner dismissible

## Known Issues

None currently.

## Tips

- Use DevTools Network tab for quick testing
- Check browser console for errors
- Verify timestamps in message list
- Test with different session states (active, suspended, archived)
