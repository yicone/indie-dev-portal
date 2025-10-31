# Add Agent Chat UI

## Why

Enable real-time interaction with AI coding agents through an intuitive chat interface. Building on Phase 1's ACP infrastructure, this phase adds WebSocket communication for streaming agent responses and a responsive UI for natural language conversations with agents about code.

## What Changes

- Add WebSocket server for real-time bidirectional communication
- Implement WebSocket client in frontend for live message streaming
- Create slide-in Agent Chat panel component (right side of dashboard)
- Add chat message components with role-based styling (user, agent, system)
- Implement session switcher UI for managing multiple conversations
- Add repository context selector to bind conversations to specific projects
- Create loading states and typing indicators for agent responses
- Add message history display with auto-scroll to latest
- Implement connection status indicator and reconnection logic
- Add keyboard shortcuts for sending messages and toggling panel

## Impact

### Affected Specs

- **NEW**: `agent-websocket` - WebSocket server and client for real-time messaging
- **NEW**: `agent-chat-ui` - Chat panel, messages, and interaction components
- **DEPENDS ON**: `acp-client` (Phase 1) - Uses session and message APIs
- **DEPENDS ON**: `agent-session` (Phase 1) - Displays and manages sessions

### Affected Code

- **Backend**:
  - New service: `api/services/websocketService.ts` (WebSocket server setup)
  - New handler: `api/handlers/agentWebSocketHandler.ts` (message routing)
  - Modified: `api/server.ts` (WebSocket server initialization)
  - Modified: `api/services/sessionService.ts` (emit events to WebSocket clients)

- **Frontend**:
  - New hook: `lib/hooks/useAgentWebSocket.ts` (WebSocket client hook)
  - New component: `components/agent/AgentChatPanel.tsx` (main panel)
  - New component: `components/agent/ChatMessage.tsx` (message display)
  - New component: `components/agent/ChatInput.tsx` (message input)
  - New component: `components/agent/SessionSwitcher.tsx` (session list)
  - New component: `components/agent/AgentFloatingButton.tsx` (trigger button)
  - New component: `components/agent/ConnectionStatus.tsx` (status indicator)
  - Modified: `app/page.tsx` (integrate floating button and panel)

- **Types**:
  - New types: `types/websocket.ts` (WebSocket message types)
  - Extended: `types/agent.ts` (UI-specific types)

### Dependencies

- **New**: `ws` - WebSocket server for Node.js
- **New**: `@types/ws` - TypeScript types for ws
- **Existing**: Browser WebSocket API (no additional dependency)
- **Existing**: React hooks and context for state management

### Migration Path

1. Install new dependencies: `pnpm add ws && pnpm add -D @types/ws`
2. Backend will automatically start WebSocket server on Express upgrade
3. Frontend components are opt-in via floating button (no breaking changes)
4. Existing REST API endpoints remain functional
5. WebSocket is progressive enhancement over REST

## Non-Goals (Future Phases)

- Task management panel with history (Phase 3)
- Permission control and approval UI (Phase 4)
- Multi-agent selection (Future)
- Voice input/output (Future)
- Code diff viewer integration (Future)
- Collaborative editing (Future)
