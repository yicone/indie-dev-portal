# Implementation Tasks

## 1. Backend - Task Event System

- [ ] 1.1 Extend `acpService.ts` to capture task/plan updates from ACP
- [ ] 1.2 Add task event broadcasting to WebSocket clients
- [ ] 1.3 Create approval API endpoints (`POST /sessions/:id/approve`, `/reject`)
- [ ] 1.4 Implement permission request handling in session service

## 2. Frontend - Task Panel UI

- [ ] 2.1 Install dependencies (`react-diff-viewer-continued`)
- [ ] 2.2 Create `AgentTaskPanel.tsx` main component
- [ ] 2.3 Implement `TaskList.tsx` with filtering and search
- [ ] 2.4 Build `TaskItem.tsx` with status indicators
- [ ] 2.5 Add `FileDiffViewer.tsx` for change preview
- [ ] 2.6 Create `ToolCallInspector.tsx` for tool details
- [ ] 2.7 Implement `ApprovalDialog.tsx` for confirmations

## 3. State Management

- [ ] 3.1 Extend `AgentChatContext` with task state
- [ ] 3.2 Add task event handlers to WebSocket hook
- [ ] 3.3 Implement task filtering and search logic
- [ ] 3.4 Add task history persistence

## 4. Integration

- [ ] 4.1 Integrate task panel into dashboard layout
- [ ] 4.2 Add keyboard shortcuts for task navigation
- [ ] 4.3 Implement notification system for task events
- [ ] 4.4 Add panel toggle and resize functionality

## 5. Testing

- [ ] 5.1 Test task event flow end-to-end
- [ ] 5.2 Verify approval workflow
- [ ] 5.3 Test diff viewer with various file types
- [ ] 5.4 Validate keyboard shortcuts
- [ ] 5.5 Test panel responsiveness
