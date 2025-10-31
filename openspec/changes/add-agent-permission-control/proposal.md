# Add Agent Permission Control System

## Why

Provide fine-grained control over agent capabilities to ensure safe AI-assisted development. While Phases 1-3 enable agent interaction and task monitoring, developers need granular permission controls to restrict agent actions, define allowed operations, and maintain security boundaries. This phase adds a comprehensive permission system with role-based access control and operation whitelisting.

## What Changes

- Add permission configuration UI for defining agent capabilities
- Implement role-based permission system (read-only, standard, admin)
- Create operation whitelist/blacklist for file and tool access
- Add path-based restrictions for file system operations
- Implement permission inheritance from repository settings
- Create permission audit log for tracking agent actions
- Add emergency stop functionality to halt all agent operations
- Implement session-level permission overrides
- Create permission templates for common use cases
- Add visual indicators for permission-restricted operations

## Impact

### Affected Specs

- **NEW**: `agent-permission-system` - Permission management and enforcement
- **EXTENDS**: `acp-client` (Phase 1) - Add permission checks before operations
- **EXTENDS**: `agent-session` (Phase 1) - Store session permissions
- **EXTENDS**: `agent-task-panel` (Phase 3) - Show permission status

### Affected Code

- **Backend**:
  - New service: `api/services/permissionService.ts` (permission logic)
  - New model: `AgentPermission` (Prisma schema)
  - Modified: `api/services/acpService.ts` (permission enforcement)
  - Modified: `api/services/sessionService.ts` (permission initialization)
  - New endpoints: `/permissions/*` (CRUD for permissions)

- **Frontend**:
  - New component: `components/agent/PermissionSettings.tsx` (config UI)
  - New component: `components/agent/PermissionBadge.tsx` (status indicator)
  - New component: `components/agent/EmergencyStop.tsx` (kill switch)
  - Modified: `components/agent/AgentTaskPanel.tsx` (show restrictions)
  - Modified: `lib/contexts/AgentChatContext.tsx` (permission state)

- **Database**:
  - New table: `AgentPermission` (permission rules)
  - New table: `PermissionAuditLog` (action history)

### Dependencies

None (uses existing stack)

### Migration Path

1. Run database migration to add permission tables
2. Initialize default permissions for existing sessions
3. Permissions default to "standard" mode (safe defaults)
4. Users can customize permissions via settings UI

## Non-Goals (Future Enhancements)

- Team-wide permission policies (Future)
- AI-powered permission recommendations (Future)
- Integration with external auth systems (Future)
- Permission analytics and insights (Future)
