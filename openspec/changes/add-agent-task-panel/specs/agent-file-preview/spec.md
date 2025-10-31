## ADDED Requirements

### Requirement: File Diff Visualization

The system SHALL display file changes with syntax-highlighted diff view before applying modifications.

#### Scenario: Preview file edit

- **WHEN** agent proposes file modification
- **THEN** diff viewer shows side-by-side comparison
- **AND** changes are syntax-highlighted by file type

### Requirement: Tool Call Inspector

The system SHALL display tool call details including name, arguments, and execution results.

#### Scenario: View tool execution

- **WHEN** agent executes a tool
- **THEN** inspector shows tool name and arguments
- **AND** execution result or error is displayed
