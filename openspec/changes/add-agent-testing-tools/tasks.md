# Implementation Tasks - Agent Testing Tools

## 1. Agent Simulator Service ✅

- [x] 1.1 Create simulator service
  - [x] Create `api/testing/agentSimulator.ts`
  - [x] Implement error simulation (429, 500, network)
  - [x] Implement delay control
  - [x] Implement response mocking
- [x] 1.2 Add test mode configuration
  - [x] Add environment variables to `.env.example`
  - [x] Document configuration options
  - [x] Keep production code unchanged

## 2. Error Simulation ✅

- [x] 2.1 Implement 429 rate limit simulation
  - [x] Return 429 on demand
  - [x] Configurable retry-after header
- [x] 2.2 Implement 500 server error simulation
  - [x] Return 500 on demand
  - [x] Configurable error messages
- [x] 2.3 Implement network failure simulation
  - [x] Timeout simulation
  - [x] Connection refused simulation

## 3. Response Control ✅

- [x] 3.1 Implement delay control
  - [x] Configurable response delay (0-10s)
  - [x] Clamping to safe range
- [x] 3.2 Implement success rate control
  - [x] Configurable success percentage
  - [x] Random failure injection

## 4. Test Control UI (Deferred)

- [ ] 4.1 Create test control panel
  - [ ] Create `components/testing/AgentTestPanel.tsx`
  - [ ] Add error type selector
  - [ ] Add delay slider
  - [ ] Add success rate slider
- [ ] 4.2 Integrate with dev environment
  - [ ] Show only in development mode
  - [ ] Add keyboard shortcut to toggle

**Note**: MVP uses environment variables instead of UI for simplicity

## 5. Documentation ✅

- [x] 5.1 Write usage guide
  - [x] Document environment variables
  - [x] Document configuration
  - [x] Provide examples (docs/testing/agent-testing-tools-usage-guide.md)
- [x] 5.2 Update development docs
  - [x] Add testing scenarios
  - [x] Document common use cases

## 6. Integration ✅

- [x] 6.1 Integrate with API routes
  - [x] Add simulator to POST /api/sessions
  - [x] Add simulator to POST /api/sessions/:id/prompt
  - [x] Handle simulated errors in error handlers
- [x] 6.2 Add startup logging
  - [x] Log simulator status on server start
  - [x] Show configuration in console

## 7. Validation (Manual Testing Required)

- [ ] 7.1 Test error scenarios
  - [ ] Test 429 simulation
  - [ ] Test 500 simulation
  - [ ] Test network failure
- [ ] 7.2 Test with Phase 2 features
  - [ ] Test message retry flow
  - [ ] Test error recovery flow
  - [ ] Test session creation errors
