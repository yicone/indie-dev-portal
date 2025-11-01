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

## 7. Test Control API ✅

- [x] 7.1 Create Test Control API
  - [x] Create `api/testing/testControl.ts`
  - [x] Implement GET /test-control (get config)
  - [x] Implement POST /test-control (update config)
  - [x] Implement DELETE /test-control (reset config)
- [x] 7.2 Add runtime configuration
  - [x] Support runtime config overrides
  - [x] Integrate with simulator
  - [x] Register router in server

## 8. Fine-Grained Control ✅

- [x] 8.1 Add endpoint-specific control
  - [x] Add createSessionEnabled flag
  - [x] Add sendPromptEnabled flag
  - [x] Update environment variables
- [x] 8.2 Fix control logic
  - [x] Global enabled takes precedence
  - [x] Fine-grained only works when enabled=true
  - [x] Clear fine-grained on disable

## 9. Documentation ✅

- [x] 9.1 Create comprehensive guides
  - [x] Quick test guide with scenarios
  - [x] No-restart guide (API usage)
  - [x] Cheatsheet for quick reference
- [x] 9.2 Update existing docs
  - [x] Update usage guide with API method
  - [x] Update .env.example

## 10. Validation ✅

- [x] 10.1 Test error scenarios
  - [x] Test 429 simulation
  - [x] Test 500 simulation
  - [x] Test network failure
- [x] 10.2 Test with Phase 2 features
  - [x] Test message retry flow
  - [x] Test error recovery flow
  - [x] Test session creation errors
- [x] 10.3 Test API control
  - [x] Test dynamic configuration
  - [x] Test no-restart workflow
  - [x] Test fine-grained control
