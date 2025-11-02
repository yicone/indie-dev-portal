# Message Streaming Protocol Specification

## Overview

This document defines the WebSocket streaming protocol for agent messages. The protocol ensures that messages are properly merged and remain consistent across page refreshes.

## Problem Statement

**Current Issue**: Agent messages are split into multiple database records during streaming, causing inconsistent display:

- **Real-time**: Messages are merged by frontend (time-window based)
- **After refresh**: Messages are loaded as separate bubbles

**Root Cause**: Backend stores each message fragment independently, frontend merging is temporary.

## Solution

Implement a proper streaming protocol with three distinct phases:

1. **Start**: Signal the beginning of a message
2. **Chunk**: Stream content incrementally
3. **End**: Complete the message with full content

## Protocol Specification

### Message Types

#### 1. `message.start`

Signals the beginning of a new message stream.

```typescript
{
  type: 'message.start',
  payload: {
    sessionId: string,      // Session ID
    messageId: string,      // Unique message ID (same for entire stream)
    role: 'agent',          // Always 'agent' for streaming
    timestamp: string       // ISO 8601 timestamp
  }
}
```

**Backend Behavior**:

- Generate a unique `messageId`
- Create streaming state in memory (do NOT save to database yet)
- Initialize content accumulator

**Frontend Behavior**:

- Create a placeholder message with `messageId`
- Show loading indicator (optional)
- Prepare to receive chunks

---

#### 2. `message.chunk`

Delivers incremental content for an ongoing message.

```typescript
{
  type: 'message.chunk',
  payload: {
    messageId: string,      // Same ID from message.start
    content: {
      type: 'text',
      text: string          // Incremental text (e.g., "Hello")
    }
  }
}
```

**Backend Behavior**:

- Append chunk to content accumulator
- Send chunk to client immediately
- Do NOT save to database yet

**Frontend Behavior**:

- Find message by `messageId`
- Append `content.text` to existing message content
- Update UI immediately (streaming effect)

**Multiple Chunks Example**:

```typescript
// Chunk 1
{ messageId: 'msg-001', content: { type: 'text', text: 'Hello' } }

// Chunk 2
{ messageId: 'msg-001', content: { type: 'text', text: ' World' } }

// Chunk 3
{ messageId: 'msg-001', content: { type: 'text', text: '!' } }

// Frontend displays: "Hello World!"
```

---

#### 3. `message.end`

Completes the message with full content and triggers database storage.

```typescript
{
  type: 'message.end',
  payload: {
    messageId: string,      // Same ID from message.start
    content: {
      type: 'text',
      text: string          // Complete text (e.g., "Hello World!")
    },
    isComplete: true,       // Always true
    timestamp: string       // ISO 8601 timestamp (completion time)
  }
}
```

**Backend Behavior**:

- Validate accumulated content matches `content`
- **Save complete message to database** (single record)
- Clean up streaming state
- Send `message.end` to client

**Frontend Behavior**:

- Find message by `messageId`
- Replace content with complete `content` (ensure consistency)
- Mark message as complete
- Remove loading indicator

---

### State Machine

```
┌─────────────┐
│   IDLE      │
└──────┬──────┘
       │
       │ message.start
       ▼
┌─────────────┐
│  STREAMING  │◄─┐
└──────┬──────┘  │
       │         │ message.chunk (0..N times)
       │         │
       │         └─────────────┘
       │
       │ message.end
       ▼
┌─────────────┐
│  COMPLETE   │
└─────────────┘
```

**States**:

- **IDLE**: No active streaming
- **STREAMING**: Receiving chunks
- **COMPLETE**: Message finalized and saved

**Transitions**:

- `IDLE → STREAMING`: Receive `message.start`
- `STREAMING → STREAMING`: Receive `message.chunk`
- `STREAMING → COMPLETE`: Receive `message.end`

**Error Handling**:

- If `message.chunk` arrives without `message.start`: Log error, ignore chunk
- If `message.end` arrives without `message.start`: Log error, ignore
- If timeout (e.g., 60s) without `message.end`: Mark as failed, clean up state

---

## Database Storage

### Before (Old Protocol)

```sql
-- Multiple records for one logical message
INSERT INTO messages (id, session_id, role, text, timestamp) VALUES
  ('msg-001', 'sess-1', 'agent', 'Hello', '2025-11-02 06:00:00'),
  ('msg-002', 'sess-1', 'agent', 'World', '2025-11-02 06:00:01'),
  ('msg-003', 'sess-1', 'agent', '!', '2025-11-02 06:00:02');
```

**Problem**: 3 records, 3 bubbles after refresh.

### After (New Protocol)

```sql
-- Single record for complete message
INSERT INTO messages (id, session_id, role, text, timestamp) VALUES
  ('msg-001', 'sess-1', 'agent', 'Hello World!', '2025-11-02 06:00:02');
```

**Solution**: 1 record, 1 bubble always.

---

## Implementation Guidelines

### Backend

1. **Streaming State Manager**:

   ```typescript
   interface StreamingState {
     messageId: string;
     sessionId: string;
     role: 'agent';
     contentAccumulator: string;
     startedAt: Date;
   }

   const activeStreams = new Map<string, StreamingState>();
   ```

2. **Message Flow**:

   ```typescript
   // On ACP stream start
   const messageId = generateId();
   activeStreams.set(messageId, {
     messageId,
     sessionId,
     role: 'agent',
     contentAccumulator: '',
     startedAt: new Date()
   });

   ws.send({ type: 'message.start', payload: { ... } });

   // On each ACP chunk
   const state = activeStreams.get(messageId);
   state.contentAccumulator += chunk.text;
   ws.send({ type: 'message.chunk', payload: { messageId, content: chunk } });

   // On ACP stream end
   const state = activeStreams.get(messageId);
   const completeContent = state.contentAccumulator;

   // Save to database (ONLY HERE!)
   await db.messages.create({
     id: messageId,
     sessionId,
     role: 'agent',
     text: completeContent,
     timestamp: new Date()
   });

   ws.send({ type: 'message.end', payload: { messageId, content: { type: 'text', text: completeContent }, isComplete: true, timestamp: new Date().toISOString() } });

   activeStreams.delete(messageId);
   ```

### Frontend

1. **Message State**:

   ```typescript
   interface StreamingMessage {
     id: string;
     sessionId: string;
     role: 'agent';
     content: string; // Accumulated content
     isStreaming: boolean; // true during streaming
     isComplete: boolean; // true after message.end
     timestamp: Date;
   }
   ```

2. **Event Handlers**:

   ```typescript
   switch (message.type) {
     case 'message.start':
       // Create placeholder
       setMessages((prev) => [
         ...prev,
         {
           id: payload.messageId,
           sessionId: payload.sessionId,
           role: 'agent',
           content: '',
           isStreaming: true,
           isComplete: false,
           timestamp: new Date(payload.timestamp),
         },
       ]);
       break;

     case 'message.chunk':
       // Append chunk
       setMessages((prev) =>
         prev.map((msg) =>
           msg.id === payload.messageId
             ? { ...msg, content: msg.content + payload.content.text }
             : msg
         )
       );
       break;

     case 'message.end':
       // Finalize
       setMessages((prev) =>
         prev.map((msg) =>
           msg.id === payload.messageId
             ? {
                 ...msg,
                 content: payload.content.text,
                 isStreaming: false,
                 isComplete: true,
                 timestamp: new Date(payload.timestamp),
               }
             : msg
         )
       );
       break;
   }
   ```

---

## Error Handling

### Network Interruption

**Scenario**: Connection drops during streaming.

**Backend**:

- Timeout mechanism (60s)
- If no `message.end` sent within timeout:
  - Log warning
  - Clean up streaming state
  - Mark message as failed (optional)

**Frontend**:

- Detect disconnection
- Mark incomplete messages as "failed"
- Show retry button
- On reconnect: Request message status from backend

### Duplicate Messages

**Scenario**: Client receives same `message.chunk` twice (network retry).

**Solution**: Frontend should be idempotent:

- Track last received chunk index (optional)
- Or: Accept duplicates (text will just repeat, user can see)

### Out-of-Order Chunks

**Scenario**: Chunks arrive out of order.

**Solution**:

- Backend should send chunks in order (TCP guarantees this)
- If out-of-order detected: Log error, request resync

---

## Migration Strategy

### Phase 1: Implement New Protocol (Week 1-2)

1. Add new message types to `types/websocket.ts` ✅
2. Implement backend streaming state manager
3. Modify ACP integration to use new protocol
4. Implement frontend handlers
5. Test with new sessions

**Backward Compatibility**: Keep `message.new` for user messages.

### Phase 2: Remove Old Logic (Week 3)

1. Remove frontend time-window merging logic
2. Remove `message.update` (deprecated)
3. Update documentation

### Phase 3: Data Migration (Optional)

**Not needed**: Historical messages remain as-is. Only new messages use new protocol.

---

## Testing Checklist

- [ ] Basic streaming flow (start → chunks → end)
- [ ] Network interruption during streaming
- [ ] Multiple concurrent streams
- [ ] Large messages (1000+ chunks)
- [ ] Empty messages
- [ ] Refresh during streaming
- [ ] Refresh after streaming complete
- [ ] Error recovery

---

## Benefits

1. **Consistency**: Messages look the same before and after refresh
2. **Simplicity**: No frontend merging logic needed
3. **Clarity**: Protocol semantics are explicit
4. **Extensibility**: Easy to add progress indicators
5. **Performance**: Single database write per message
6. **Reliability**: Clear error handling

---

## References

- WebSocket Types: `types/websocket.ts`
- Backend Service: `api/services/sessionService.ts`
- Frontend Context: `lib/contexts/AgentChatContext.tsx`
- Spec: `openspec/changes/fix-message-streaming/`
