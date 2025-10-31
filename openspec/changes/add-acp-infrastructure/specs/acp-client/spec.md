# acp-client Specification Delta

## ADDED Requirements

### Requirement: ACP Client Initialization

The system SHALL initialize an ACP client using the official `@agentclientprotocol/sdk` to communicate with Gemini CLI agents via stdio.

#### Scenario: Initialize ACP client for new session

- **WHEN** a new agent session is created
- **THEN** the system spawns a Gemini CLI process with `--experimental-acp` flag
- **AND** establishes stdio pipes for bidirectional JSON-RPC communication
- **AND** initializes the ACP SDK client with the process streams
- **AND** stores the process reference mapped to the session ID

#### Scenario: Handle Gemini CLI not found

- **WHEN** attempting to spawn Gemini CLI but the executable is not found
- **THEN** the system returns an error indicating Gemini CLI is not installed
- **AND** logs the attempted path from `GEMINI_CLI_PATH` environment variable
- **AND** does not create a session record in the database

### Requirement: Session Creation via ACP

The system SHALL create ACP sessions bound to specific Git repositories using the `session/new` protocol method.

#### Scenario: Create session for valid repository

- **WHEN** a user requests to create an agent session for a repository
- **THEN** the system validates the repository exists in the scanned repositories list
- **AND** spawns a Gemini CLI process with `--workspace` flag pointing to the repository root
- **AND** sends a `session/new` JSON-RPC request via stdio
- **AND** receives a session ID from the agent
- **AND** stores the session in the database with status='active'
- **AND** returns the session ID to the caller

#### Scenario: Reject session for invalid repository

- **WHEN** a user requests to create a session for a non-existent repository ID
- **THEN** the system returns a 404 error
- **AND** does not spawn any Gemini CLI process
- **AND** logs the invalid repository ID attempt

#### Scenario: Reject session for unauthorized path

- **WHEN** a repository path is outside the `AGENT_WORKSPACE_ROOT` directory
- **THEN** the system returns a 403 Forbidden error
- **AND** does not spawn any Gemini CLI process
- **AND** logs the security violation

### Requirement: Prompt Submission

The system SHALL send user prompts to the agent using the `session/prompt` protocol method.

#### Scenario: Send prompt to active session

- **WHEN** a user submits a prompt text for an active session
- **THEN** the system retrieves the session from the database
- **AND** validates the session status is 'active'
- **AND** sends a `session/prompt` JSON-RPC request with the user's text
- **AND** stores the user message in the database with role='user'
- **AND** returns 202 Accepted to indicate the prompt was queued

#### Scenario: Reject prompt for inactive session

- **WHEN** a user submits a prompt for a session with status='completed' or 'cancelled'
- **THEN** the system returns a 409 Conflict error
- **AND** does not send any message to the agent
- **AND** includes the current session status in the error response

### Requirement: Agent Response Handling

The system SHALL process agent responses received via `session/update` notifications and store them in the database.

#### Scenario: Receive text response chunk

- **WHEN** the agent sends a `session/update` notification with text content
- **THEN** the system stores the message in the database with role='agent'
- **AND** appends the text to any previous partial response for the same turn
- **AND** updates the session's `updatedAt` timestamp

#### Scenario: Receive agent plan

- **WHEN** the agent sends a `session/update` notification containing a plan
- **THEN** the system stores the plan as a message with role='system' and type='plan'
- **AND** serializes the plan steps as JSON in the message content

#### Scenario: Receive tool execution notification

- **WHEN** the agent sends a `session/update` notification about tool usage
- **THEN** the system stores the tool call as a message with role='system' and type='tool'
- **AND** includes the tool name, arguments, and result in the message content

### Requirement: Session Termination

The system SHALL support graceful termination of agent sessions using the `session/cancel` protocol method.

#### Scenario: Cancel active session

- **WHEN** a user requests to cancel an active session
- **THEN** the system sends a `session/cancel` JSON-RPC request to the agent
- **AND** waits up to 5 seconds for the agent to acknowledge cancellation
- **AND** terminates the Gemini CLI process
- **AND** updates the session status to 'cancelled' in the database
- **AND** returns success to the caller

#### Scenario: Handle agent process crash

- **WHEN** the Gemini CLI process exits unexpectedly (non-zero exit code)
- **THEN** the system detects the process exit event
- **AND** updates the session status to 'error' in the database
- **AND** stores the stderr output as an error message
- **AND** removes the process from the active process map

#### Scenario: Clean up on server shutdown

- **WHEN** the Express server is shutting down
- **THEN** the system sends `session/cancel` to all active sessions
- **AND** terminates all Gemini CLI processes
- **AND** updates all active session statuses to 'cancelled'
- **AND** waits up to 10 seconds for graceful shutdown before force-killing processes

### Requirement: Process Lifecycle Management

The system SHALL manage Gemini CLI process lifecycle including spawning, monitoring, and cleanup.

#### Scenario: Monitor process health

- **WHEN** a Gemini CLI process is running
- **THEN** the system monitors the process for exit events
- **AND** captures stdout for ACP messages
- **AND** captures stderr for error logging
- **AND** maintains a heartbeat check every 30 seconds

#### Scenario: Limit concurrent processes

- **WHEN** the number of active Gemini CLI processes reaches 5
- **THEN** new session creation requests return a 429 Too Many Requests error
- **AND** include a retry-after header suggesting a 60-second wait
- **AND** log the rate limit event

#### Scenario: Auto-terminate idle sessions

- **WHEN** a session has no activity (no prompts or updates) for 30 minutes
- **THEN** the system automatically sends `session/cancel` to the agent
- **AND** terminates the Gemini CLI process
- **AND** updates the session status to 'completed' with reason='idle_timeout'

### Requirement: Error Handling

The system SHALL handle ACP protocol errors and agent failures gracefully.

#### Scenario: Handle JSON-RPC parse error

- **WHEN** the agent sends malformed JSON via stdout
- **THEN** the system logs the parse error with the raw message
- **AND** continues listening for subsequent messages
- **AND** does not crash the process manager

#### Scenario: Handle agent timeout

- **WHEN** the agent does not respond to a `session/prompt` within 60 seconds
- **THEN** the system logs a timeout warning
- **AND** stores a system message indicating the timeout
- **AND** keeps the session active for potential recovery

#### Scenario: Handle stdio pipe broken

- **WHEN** the stdio pipe to the agent process breaks unexpectedly
- **THEN** the system detects the pipe error
- **AND** updates the session status to 'error'
- **AND** terminates the process
- **AND** logs the pipe error details
