## ADDED Requirements

### Requirement: Task List Display

The system SHALL display agent tasks in a dedicated panel showing task status, description, and progress.

#### Scenario: View active tasks

- **WHEN** agent creates execution plan
- **THEN** tasks appear in panel with pending status
- **AND** each task shows description and step number

#### Scenario: Task status updates

- **WHEN** agent completes a task
- **THEN** task status updates to completed in real-time
- **AND** progress indicator reflects completion percentage

### Requirement: Task Approval Workflow

The system SHALL require user approval for destructive operations before execution.

#### Scenario: Approve file modification

- **WHEN** agent requests file edit permission
- **THEN** approval dialog shows file diff preview
- **AND** user can approve or reject the change

#### Scenario: Reject destructive action

- **WHEN** user rejects a task
- **THEN** agent receives rejection notification
- **AND** task status updates to cancelled
