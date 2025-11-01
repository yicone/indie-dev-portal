# Implementation Tasks

## 1. Dependencies and Setup

- [x] 1.1 Install WebSocket dependencies
  - [x] Run `pnpm add ws`
  - [x] Run `pnpm add -D @types/ws`
- [x] 1.2 Install UI dependencies
  - [x] Run `pnpm add react-markdown prism-react-renderer`

## 2. Backend WebSocket Server

- [x] 2.1 Create WebSocket service
  - [x] Initialize WebSocket server on Express
  - [x] Implement connection management
  - [x] Implement ping/pong heartbeat
- [x] 2.2 Create message handler
  - [x] Handle session.create, session.prompt, session.cancel
  - [x] Validate messages and send errors
- [x] 2.3 Integrate with Express
  - [x] Initialize WebSocket after HTTP server
  - [x] Add shutdown cleanup
- [x] 2.4 Emit WebSocket events from session service
  - [x] Emit message.new, message.update, session.status

## 3. WebSocket Types

- [x] 3.1 Create WebSocket message types (`types/websocket.ts`)

## 4. Frontend WebSocket Hook

- [x] 4.1 Create useAgentWebSocket hook
  - [x] Connection with auto-reconnect
  - [x] Exponential backoff
  - [x] Message sending and listening

## 5. Agent Chat Context

- [x] 5.1 Create AgentChatContext
  - [x] Global state management
  - [x] Integrate WebSocket hook
  - [x] Handle incoming messages

## 6. Chat UI Components

- [x] 6.1 AgentFloatingButton
- [x] 6.2 AgentChatPanel
- [x] 6.3 ChatMessage
- [x] 6.4 ChatInput
- [x] 6.5 SessionSwitcher
- [x] 6.6 ConnectionStatus

## 7. Dashboard Integration

- [x] 7.1 Add AgentChatProvider to app
- [x] 7.2 Add floating button to dashboard
- [x] 7.3 Add chat panel

## 8. Styling and Animations

- [x] 8.1 Panel slide-in animation
- [x] 8.2 Message animations
- [x] 8.3 Responsive styles

## 9. Message Features

- [x] 9.1 Auto-scroll
- [x] 9.2 Markdown rendering
- [x] 9.3 Timestamps

## 10. Testing and Validation

- [x] 10.1 Test WebSocket connection
- [x] 10.2 Test message streaming
- [x] 10.3 Test session switching
- [x] 10.4 Test mobile responsiveness
- [x] 10.5 Run linter and formatter
- [x] 10.6 Validate OpenSpec compliance
