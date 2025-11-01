# Agent Testing Tools - Cheatsheet

Quick reference for common testing scenarios.

## 🎯 Most Common: Test Message Retry

```bash
# .env
AGENT_TEST_MODE=true
AGENT_TEST_ERROR=network
AGENT_TEST_CREATE_SESSION=false  # ✅ Sessions work
AGENT_TEST_SEND_PROMPT=true      # ❌ Messages fail
```

**Result**: Create sessions normally, messages fail → test retry button

---

## 📋 Quick Reference

### Test Session Creation Errors

```bash
AGENT_TEST_MODE=true
AGENT_TEST_ERROR=429
AGENT_TEST_CREATE_SESSION=true   # ❌ Sessions fail
AGENT_TEST_SEND_PROMPT=false     # ✅ Messages work
```

### Test Everything

```bash
AGENT_TEST_MODE=true
AGENT_TEST_ERROR=500
# Both endpoints affected
```

### Test with Delays

```bash
AGENT_TEST_MODE=true
AGENT_TEST_DELAY=2000  # 2 seconds
AGENT_TEST_ERROR=none
```

### Test Random Failures

```bash
AGENT_TEST_MODE=true
AGENT_TEST_SUCCESS_RATE=70  # 70% success, 30% fail
AGENT_TEST_ERROR=none
```

### Disable Testing

```bash
AGENT_TEST_MODE=false
# or remove all AGENT_TEST_* variables
```

---

## 🔧 Environment Variables

| Variable                    | Values                             | Default | Description                   |
| --------------------------- | ---------------------------------- | ------- | ----------------------------- |
| `AGENT_TEST_MODE`           | `true` / `false`                   | `false` | Enable test mode              |
| `AGENT_TEST_ERROR`          | `none` / `429` / `500` / `network` | `none`  | Error type to simulate        |
| `AGENT_TEST_DELAY`          | `0-10000` (ms)                     | `0`     | Response delay                |
| `AGENT_TEST_SUCCESS_RATE`   | `0-100` (%)                        | `100`   | Success percentage            |
| `AGENT_TEST_CREATE_SESSION` | `true` / `false` / unset           | unset   | Override for session creation |
| `AGENT_TEST_SEND_PROMPT`    | `true` / `false` / unset           | unset   | Override for sending prompts  |

---

## 💡 Tips

1. **Always restart backend** after changing `.env`
2. **Use fine-grained control** to avoid session suspension issues
3. **Check console logs** for simulator status on startup
4. **Test mode indicator**: Error messages include "(Test Mode)"

---

## 🐛 Troubleshooting

### Can't create sessions?

```bash
# Make sure session creation is not blocked
AGENT_TEST_CREATE_SESSION=false
```

### Simulator not working?

1. Check `AGENT_TEST_MODE=true`
2. Restart backend
3. Look for `[AgentSimulator]` logs

### Want to test both?

Test in sequence:

1. First test session creation (set `AGENT_TEST_CREATE_SESSION=true`)
2. Then test messages (set `AGENT_TEST_SEND_PROMPT=true`)

---

## 📚 Full Documentation

- **Quick Test Guide**: `docs/testing/agent-testing-tools-quick-test.md`
- **Full Usage Guide**: `docs/AGENT_TESTING_TOOLS_USAGE_GUIDE.md`
