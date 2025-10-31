# Agent Chat UI Design

## Context

This phase builds on Phase 1's ACP infrastructure to provide a real-time chat interface for interacting with AI coding agents. The design follows modern chat application patterns while integrating seamlessly with the existing Dev Portal dashboard.

**Key Stakeholders**:

- Developers using the portal for AI-assisted coding
- Future support for multiple concurrent conversations

**Constraints**:

- Must work with Phase 1's REST API and session management
- WebSocket is progressive enhancement (REST fallback possible)
- UI must not disrupt existing dashboard functionality
- Mobile-responsive design required

## Goals / Non-Goals

### Goals

- Real-time streaming of agent responses via WebSocket
- Intuitive chat interface matching modern messaging apps
- Slide-in panel design that preserves main dashboard view
- Session management UI for switching between conversations
- Repository context binding visible in UI
- Graceful handling of connection issues
- Keyboard-friendly interaction

### Non-Goals

- Task history and management panel (Phase 3)
- Permission approval UI (Phase 4)
- Code diff viewer integration (Future)
- Multi-agent selection (Future)
- Voice input/output (Future)

## Decisions

### 1. WebSocket vs Server-Sent Events (SSE)

**Decision**: Use WebSocket for bidirectional real-time communication

**Rationale**:

- Bidirectional: Client can send prompts and receive updates on same connection
- Lower latency: No HTTP overhead for each message
- Native browser support: No additional client libraries needed
- Better for interactive chat: Supports typing indicators, presence, etc.
- Industry standard: Used by Slack, Discord, ChatGPT, etc.

**Implementation**:

```typescript
// Backend: ws library on Express server
const wss = new WebSocketServer({ server: httpServer });

// Frontend: Native WebSocket API
const ws = new WebSocket('ws://localhost:4000');
```

**Alternatives Considered**:

- SSE: Unidirectional only, requires separate HTTP for sending messages
- Long polling: Higher latency, more server resources
- HTTP/2 Server Push: Complex setup, limited browser support

### 2. UI Layout: Slide-in Panel vs Modal vs Separate Page

**Decision**: Right-side slide-in panel (300-600px width, resizable)

**Rationale**:

- Preserves context: User can see project list while chatting
- Non-blocking: Doesn't cover entire screen
- Familiar pattern: Similar to Slack, VS Code chat panels
- Easy to toggle: Floating button for quick access
- Responsive: Collapses to full-screen on mobile

**Layout Structure**:

```
┌─────────────────────────────────────────────┐
│ Header (Search, Filters)                    │
├─────────────────────────────────┬───────────┤
│                                 │ [Session] │
│  Contribution Heatmap           │ Switcher  │
│                                 ├───────────┤
│  Project Grid                   │           │
│  (Main Content)                 │  Chat     │
│                                 │  Messages │
│                                 │           │
│                                 ├───────────┤
│                                 │ [Input]   │
│ [🤖 AI Assistant Button]        │           │
└─────────────────────────────────┴───────────┘
```

**Alternatives Considered**:

- Full-page modal: Loses project context, disruptive
- Separate `/chat` page: Requires navigation, breaks flow
- Bottom sheet: Limited space for conversation history

### 3. Message Streaming Strategy

**Decision**: Append-only streaming with partial message updates

**Rationale**:

- Agent responses arrive in chunks (ACP session/update notifications)
- Display partial text immediately for better UX
- Mark message as "streaming" until complete
- Append new chunks to existing message rather than creating new messages

**Data Flow**:

```
Agent → ACP Update → WebSocket → Frontend
                                    ↓
                            Append to last message
                                    ↓
                            Auto-scroll to bottom
```

**Message States**:

- `pending`: User sent, waiting for agent
- `streaming`: Agent responding, partial content
- `complete`: Agent finished, full content
- `error`: Agent failed, error message

**Alternatives Considered**:

- One message per chunk: Too many message bubbles, cluttered
- Buffer and batch: Delays display, poor perceived performance
- Replace entire message: Causes flickering, poor UX

### 4. Session Management UI

**Decision**: Dropdown session switcher in panel header + floating button badge

**Rationale**:

- Compact: Doesn't take vertical space from messages
- Accessible: Click to expand, shows recent sessions
- Context-aware: Displays current repository
- Badge indicator: Shows active session count on floating button

**Session Switcher Features**:

- List recent sessions (last 10)
- Show repository name and status
- Highlight active session
- "New Session" button
- Filter by repository (optional)

**Alternatives Considered**:

- Sidebar tabs: Takes too much horizontal space
- Separate sessions page: Requires navigation
- No switcher: Forces single session, limiting

### 5. Repository Context Binding

**Decision**: Auto-bind to selected project card, manual override available

**Rationale**:

- Intuitive: Clicking project card + opening chat implies context
- Flexible: User can change repository in session switcher
- Visual feedback: Show repository name in chat header
- Prevents confusion: Clear which codebase agent is working with

**Binding Flow**:

1. User clicks project card (sets `selectedRepoId` in state)
2. User opens chat panel via floating button
3. If no active session, prompt to create new session for selected repo
4. If active session exists, show it (regardless of repo)
5. User can switch repos via dropdown in chat header

**Alternatives Considered**:

- Always prompt for repo: Adds friction, repetitive
- Global context: Confusing when multiple repos open
- No binding: Agent might work on wrong codebase

### 6. Connection Status and Reconnection

**Decision**: Automatic reconnection with exponential backoff + visual indicator

**Rationale**:

- Network issues are common (laptop sleep, WiFi drops)
- User shouldn't lose conversation state
- Visual feedback prevents confusion
- Exponential backoff prevents server overload

**Reconnection Strategy**:

```typescript
const reconnect = () => {
  const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
  setTimeout(() => {
    attempts++;
    connect();
  }, delay);
};
```

**Status Indicator**:

- 🟢 Connected: Green dot, no message
- 🟡 Connecting: Yellow dot, "Connecting..."
- 🔴 Disconnected: Red dot, "Disconnected. Retrying..."
- ⚠️ Error: Red dot, "Connection failed. Retry?"

**Alternatives Considered**:

- No auto-reconnect: Poor UX, requires manual refresh
- Immediate reconnect: Can overwhelm server
- No status indicator: User doesn't know connection state

## Architecture

### WebSocket Message Protocol

**Client → Server**:

```typescript
{
  type: 'session.create',
  payload: { repoId: string }
}

{
  type: 'session.prompt',
  payload: { sessionId: string, text: string }
}

{
  type: 'session.cancel',
  payload: { sessionId: string }
}

{
  type: 'ping',
  payload: {}
}
```

**Server → Client**:

```typescript
{
  type: 'session.created',
  payload: { session: AgentSessionData }
}

{
  type: 'message.new',
  payload: { sessionId: string, message: AgentMessageData }
}

{
  type: 'message.update',
  payload: { sessionId: string, messageId: string, content: MessageContent, complete: boolean }
}

{
  type: 'session.status',
  payload: { sessionId: string, status: SessionStatus }
}

{
  type: 'error',
  payload: { code: string, message: string }
}

{
  type: 'pong',
  payload: {}
}
```

### Component Hierarchy

```
AgentFloatingButton (fixed bottom-right)
  └─ Badge (active session count)

AgentChatPanel (slide-in from right)
  ├─ PanelHeader
  │   ├─ SessionSwitcher (dropdown)
  │   ├─ RepositorySelector (dropdown)
  │   ├─ ConnectionStatus (indicator)
  │   └─ CloseButton
  ├─ MessageList (scrollable)
  │   └─ ChatMessage[] (role-based styling)
  │       ├─ Avatar (user/agent icon)
  │       ├─ MessageContent (text/plan/tool)
  │       ├─ Timestamp
  │       └─ StreamingIndicator (if streaming)
  ├─ TypingIndicator (when agent is thinking)
  └─ ChatInput
      ├─ TextArea (auto-resize)
      ├─ SendButton
      └─ CharacterCount (optional)
```

### State Management

**Global State** (React Context):

```typescript
interface AgentChatState {
  isOpen: boolean;
  activeSessionId: string | null;
  sessions: Map<string, AgentSessionData>;
  messages: Map<string, AgentMessageData[]>;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  selectedRepoId: string | null;
}
```

**WebSocket Hook**:

```typescript
const useAgentWebSocket = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  const connect = useCallback(() => {
    /* ... */
  }, []);
  const send = useCallback(
    (message: WSMessage) => {
      /* ... */
    },
    [ws]
  );
  const disconnect = useCallback(() => {
    /* ... */
  }, [ws]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  return { ws, status, send };
};
```

## Risks / Trade-offs

### Risk: WebSocket Connection Drops

**Impact**: User loses real-time updates, messages may be delayed

**Mitigation**:

- Automatic reconnection with exponential backoff
- Visual connection status indicator
- Fallback to REST API polling if WebSocket unavailable
- Store pending messages locally and resend on reconnect
- Show warning if disconnected for >30 seconds

### Risk: Message Ordering Issues

**Impact**: Messages arrive out of order, conversation appears jumbled

**Mitigation**:

- Include sequence number in WebSocket messages
- Buffer out-of-order messages and reorder client-side
- Use timestamp as secondary sort key
- Log ordering violations for debugging

### Risk: Large Message Payloads

**Impact**: Slow rendering, UI freezes, memory issues

**Mitigation**:

- Limit message content to 100KB per message
- Virtualize message list for long conversations (react-window)
- Lazy-load old messages (pagination)
- Compress large payloads (gzip over WebSocket)
- Warn user if message exceeds limit

### Risk: Mobile Responsiveness

**Impact**: Chat panel unusable on small screens

**Mitigation**:

- Full-screen panel on mobile (<768px)
- Slide-in animation from bottom on mobile
- Larger touch targets (min 44px)
- Hide session switcher on mobile (use separate page)
- Test on real devices (iPhone, Android)

### Trade-off: Real-time vs Simplicity

**Decision**: Implement WebSocket for real-time, keep REST as fallback

**Pros**:

- Better UX: Instant feedback, streaming responses
- Modern: Matches user expectations from ChatGPT, etc.
- Scalable: Handles multiple concurrent sessions efficiently

**Cons**:

- Complexity: More code, more failure modes
- Debugging: Harder to inspect WebSocket traffic
- Testing: Requires WebSocket mocking

**Justification**: Real-time is essential for good chat UX. The complexity is worth it for user satisfaction.

## Migration Plan

### Installation Steps

1. **Install Dependencies**:

   ```bash
   pnpm add ws
   pnpm add -D @types/ws
   ```

2. **Backend Setup**:
   - Initialize WebSocket server in `api/server.ts`
   - Add WebSocket handler for agent messages
   - Modify `sessionService` to emit WebSocket events

3. **Frontend Setup**:
   - Create `useAgentWebSocket` hook
   - Add `AgentChatPanel` component
   - Add `AgentFloatingButton` to dashboard
   - Integrate with existing project selection

4. **Testing**:
   - Test WebSocket connection and reconnection
   - Test message streaming and ordering
   - Test mobile responsiveness
   - Test with slow network (throttling)

### Rollback Plan

If issues arise:

1. Disable WebSocket server (comment out initialization)
2. Hide floating button (remove from dashboard)
3. Users fall back to REST API (Phase 1 still works)
4. No data loss (sessions persist in database)
5. Revert frontend components via Git

### Testing Strategy

**Unit Tests**:

- WebSocket hook connection logic
- Message parsing and ordering
- Component rendering and interactions

**Integration Tests**:

- End-to-end WebSocket communication
- Session creation and message flow
- Reconnection scenarios

**Manual Tests**:

- Open chat panel and send messages
- Test streaming responses
- Switch between sessions
- Test on mobile devices
- Simulate network disconnection
- Test with multiple browser tabs

## Open Questions

1. **Message Pagination**: How many messages to load initially?
   - Proposal: Load last 50 messages, lazy-load older on scroll

2. **Typing Indicator**: Show when agent is processing?
   - Proposal: Yes, show "Agent is thinking..." when prompt sent

3. **Notification Sound**: Play sound on new agent message?
   - Proposal: Optional, user preference, default off

4. **Markdown Rendering**: Support markdown in agent responses?
   - Proposal: Yes, use `react-markdown` for code blocks and formatting

5. **Code Syntax Highlighting**: Highlight code in messages?
   - Proposal: Yes, use `prism-react-renderer` for syntax highlighting

6. **Message Editing**: Allow user to edit sent messages?
   - Proposal: No in Phase 2, consider for Phase 3

7. **Message Reactions**: Allow emoji reactions to messages?
   - Proposal: No in Phase 2, consider for future
