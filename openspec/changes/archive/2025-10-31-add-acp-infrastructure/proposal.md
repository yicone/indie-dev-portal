# Add ACP Infrastructure

## Why

Enable AI-assisted coding capabilities in the Dev Portal by integrating the Agent Client Protocol (ACP) standard. This provides a foundation for connecting local AI coding agents (starting with Gemini CLI) to assist developers with code analysis, modification, and repository management tasks through natural language conversations.

## What Changes

- Add ACP client infrastructure using `@agentclientprotocol/sdk`
- Implement Gemini CLI process manager for spawning and managing agent instances
- Create session lifecycle management for multi-turn conversations
- Add database schema for persisting agent sessions and conversation history
- Implement stdio-based communication bridge between backend and Gemini CLI
- Add repository context binding to restrict agent file system access to scanned Git repos
- Create backend API endpoints for session management (create, list, retrieve)

## Impact

### Affected Specs

- **NEW**: `acp-client` - Core ACP client implementation and Gemini CLI integration
- **NEW**: `agent-session` - Session lifecycle, persistence, and context management

### Affected Code

- **Backend**:
  - New service: `api/services/acpService.ts` (ACP client wrapper)
  - New service: `api/services/geminiCliManager.ts` (process management)
  - New service: `api/services/sessionService.ts` (session CRUD)
  - New API routes: `api/sessions.ts` (session endpoints)
  - Database: New Prisma models for `AgentSession`, `AgentMessage`
  - Schema migration: Add session and message tables

- **Types**:
  - New types: `types/acp.ts` (ACP protocol types)
  - New types: `types/agent.ts` (session, message, status types)

- **Configuration**:
  - Environment variables: `GEMINI_CLI_PATH`, `AGENT_WORKSPACE_ROOT`

### Dependencies

- **New**: `@agentclientprotocol/sdk` - Official ACP SDK for TypeScript
- **New**: `uuid` - Session ID generation
- **Existing**: `@prisma/client` - Extended with new models

### Migration Path

1. Install new dependencies: `pnpm add @agentclientprotocol/sdk uuid`
2. Run database migration: `pnpm db:migrate`
3. Configure environment variables in `.env`
4. Verify Gemini CLI installation: `gemini --version`
5. Backend API will be available but no UI integration yet (Phase 2)

## Non-Goals (Future Phases)

- WebSocket real-time communication (Phase 2)
- Chat UI components (Phase 2)
- Task management panel (Phase 3)
- Permission control UI (Phase 4)
- Multi-agent support (Future)
