# agent-websocket Specification

## Purpose

TBD - created by archiving change add-agent-chat-ui. Update Purpose after archive.

## Requirements

### Requirement: WebSocket Server Initialization

The system SHALL initialize a WebSocket server on the Express HTTP server for real-time agent communication.

#### Scenario: Start WebSocket server with Express

- **WHEN** the Express server starts
- **THEN** the system creates a WebSocket server attached to the HTTP server
- **AND** listens for WebSocket upgrade requests on the same port as HTTP
- **AND** logs the WebSocket server initialization

#### Scenario: Handle WebSocket upgrade requests

- **WHEN** a client sends a WebSocket upgrade request
- **THEN** the system upgrades the HTTP connection to WebSocket protocol
- **AND** establishes a persistent bidirectional connection
- **AND** assigns a unique connection ID to the client

### Requirement: Client Connection Management

The system SHALL manage WebSocket client connections including authentication, heartbeat, and cleanup.

#### Scenario: Accept new client connection

- **WHEN** a WebSocket client connects
- **THEN** the system accepts the connection
- **AND** stores the connection in an active connections map
- **AND** starts a heartbeat ping/pong mechanism (every 30 seconds)
- **AND** sends a welcome message with connection ID

#### Scenario: Handle client disconnection

- **WHEN** a WebSocket client disconnects
- **THEN** the system removes the connection from active connections map
- **AND** stops the heartbeat timer
- **AND** logs the disconnection event

#### Scenario: Detect dead connections

- **WHEN** a client fails to respond to ping within 60 seconds
- **THEN** the system closes the connection
- **AND** removes it from active connections
- **AND** logs the timeout event

### Requirement: Message Protocol

The system SHALL implement a JSON-based message protocol for WebSocket communication.

#### Scenario: Receive session creation request

- **WHEN** client sends `{ type: 'session.create', payload: { repoId } }`
- **THEN** the system calls `sessionService.createSession(repoId)`
- **AND** sends back `{ type: 'session.created', payload: { session } }`
- **AND** broadcasts session status to all connected clients

#### Scenario: Receive prompt request

- **WHEN** client sends `{ type: 'session.prompt', payload: { sessionId, text } }`
- **THEN** the system calls `sessionService.sendPrompt(sessionId, text)`
- **AND** sends back `{ type: 'message.new', payload: { sessionId, message } }` for user message
- **AND** streams agent responses as `{ type: 'message.update', payload: { sessionId, messageId, content, complete } }`

#### Scenario: Receive cancellation request

- **WHEN** client sends `{ type: 'session.cancel', payload: { sessionId } }`
- **THEN** the system calls `sessionService.cancelSession(sessionId)`
- **AND** sends back `{ type: 'session.status', payload: { sessionId, status: 'cancelled' } }`

#### Scenario: Handle malformed messages

- **WHEN** client sends invalid JSON or missing required fields
- **THEN** the system sends `{ type: 'error', payload: { code: 'INVALID_MESSAGE', message: '...' } }`
- **AND** logs the validation error
- **AND** keeps the connection open

### Requirement: Agent Event Broadcasting

The system SHALL broadcast agent events from backend services to connected WebSocket clients in real-time.

#### Scenario: Broadcast new agent message

- **WHEN** `sessionService` stores a new agent message
- **THEN** the system emits a WebSocket event to all connected clients
- **AND** sends `{ type: 'message.new', payload: { sessionId, message } }`

#### Scenario: Broadcast message update (streaming)

- **WHEN** `sessionService` receives a partial agent response
- **THEN** the system emits a WebSocket event
- **AND** sends `{ type: 'message.update', payload: { sessionId, messageId, content, complete: false } }`
- **AND** includes the partial content for streaming display

#### Scenario: Broadcast session status change

- **WHEN** a session status changes (active → completed/cancelled/error)
- **THEN** the system broadcasts `{ type: 'session.status', payload: { sessionId, status } }`
- **AND** all clients receive the update immediately

### Requirement: Error Handling

The system SHALL handle WebSocket errors gracefully without crashing the server.

#### Scenario: Handle client send error

- **WHEN** sending a message to a client fails (connection closed)
- **THEN** the system catches the error
- **AND** removes the client from active connections
- **AND** logs the error
- **AND** continues serving other clients

#### Scenario: Handle message processing error

- **WHEN** processing a client message throws an exception
- **THEN** the system catches the error
- **AND** sends `{ type: 'error', payload: { code: 'INTERNAL_ERROR', message: '...' } }` to client
- **AND** logs the error with stack trace
- **AND** keeps the connection open

### Requirement: Heartbeat and Keep-Alive

The system SHALL implement ping/pong heartbeat to detect and clean up dead connections.

#### Scenario: Send periodic ping

- **WHEN** 30 seconds elapse since last ping
- **THEN** the system sends a `{ type: 'ping', payload: {} }` message
- **AND** starts a 60-second timeout timer

#### Scenario: Receive pong response

- **WHEN** client responds with `{ type: 'pong', payload: {} }`
- **THEN** the system cancels the timeout timer
- **AND** resets the ping interval

#### Scenario: Timeout on missing pong

- **WHEN** client doesn't respond to ping within 60 seconds
- **THEN** the system closes the WebSocket connection
- **AND** removes the client from active connections
- **AND** logs the timeout

### Requirement: Graceful Shutdown

The system SHALL close all WebSocket connections gracefully when the server shuts down.

#### Scenario: Server shutdown

- **WHEN** the Express server receives SIGTERM or SIGINT
- **THEN** the system sends close frame to all connected clients
- **AND** waits up to 5 seconds for clients to close gracefully
- **AND** force-closes remaining connections
- **AND** stops the WebSocket server
