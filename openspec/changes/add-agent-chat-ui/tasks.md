# Implementation Tasks

## 1. Dependencies and Setup

- [ ] 1.1 Install WebSocket dependencies
  - [ ] Run `pnpm add ws`
  - [ ] Run `pnpm add -D @types/ws`
- [ ] 1.2 Install UI dependencies
  - [ ] Run `pnpm add react-markdown prism-react-renderer`

## 2. Backend WebSocket Server

- [ ] 2.1 Create WebSocket service
  - [ ] Initialize WebSocket server on Express
  - [ ] Implement connection management
  - [ ] Implement ping/pong heartbeat
- [ ] 2.2 Create message handler
  - [ ] Handle session.create, session.prompt, session.cancel
  - [ ] Validate messages and send errors
- [ ] 2.3 Integrate with Express
  - [ ] Initialize WebSocket after HTTP server
  - [ ] Add shutdown cleanup
- [ ] 2.4 Emit WebSocket events from session service
  - [ ] Emit message.new, message.update, session.status

## 3. WebSocket Types

- [ ] 3.1 Create WebSocket message types (`types/websocket.ts`)

## 4. Frontend WebSocket Hook

- [ ] 4.1 Create useAgentWebSocket hook
  - [ ] Connection with auto-reconnect
  - [ ] Exponential backoff
  - [ ] Message sending and listening

## 5. Agent Chat Context

- [ ] 5.1 Create AgentChatContext
  - [ ] Global state management
  - [ ] Integrate WebSocket hook
  - [ ] Handle incoming messages

## 6. Chat UI Components

- [ ] 6.1 AgentFloatingButton
- [ ] 6.2 AgentChatPanel
- [ ] 6.3 ChatMessage
- [ ] 6.4 ChatInput
- [ ] 6.5 SessionSwitcher
- [ ] 6.6 ConnectionStatus

## 7. Dashboard Integration

- [ ] 7.1 Add AgentChatProvider to app
- [ ] 7.2 Add floating button to dashboard
- [ ] 7.3 Add chat panel

## 8. Styling and Animations

- [ ] 8.1 Panel slide-in animation
- [ ] 8.2 Message animations
- [ ] 8.3 Responsive styles

## 9. Message Features

- [ ] 9.1 Auto-scroll
- [ ] 9.2 Markdown rendering
- [ ] 9.3 Timestamps

## 10. Testing and Validation

- [ ] 10.1 Test WebSocket connection
- [ ] 10.2 Test message streaming
- [ ] 10.3 Test session switching
- [ ] 10.4 Test mobile responsiveness
- [ ] 10.5 Run linter and formatter
- [ ] 10.6 Validate OpenSpec compliance
