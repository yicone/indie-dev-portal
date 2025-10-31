# ACP Infrastructure Design

## Context

This change introduces the Agent Client Protocol (ACP) infrastructure to enable AI-assisted coding in the Dev Portal. ACP is a standard protocol developed by Zed and Google that allows any client to communicate with AI coding agents through a unified JSON-RPC interface over stdio.

**Key Stakeholders**:

- Developers using the Dev Portal for local repository management
- Future integration of multiple AI coding agents (Gemini CLI as first implementation)

**Constraints**:

- Gemini CLI is pre-installed and authenticated on the user's system
- File system access must be restricted to scanned Git repositories
- Sessions must persist across application restarts (SQLite)
- Backend-only implementation (no UI in this phase)

## Goals / Non-Goals

### Goals

- Establish robust ACP client infrastructure using official SDK
- Manage Gemini CLI as a subprocess with stdio communication
- Implement session lifecycle with database persistence
- Bind agent context to specific Git repositories
- Provide REST API for session management (create, list, retrieve)
- Handle agent process lifecycle (spawn, monitor, terminate)

### Non-Goals

- WebSocket real-time communication (Phase 2)
- Frontend UI components (Phase 2)
- Task management and history panel (Phase 3)
- Permission control and approval flows (Phase 4)
- Multi-agent support (Future)
- Gemini CLI installation/configuration wizard (User responsibility)

## Decisions

### 1. ACP SDK vs Custom Implementation

**Decision**: Use `@agentclientprotocol/sdk` official TypeScript SDK

**Rationale**:

- Official implementation ensures protocol compliance
- Handles JSON-RPC message formatting and parsing
- Provides TypeScript types for all ACP methods
- Maintained by Zed team alongside protocol evolution
- Reduces implementation complexity and bugs

**Alternatives Considered**:

- Custom JSON-RPC implementation: Higher maintenance burden, protocol drift risk
- Direct stdio communication: Too low-level, error-prone

### 2. Process Management Strategy

**Decision**: Spawn Gemini CLI as child process per session with `--experimental-acp` flag

**Rationale**:

- Each session gets isolated agent instance
- Process lifecycle tied to session lifecycle
- Stdio provides reliable bidirectional communication
- Gemini CLI's ACP mode is designed for this pattern

**Implementation**:

```typescript
// Spawn with ACP mode and repository context
const geminiProcess = spawn('gemini', ['--experimental-acp', '--workspace', repoPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
});
```

**Alternatives Considered**:

- Single shared agent process: Session isolation issues, state management complexity
- HTTP-based communication: Requires additional server setup, not ACP standard

### 3. Session Persistence Schema

**Decision**: Store sessions and messages in SQLite with following schema:

```prisma
model AgentSession {
  id          String   @id @default(uuid())
  repoId      String
  repo        Repo     @relation(fields: [repoId], references: [id])
  status      String   // 'active', 'completed', 'cancelled', 'error'
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  messages    AgentMessage[]
}

model AgentMessage {
  id          String   @id @default(uuid())
  sessionId   String
  session     AgentSession @relation(fields: [sessionId], references: [id])
  role        String   // 'user', 'agent', 'system'
  content     String   // JSON-serialized message content
  timestamp   DateTime @default(now())
}
```

**Rationale**:

- Enables session history across restarts
- Supports future UI for browsing past conversations
- Repo relationship ensures context binding
- Message log enables conversation replay and debugging

**Alternatives Considered**:

- In-memory only: Loses history on restart, no persistence
- Separate message database: Unnecessary complexity for current scale

### 4. Repository Context Binding

**Decision**: Pass repository root path to Gemini CLI via `--workspace` flag and validate all file operations

**Rationale**:

- Gemini CLI respects workspace boundaries
- Prevents accidental access to system files
- Aligns with Git repository as natural context boundary
- Simple to implement and verify

**Security Measures**:

- Validate repo path exists in scanned repositories
- Reject sessions for non-existent or unauthorized paths
- Log all file system operations for audit

**Alternatives Considered**:

- Sandbox mode: Not needed as agents have built-in sandboxing
- Operation whitelist: Too restrictive for initial implementation

### 5. API Design

**Decision**: RESTful API with following endpoints:

```
POST   /api/sessions          - Create new session
GET    /api/sessions          - List all sessions
GET    /api/sessions/:id      - Get session details
POST   /api/sessions/:id/prompt - Send user message (returns immediately)
GET    /api/sessions/:id/messages - Get conversation history
DELETE /api/sessions/:id      - Cancel/terminate session
```

**Rationale**:

- Standard REST patterns for CRUD operations
- Synchronous for session management
- Prompt endpoint returns quickly (streaming in Phase 2)
- Consistent with existing API structure

**Alternatives Considered**:

- GraphQL: Overkill for current requirements
- WebSocket-only: Need REST for session management anyway

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────┐
│                 Express API                      │
│  ┌──────────────────────────────────────────┐  │
│  │   Session Routes (/api/sessions)         │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                                │
│  ┌──────────────▼───────────────────────────┐  │
│  │   SessionService                         │  │
│  │   - createSession()                      │  │
│  │   - listSessions()                       │  │
│  │   - getSession()                         │  │
│  │   - sendPrompt()                         │  │
│  │   - cancelSession()                      │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                                │
│  ┌──────────────▼───────────────────────────┐  │
│  │   GeminiCliManager                       │  │
│  │   - spawn(repoPath)                      │  │
│  │   - send(sessionId, message)             │  │
│  │   - terminate(sessionId)                 │  │
│  │   - processMap: Map<sessionId, Process>  │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                                │
│  ┌──────────────▼───────────────────────────┐  │
│  │   ACPService                             │  │
│  │   - createSession(workspace)             │  │
│  │   - sendPrompt(sessionId, text)          │  │
│  │   - handleUpdate(callback)               │  │
│  │   Uses: @agentclientprotocol/sdk         │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                                │
└─────────────────┼────────────────────────────────┘
                  │ stdio (JSON-RPC)
┌─────────────────▼────────────────────────────────┐
│          Gemini CLI Process                      │
│          (--experimental-acp)                    │
│          (--workspace /path/to/repo)             │
└──────────────────────────────────────────────────┘
```

### Data Flow

**Session Creation**:

1. Client → `POST /api/sessions` with `{ repoId }`
2. SessionService validates repo exists
3. GeminiCliManager spawns Gemini CLI process
4. ACPService sends `session/new` via stdio
5. Store session in database with status='active'
6. Return session ID to client

**Sending Prompt**:

1. Client → `POST /api/sessions/:id/prompt` with `{ text }`
2. SessionService retrieves session
3. ACPService sends `session/prompt` to agent
4. Store user message in database
5. Return 202 Accepted (agent processing async)
6. Agent responses handled via stdio listener (stored in DB)

**Message Retrieval**:

1. Client → `GET /api/sessions/:id/messages`
2. SessionService queries database
3. Return chronological message list

## Risks / Trade-offs

### Risk: Gemini CLI Process Crashes

**Impact**: Session becomes unresponsive, user loses context

**Mitigation**:

- Monitor process exit events
- Update session status to 'error' on crash
- Log stderr output for debugging
- Implement process restart with session recovery (future)

### Risk: Stdio Buffer Overflow

**Impact**: Large agent responses may cause backpressure

**Mitigation**:

- Use streaming JSON parser for large messages
- Implement backpressure handling in stdio pipes
- Set reasonable message size limits (10MB)

### Risk: Concurrent Session Limits

**Impact**: Too many Gemini CLI processes consume resources

**Mitigation**:

- Limit concurrent active sessions (e.g., 5 per user)
- Implement session queuing for excess requests
- Auto-terminate idle sessions after timeout (30 min)

### Trade-off: Synchronous Prompt API

**Decision**: Phase 1 uses synchronous HTTP for prompts, streaming in Phase 2

**Pros**:

- Simpler implementation
- Standard REST patterns
- Easier testing

**Cons**:

- No real-time progress updates
- Client must poll for responses
- Poor UX for long-running operations

**Justification**: Acceptable for Phase 1 backend-only implementation. Phase 2 WebSocket will provide real-time streaming.

## Migration Plan

### Installation Steps

1. **Install Dependencies**:

   ```bash
   pnpm add @agentclientprotocol/sdk uuid
   pnpm add -D @types/uuid
   ```

2. **Database Migration**:

   ```bash
   # Add new models to prisma/schema.prisma
   pnpm db:generate
   pnpm db:migrate
   ```

3. **Environment Configuration**:

   ```bash
   # Add to .env
   GEMINI_CLI_PATH=/usr/local/bin/gemini  # or 'gemini' if in PATH
   AGENT_WORKSPACE_ROOT=/Users/username/Workspace  # Root for repo scanning
   ```

4. **Verify Gemini CLI**:
   ```bash
   gemini --version
   # Should output: Gemini CLI version x.x.x
   ```

### Rollback Plan

If issues arise:

1. Stop Express server
2. Terminate all Gemini CLI processes: `pkill -f "gemini --experimental-acp"`
3. Revert database migration: `pnpm db:migrate:rollback`
4. Remove dependencies: `pnpm remove @agentclientprotocol/sdk uuid`
5. Restore previous code version

### Testing Strategy

**Unit Tests**:

- ACPService message formatting
- SessionService CRUD operations
- GeminiCliManager process lifecycle

**Integration Tests**:

- End-to-end session creation and prompt flow
- Database persistence verification
- Process cleanup on session termination

**Manual Tests**:

- Create session for real repository
- Send prompts and verify responses in database
- Test concurrent sessions
- Verify process termination on server shutdown

## Open Questions

1. **Session Timeout**: What's the appropriate idle timeout before auto-terminating sessions?
   - Proposal: 30 minutes idle, configurable via env var

2. **Error Recovery**: Should we auto-retry failed agent communications?
   - Proposal: No auto-retry in Phase 1, manual retry via UI in Phase 2

3. **Logging Level**: How verbose should agent communication logs be?
   - Proposal: Log all ACP messages in development, errors only in production

4. **Concurrent Limit**: How many simultaneous sessions per user?
   - Proposal: 5 active sessions, queue additional requests

5. **Message Retention**: How long to keep old session messages?
   - Proposal: Keep indefinitely in Phase 1, add cleanup policy in Phase 3
