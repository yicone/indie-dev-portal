# agent-testing-tools Specification

## ADDED Requirements

### Requirement: Error Simulation

The system SHALL provide mechanisms to simulate various error conditions for testing agent features.

#### Scenario: Simulate 429 rate limit error

- **WHEN** test mode is enabled
- **THEN** the system can return 429 errors on demand
- **AND** includes appropriate retry-after header
- **AND** error message matches production format

#### Scenario: Simulate 500 server error

- **WHEN** test mode is enabled
- **THEN** the system can return 500 errors on demand
- **AND** error message is configurable
- **AND** error format matches production

#### Scenario: Simulate network failure

- **WHEN** test mode is enabled
- **THEN** the system can simulate connection timeout
- **AND** can simulate connection refused
- **AND** can simulate slow network (high latency)

### Requirement: Response Control

The system SHALL allow control over response timing and success rates for testing.

#### Scenario: Control response delay

- **WHEN** test mode is enabled
- **THEN** response delay can be configured (0-10 seconds)
- **AND** delay applies to all API endpoints
- **AND** delay is consistent across requests

#### Scenario: Control success rate

- **WHEN** test mode is enabled
- **THEN** success rate can be configured (0-100%)
- **AND** failures are randomly distributed
- **AND** failure type can be specified (429, 500, network)

### Requirement: Test Mode Isolation

The system SHALL ensure test mode does not affect production behavior.

#### Scenario: Enable test mode

- **WHEN** TEST_MODE environment variable is set
- **THEN** test simulator is activated
- **AND** production code paths are unchanged
- **AND** test mode indicator is visible in UI

#### Scenario: Disable test mode

- **WHEN** TEST_MODE environment variable is not set
- **THEN** all requests use production code
- **AND** simulator is not loaded
- **AND** no test UI is shown

### Requirement: Mock Agent Responses

The system SHALL provide mock responses for agent interactions.

#### Scenario: Mock session creation

- **WHEN** test mode is enabled
- **THEN** session creation returns mock session data
- **AND** session ID is generated
- **AND** response time is controllable

#### Scenario: Mock message sending

- **WHEN** test mode is enabled
- **THEN** message sending returns mock response
- **AND** can simulate streaming responses
- **AND** can simulate partial failures

### Requirement: Test Control API

The system SHALL provide an API for controlling test scenarios dynamically (development only).

#### Scenario: Get current test configuration

- **WHEN** GET request to /test-control endpoint
- **THEN** returns current runtime and environment configuration
- **AND** shows all test mode settings
- **AND** only available in development mode

#### Scenario: Update test configuration dynamically

- **WHEN** POST request to /test-control with configuration
- **THEN** updates runtime configuration immediately
- **AND** no server restart required
- **AND** changes apply to next request
- **AND** active sessions remain unaffected

#### Scenario: Reset to environment variables

- **WHEN** DELETE request to /test-control
- **THEN** clears runtime configuration
- **AND** falls back to environment variables
- **AND** confirms reset in response

### Requirement: Fine-Grained Endpoint Control

The system SHALL allow selective test mode activation per endpoint.

#### Scenario: Enable test mode for specific endpoints

- **WHEN** fine-grained control is configured
- **THEN** test mode can be enabled for session creation only
- **OR** test mode can be enabled for message sending only
- **AND** other endpoints use normal behavior

#### Scenario: Test message retry without session suspension

- **WHEN** test mode enabled for sendPrompt only
- **THEN** session creation works normally
- **AND** message sending simulates errors
- **AND** sessions remain active for retry testing
- **AND** no server restart needed to toggle modes
