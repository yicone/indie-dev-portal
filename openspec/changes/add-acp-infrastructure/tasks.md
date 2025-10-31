# Implementation Tasks

## 1. Dependencies and Environment Setup

- [ ] 1.1 Install ACP SDK and utilities
  - [ ] Run `pnpm add @agentclientprotocol/sdk uuid`
  - [ ] Run `pnpm add -D @types/uuid`
  - [ ] Verify installation in `package.json`
- [ ] 1.2 Configure environment variables
  - [ ] Add `GEMINI_CLI_PATH` to `.env` (default: 'gemini')
  - [ ] Add `AGENT_WORKSPACE_ROOT` to `.env` (e.g., `/Users/username/Workspace`)
  - [ ] Add `AGENT_SESSION_IDLE_TIMEOUT` to `.env` (default: 30 minutes)
  - [ ] Add `AGENT_MAX_CONCURRENT_SESSIONS` to `.env` (default: 5)
  - [ ] Document new variables in `.env.example`
- [ ] 1.3 Verify Gemini CLI installation
  - [ ] Run `gemini --version` to confirm installation
  - [ ] Test `gemini --experimental-acp` flag availability
  - [ ] Confirm authentication is complete (no browser login prompt)

## 2. Database Schema

- [ ] 2.1 Define Prisma models
  - [ ] Add `AgentSession` model to `prisma/schema.prisma`
    - [ ] Fields: id, repoId, status, createdAt, updatedAt
    - [ ] Relation to `Repo` model
    - [ ] Relation to `AgentMessage[]` model
  - [ ] Add `AgentMessage` model to `prisma/schema.prisma`
    - [ ] Fields: id, sessionId, role, content, timestamp
    - [ ] Relation to `AgentSession` model
  - [ ] Add indexes: sessionId, repoId, status, timestamp
- [ ] 2.2 Generate and run migration
  - [ ] Run `pnpm db:generate` to generate Prisma client
  - [ ] Run `pnpm db:migrate` to create tables
  - [ ] Verify tables exist in SQLite database
  - [ ] Test rollback: `pnpm db:migrate:rollback`

## 3. TypeScript Types

- [ ] 3.1 Create ACP protocol types (`types/acp.ts`)
  - [ ] Define `ACPMessage` interface
  - [ ] Define `ACPSessionNew` interface
  - [ ] Define `ACPSessionPrompt` interface
  - [ ] Define `ACPSessionUpdate` interface
  - [ ] Define `ACPSessionCancel` interface
  - [ ] Export all ACP-related types
- [ ] 3.2 Create agent types (`types/agent.ts`)
  - [ ] Define `SessionStatus` enum ('active', 'completed', 'cancelled', 'error')
  - [ ] Define `MessageRole` enum ('user', 'agent', 'system')
  - [ ] Define `AgentSessionData` interface
  - [ ] Define `AgentMessageData` interface
  - [ ] Define `MessageContent` union types (text, plan, tool)
  - [ ] Export all agent-related types

## 4. ACP Service Layer

- [ ] 4.1 Create ACP service (`api/services/acpService.ts`)
  - [ ] Import `@agentclientprotocol/sdk`
  - [ ] Implement `createACPClient(processStreams)` function
  - [ ] Implement `sendSessionNew(client, workspace)` function
  - [ ] Implement `sendSessionPrompt(client, sessionId, text)` function
  - [ ] Implement `sendSessionCancel(client, sessionId)` function
  - [ ] Implement `handleSessionUpdate(client, callback)` listener
  - [ ] Add error handling for JSON-RPC parse errors
  - [ ] Add logging for all ACP messages (debug level)
- [ ] 4.2 Add unit tests for ACP service
  - [ ] Test message formatting
  - [ ] Test error handling
  - [ ] Mock stdio streams for testing

## 5. Gemini CLI Process Manager

- [ ] 5.1 Create process manager (`api/services/geminiCliManager.ts`)
  - [ ] Implement `spawnGeminiCli(repoPath)` function
    - [ ] Spawn with `--experimental-acp` flag
    - [ ] Spawn with `--workspace` flag pointing to repo
    - [ ] Set up stdio pipes: ['pipe', 'pipe', 'pipe']
    - [ ] Return process and streams
  - [ ] Implement process map: `Map<sessionId, ChildProcess>`
  - [ ] Implement `registerProcess(sessionId, process)` function
  - [ ] Implement `getProcess(sessionId)` function
  - [ ] Implement `terminateProcess(sessionId)` function
  - [ ] Implement `terminateAllProcesses()` function for shutdown
- [ ] 5.2 Add process lifecycle monitoring
  - [ ] Listen for process 'exit' events
  - [ ] Capture stderr output for error logging
  - [ ] Implement heartbeat check (every 30 seconds)
  - [ ] Handle process crashes gracefully
- [ ] 5.3 Add concurrent session limiting
  - [ ] Track active process count
  - [ ] Reject new sessions when limit reached (default 5)
  - [ ] Return 429 Too Many Requests with Retry-After header
- [ ] 5.4 Add unit tests for process manager
  - [ ] Test process spawning
  - [ ] Test process termination
  - [ ] Test concurrent limits
  - [ ] Mock child_process for testing

## 6. Session Service Layer

- [ ] 6.1 Create session service (`api/services/sessionService.ts`)
  - [ ] Implement `createSession(repoId)` function
    - [ ] Validate repository exists
    - [ ] Validate repository path within AGENT_WORKSPACE_ROOT
    - [ ] Spawn Gemini CLI process
    - [ ] Send ACP session/new
    - [ ] Store session in database
    - [ ] Return session object
  - [ ] Implement `listSessions(filters, pagination)` function
    - [ ] Support filters: repoId, status
    - [ ] Support pagination: limit, offset
    - [ ] Query database with Prisma
    - [ ] Return sessions without full message history
  - [ ] Implement `getSession(sessionId)` function
    - [ ] Query session with messages
    - [ ] Include repository information
    - [ ] Return 404 if not found
  - [ ] Implement `sendPrompt(sessionId, text)` function
    - [ ] Validate session is active
    - [ ] Send ACP session/prompt
    - [ ] Store user message in database
    - [ ] Return 202 Accepted
  - [ ] Implement `getMessages(sessionId, since?)` function
    - [ ] Query messages for session
    - [ ] Filter by timestamp if `since` provided
    - [ ] Return messages in chronological order
  - [ ] Implement `cancelSession(sessionId)` function
    - [ ] Send ACP session/cancel
    - [ ] Terminate process
    - [ ] Update session status to 'cancelled'
    - [ ] Return updated session
- [ ] 6.2 Add message storage handlers
  - [ ] Implement `storeUserMessage(sessionId, text)` function
  - [ ] Implement `storeAgentMessage(sessionId, content)` function
  - [ ] Implement `storeSystemMessage(sessionId, content)` function
  - [ ] Handle message content serialization (JSON)
- [ ] 6.3 Add session status update handlers
  - [ ] Implement `updateSessionStatus(sessionId, status)` function
  - [ ] Implement `markSessionError(sessionId, error)` function
  - [ ] Update `updatedAt` timestamp on all updates
- [ ] 6.4 Add unit tests for session service
  - [ ] Test session creation flow
  - [ ] Test validation logic
  - [ ] Test message storage
  - [ ] Test status updates
  - [ ] Mock database and ACP service

## 7. API Routes

- [ ] 7.1 Create session routes (`api/sessions.ts`)
  - [ ] Implement `POST /api/sessions` endpoint
    - [ ] Validate request body: `{ repoId: string }`
    - [ ] Call `sessionService.createSession()`
    - [ ] Return 201 Created with session object
    - [ ] Handle errors: 400, 404, 429, 500
  - [ ] Implement `GET /api/sessions` endpoint
    - [ ] Parse query params: repoId, status, limit, offset
    - [ ] Call `sessionService.listSessions()`
    - [ ] Return 200 OK with paginated list
    - [ ] Handle errors: 400, 500
  - [ ] Implement `GET /api/sessions/:id` endpoint
    - [ ] Call `sessionService.getSession(id)`
    - [ ] Return 200 OK with full session
    - [ ] Handle errors: 404, 500
  - [ ] Implement `POST /api/sessions/:id/prompt` endpoint
    - [ ] Validate request body: `{ text: string }`
    - [ ] Call `sessionService.sendPrompt(id, text)`
    - [ ] Return 202 Accepted
    - [ ] Handle errors: 400, 404, 409, 500
  - [ ] Implement `GET /api/sessions/:id/messages` endpoint
    - [ ] Parse query param: since (optional timestamp)
    - [ ] Call `sessionService.getMessages(id, since)`
    - [ ] Return 200 OK with message array
    - [ ] Handle errors: 404, 500
  - [ ] Implement `DELETE /api/sessions/:id` endpoint
    - [ ] Call `sessionService.cancelSession(id)`
    - [ ] Return 200 OK with updated session
    - [ ] Handle errors: 404, 500
- [ ] 7.2 Register routes in Express app (`api/server.ts`)
  - [ ] Import session routes
  - [ ] Mount at `/api/sessions`
  - [ ] Add error handling middleware
- [ ] 7.3 Add integration tests for API routes
  - [ ] Test all endpoints with valid inputs
  - [ ] Test error cases
  - [ ] Test concurrent requests
  - [ ] Use supertest for HTTP testing

## 8. Idle Session Cleanup

- [ ] 8.1 Implement idle detection
  - [ ] Create background job that runs every 5 minutes
  - [ ] Query sessions with `updatedAt` older than timeout
  - [ ] Filter for status='active'
  - [ ] Call `sessionService.cancelSession()` for each
  - [ ] Log cleanup actions
- [ ] 8.2 Add idle timer reset logic
  - [ ] Update `updatedAt` on every prompt
  - [ ] Update `updatedAt` on every agent message
  - [ ] Ensure database updates are atomic
- [ ] 8.3 Add configuration
  - [ ] Read `AGENT_SESSION_IDLE_TIMEOUT` from env
  - [ ] Default to 30 minutes if not set
  - [ ] Log configured timeout on startup

## 9. Server Lifecycle Integration

- [ ] 9.1 Add startup initialization
  - [ ] Verify Gemini CLI is available on startup
  - [ ] Log Gemini CLI version
  - [ ] Initialize process manager
  - [ ] Start idle session cleanup job
- [ ] 9.2 Add graceful shutdown
  - [ ] Listen for SIGTERM and SIGINT signals
  - [ ] Cancel all active sessions
  - [ ] Terminate all Gemini CLI processes
  - [ ] Wait up to 10 seconds for graceful termination
  - [ ] Force-kill remaining processes
  - [ ] Close database connections
  - [ ] Log shutdown completion

## 10. Error Handling and Logging

- [ ] 10.1 Add comprehensive error handling
  - [ ] Wrap all async operations in try-catch
  - [ ] Return appropriate HTTP status codes
  - [ ] Include error messages in responses
  - [ ] Log all errors with stack traces
- [ ] 10.2 Add structured logging
  - [ ] Log all ACP messages (debug level)
  - [ ] Log session lifecycle events (info level)
  - [ ] Log errors and warnings (error/warn level)
  - [ ] Include session ID and repo ID in log context
- [ ] 10.3 Add security logging
  - [ ] Log path traversal attempts
  - [ ] Log unauthorized repository access attempts
  - [ ] Log rate limit violations
  - [ ] Include timestamp and source IP

## 11. Documentation

- [ ] 11.1 Update API documentation
  - [ ] Document all new endpoints in README or API docs
  - [ ] Include request/response examples
  - [ ] Document error codes and meanings
- [ ] 11.2 Update environment variable documentation
  - [ ] Document all new env vars in `.env.example`
  - [ ] Explain purpose and default values
  - [ ] Provide example configurations
- [ ] 11.3 Add code comments
  - [ ] Add JSDoc comments to all public functions
  - [ ] Explain complex logic with inline comments
  - [ ] Document ACP protocol interactions

## 12. Testing and Validation

- [ ] 12.1 Run unit tests
  - [ ] All service layer tests pass
  - [ ] All utility function tests pass
  - [ ] Achieve >80% code coverage
- [ ] 12.2 Run integration tests
  - [ ] All API endpoint tests pass
  - [ ] Database operations work correctly
  - [ ] Process lifecycle tests pass
- [ ] 12.3 Manual testing
  - [ ] Create session for real repository
  - [ ] Send prompts and verify responses in database
  - [ ] Test concurrent sessions
  - [ ] Test session cancellation
  - [ ] Test idle timeout
  - [ ] Test graceful shutdown
  - [ ] Verify Gemini CLI processes are cleaned up
- [ ] 12.4 Run linter and formatter
  - [ ] `pnpm lint` passes with no errors
  - [ ] `pnpm format:write` formats all new files
- [ ] 12.5 Validate OpenSpec compliance
  - [ ] Run `openspec validate add-acp-infrastructure --strict`
  - [ ] Ensure all requirements are met
  - [ ] Verify all scenarios are testable

## 13. Final Validation

- [ ] 13.1 Verify database schema
  - [ ] Tables created correctly
  - [ ] Foreign keys work
  - [ ] Indexes improve query performance
- [ ] 13.2 Verify API functionality
  - [ ] All endpoints return correct responses
  - [ ] Error handling works as expected
  - [ ] Rate limiting works
- [ ] 13.3 Verify process management
  - [ ] Processes spawn correctly
  - [ ] Processes terminate cleanly
  - [ ] No zombie processes left behind
- [ ] 13.4 Verify security
  - [ ] Path traversal prevention works
  - [ ] Repository access is restricted
  - [ ] Logs capture security events
- [ ] 13.5 Confirm no UI changes
  - [ ] This is backend-only implementation
  - [ ] No frontend components added
  - [ ] UI integration deferred to Phase 2
