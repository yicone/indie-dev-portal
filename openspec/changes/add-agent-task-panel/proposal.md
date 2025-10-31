# Add Agent Task Management Panel

## Why

Enable developers to track and manage AI agent tasks in real-time. While Phase 2 provides chat interaction, developers need visibility into what the agent is doing—file operations, tool calls, and execution plans. This phase adds a dedicated task panel to monitor agent activity, review proposed changes, and approve/reject actions before they execute.

## What Changes

- Add task management panel component (left side of dashboard)
- Display agent's execution plan with step-by-step progress
- Show real-time task status updates (pending, in_progress, completed, failed)
- Implement file change preview with diff visualization
- Add approval workflow for destructive operations (file edits, deletions)
- Create tool call inspector showing arguments and results
- Implement task filtering and search functionality
- Add task history with ability to review past actions
- Create notifications for task completion and errors
- Add keyboard shortcuts for task navigation and approval

## Impact

### Affected Specs

- **NEW**: `agent-task-panel` - Task list, progress tracking, and approval UI
- **NEW**: `agent-file-preview` - File diff viewer and change approval
- **DEPENDS ON**: `agent-websocket` (Phase 2) - Receives task update events
- **DEPENDS ON**: `agent-session` (Phase 1) - Links tasks to sessions
- **EXTENDS**: `acp-client` (Phase 1) - Adds task approval API calls

### Affected Code

- **Backend**:
  - Modified: `api/services/sessionService.ts` (emit task events to WebSocket)
  - Modified: `api/services/acpService.ts` (handle permission requests)
  - New endpoint: `POST /sessions/:id/approve` (approve pending actions)
  - New endpoint: `POST /sessions/:id/reject` (reject pending actions)

- **Frontend**:
  - New component: `components/agent/AgentTaskPanel.tsx` (main panel)
  - New component: `components/agent/TaskList.tsx` (task display)
  - New component: `components/agent/TaskItem.tsx` (individual task)
  - New component: `components/agent/FileDiffViewer.tsx` (diff preview)
  - New component: `components/agent/ToolCallInspector.tsx` (tool details)
  - New component: `components/agent/ApprovalDialog.tsx` (confirmation)
  - Modified: `lib/contexts/AgentChatContext.tsx` (add task state)
  - Modified: `app/page.tsx` (integrate task panel)

- **Types**:
  - Extended: `types/websocket.ts` (task event types)
  - Extended: `types/agent.ts` (task and approval types)

### Dependencies

- **Frontend**: `react-diff-viewer-continued` (diff visualization)
- **Frontend**: `@monaco-editor/react` (code preview, optional)

### Migration Path

1. Install new dependencies: `pnpm add react-diff-viewer-continued`
2. Backend changes are additive (no breaking changes)
3. Frontend components are opt-in (panel can be toggled)
4. Existing sessions continue to work without task panel

## Non-Goals (Future Enhancements)

- Task templates and saved workflows (Future)
- Batch task approval (Future)
- Task scheduling and queuing (Future)
- Multi-agent task coordination (Future)
- Task analytics and metrics (Future)
