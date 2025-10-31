# agent-session Specification

## Purpose

TBD - created by archiving change add-acp-infrastructure. Update Purpose after archive.

## Requirements

### Requirement: Session Persistence

The system SHALL persist agent sessions and conversation history in SQLite database for retrieval across application restarts.

#### Scenario: Store new session

- **WHEN** an agent session is successfully created
- **THEN** the system inserts a record into the `AgentSession` table
- **AND** includes fields: id (UUID), repoId, status='active', createdAt, updatedAt
- **AND** establishes a foreign key relationship to the `Repo` table
- **AND** returns the generated session ID

#### Scenario: Store conversation messages

- **WHEN** a message is exchanged between user and agent
- **THEN** the system inserts a record into the `AgentMessage` table
- **AND** includes fields: id (UUID), sessionId, role, content (JSON), timestamp
- **AND** role is one of: 'user', 'agent', 'system'
- **AND** content stores the message payload as serialized JSON

#### Scenario: Retrieve session with messages

- **WHEN** a client requests session details by ID
- **THEN** the system queries the `AgentSession` table
- **AND** joins with `AgentMessage` table ordered by timestamp ascending
- **AND** includes the associated repository information
- **AND** returns the complete session object with message history

### Requirement: Session Status Management

The system SHALL track and update session status throughout the lifecycle.

#### Scenario: Active session

- **WHEN** a session is created and the agent process is running
- **THEN** the session status is 'active'
- **AND** the session accepts new prompt requests
- **AND** the `updatedAt` timestamp reflects the last activity

#### Scenario: Completed session

- **WHEN** a session is gracefully terminated by user request
- **THEN** the session status is updated to 'completed'
- **AND** the session no longer accepts new prompts
- **AND** the final `updatedAt` timestamp is recorded

#### Scenario: Cancelled session

- **WHEN** a session is cancelled via the cancel endpoint
- **THEN** the session status is updated to 'cancelled'
- **AND** a system message is stored indicating cancellation reason
- **AND** the session is removed from active process map

#### Scenario: Error session

- **WHEN** an agent process crashes or encounters a fatal error
- **THEN** the session status is updated to 'error'
- **AND** the error details are stored as a system message
- **AND** the session is marked as non-recoverable

### Requirement: Session Listing and Filtering

The system SHALL provide API endpoints to list and filter sessions.

#### Scenario: List all sessions

- **WHEN** a client requests the sessions list without filters
- **THEN** the system returns all sessions ordered by `createdAt` descending
- **AND** includes basic session metadata (id, repoId, status, timestamps)
- **AND** does not include full message history (for performance)
- **AND** supports pagination with default limit of 20

#### Scenario: Filter sessions by repository

- **WHEN** a client requests sessions filtered by `repoId`
- **THEN** the system returns only sessions associated with that repository
- **AND** maintains the same ordering and pagination rules

#### Scenario: Filter sessions by status

- **WHEN** a client requests sessions filtered by status (e.g., 'active')
- **THEN** the system returns only sessions matching that status
- **AND** supports multiple status values as comma-separated list

### Requirement: Repository Context Binding

The system SHALL enforce that each session is bound to exactly one Git repository and restrict agent file access accordingly.

#### Scenario: Validate repository on session creation

- **WHEN** creating a session with a repository ID
- **THEN** the system verifies the repository exists in the `Repo` table
- **AND** verifies the repository path is within `AGENT_WORKSPACE_ROOT`
- **AND** rejects the request if validation fails with appropriate error

#### Scenario: Pass workspace to agent

- **WHEN** spawning the Gemini CLI process for a session
- **THEN** the system passes `--workspace /absolute/path/to/repo` flag
- **AND** the agent's file system operations are scoped to that directory
- **AND** the repository path is logged for audit purposes

#### Scenario: Prevent path traversal

- **WHEN** a repository path contains `..` or other traversal patterns
- **THEN** the system normalizes the path and validates it stays within allowed boundaries
- **AND** rejects any path that escapes `AGENT_WORKSPACE_ROOT`
- **AND** logs the security violation attempt

### Requirement: Message Content Serialization

The system SHALL serialize complex message content as JSON for storage and retrieval.

#### Scenario: Store user text prompt

- **WHEN** storing a user's text prompt
- **THEN** the content field contains: `{ "type": "text", "text": "user's prompt" }`
- **AND** the role is 'user'

#### Scenario: Store agent text response

- **WHEN** storing an agent's text response chunk
- **THEN** the content field contains: `{ "type": "text", "text": "agent's response", "partial": true/false }`
- **AND** the role is 'agent'
- **AND** partial=true indicates more chunks are expected

#### Scenario: Store agent plan

- **WHEN** storing an agent's execution plan
- **THEN** the content field contains: `{ "type": "plan", "steps": [...] }`
- **AND** the role is 'system'
- **AND** steps is an array of plan step objects

#### Scenario: Store tool execution

- **WHEN** storing an agent's tool call
- **THEN** the content field contains: `{ "type": "tool", "tool": "name", "args": {...}, "result": {...} }`
- **AND** the role is 'system'
- **AND** includes tool name, arguments, and execution result

### Requirement: Session API Endpoints

The system SHALL expose REST API endpoints for session management.

#### Scenario: Create session endpoint

- **WHEN** client sends `POST /api/sessions` with `{ "repoId": "uuid" }`
- **THEN** the system creates a new session
- **AND** returns 201 Created with session object
- **AND** response includes: `{ "id": "uuid", "repoId": "uuid", "status": "active", "createdAt": "ISO8601" }`

#### Scenario: List sessions endpoint

- **WHEN** client sends `GET /api/sessions?repoId=uuid&status=active&limit=10&offset=0`
- **THEN** the system returns 200 OK with filtered session list
- **AND** response includes: `{ "sessions": [...], "total": number, "limit": number, "offset": number }`

#### Scenario: Get session details endpoint

- **WHEN** client sends `GET /api/sessions/:id`
- **THEN** the system returns 200 OK with full session object
- **AND** includes all messages in chronological order
- **AND** returns 404 if session not found

#### Scenario: Send prompt endpoint

- **WHEN** client sends `POST /api/sessions/:id/prompt` with `{ "text": "user prompt" }`
- **THEN** the system validates session is active
- **AND** sends prompt to agent via ACP
- **AND** stores user message in database
- **AND** returns 202 Accepted immediately (async processing)

#### Scenario: Get messages endpoint

- **WHEN** client sends `GET /api/sessions/:id/messages?since=timestamp`
- **THEN** the system returns messages for the session
- **AND** optionally filters messages after the `since` timestamp
- **AND** returns 200 OK with message array

#### Scenario: Cancel session endpoint

- **WHEN** client sends `DELETE /api/sessions/:id`
- **THEN** the system sends cancel request to agent
- **AND** terminates the agent process
- **AND** updates session status to 'cancelled'
- **AND** returns 200 OK with updated session object

### Requirement: Concurrent Session Limits

The system SHALL enforce limits on concurrent active sessions to prevent resource exhaustion.

#### Scenario: Enforce global session limit

- **WHEN** the number of active sessions reaches the configured limit (default 5)
- **THEN** new session creation requests return 429 Too Many Requests
- **AND** response includes `Retry-After: 60` header
- **AND** response body explains the limit and suggests waiting

#### Scenario: Allow session creation after cleanup

- **WHEN** an active session is terminated (completed, cancelled, or error)
- **THEN** the active session count decreases
- **AND** new session creation requests are accepted again
- **AND** the system logs the session count change

### Requirement: Idle Session Cleanup

The system SHALL automatically terminate sessions that have been idle beyond a configured timeout.

#### Scenario: Detect idle session

- **WHEN** a session has no activity (no prompts or agent updates) for 30 minutes
- **THEN** the system marks the session as idle
- **AND** sends a `session/cancel` request to the agent
- **AND** updates the session status to 'completed' with metadata: `{ "reason": "idle_timeout" }`

#### Scenario: Reset idle timer on activity

- **WHEN** a prompt is sent or an agent update is received
- **THEN** the system resets the idle timer for that session
- **AND** updates the session's `updatedAt` timestamp
- **AND** the session remains active

#### Scenario: Configurable idle timeout

- **WHEN** the system starts
- **THEN** it reads the `AGENT_SESSION_IDLE_TIMEOUT` environment variable
- **AND** uses the configured value in minutes (default 30)
- **AND** applies the timeout to all sessions uniformly

### Requirement: Database Schema

The system SHALL define Prisma models for agent sessions and messages.

#### Scenario: AgentSession model

- **WHEN** the database schema is generated
- **THEN** the `AgentSession` model includes:
  - `id`: String (UUID, primary key)
  - `repoId`: String (foreign key to Repo)
  - `status`: String (enum: active, completed, cancelled, error)
  - `createdAt`: DateTime (auto-generated)
  - `updatedAt`: DateTime (auto-updated)
  - `repo`: Relation to Repo model
  - `messages`: Relation to AgentMessage[] model

#### Scenario: AgentMessage model

- **WHEN** the database schema is generated
- **THEN** the `AgentMessage` model includes:
  - `id`: String (UUID, primary key)
  - `sessionId`: String (foreign key to AgentSession)
  - `role`: String (enum: user, agent, system)
  - `content`: String (JSON-serialized message content)
  - `timestamp`: DateTime (auto-generated)
  - `session`: Relation to AgentSession model

#### Scenario: Database migration

- **WHEN** running `pnpm db:migrate`
- **THEN** the system creates the `AgentSession` and `AgentMessage` tables
- **AND** establishes foreign key constraints
- **AND** creates indexes on: sessionId, repoId, status, timestamp
- **AND** the migration is reversible via rollback
