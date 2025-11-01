# Add Agent Testing Tools

## Why

Testing agent features (message retry, error handling, session management) is difficult without a way to simulate various scenarios. Developers need to manually disconnect network, modify backend code, or wait for real errors. This slows down development and makes testing unreliable.

## What Changes

- Create agent simulator/mock service
- Support error simulation (429, 500, network failures)
- Control response timing and delays
- Generate test data for sessions and messages
- Provide UI for controlling test scenarios

## Impact

### Affected Specs

- **NEW**: `agent-testing-tools` - Testing utilities for agent features

### Affected Code

- **New**: `api/testing/agentSimulator.ts` - Mock agent service
- **New**: `components/testing/AgentTestPanel.tsx` - Test control UI
- **Modified**: `api/sessions.ts` - Add test mode support

### Dependencies

None (uses existing libraries)

## Non-Goals

- Production testing infrastructure
- Load testing / performance testing
- Automated E2E tests (separate effort)
- Real agent integration tests

## Timeline

**Estimated Effort**: 1 day

**Priority**: Medium (development tool)

**Dependencies**: None

## Success Criteria

- Can simulate 429 errors on demand
- Can simulate network failures
- Can control response delays
- Can test message retry flow
- Can test error recovery flow
