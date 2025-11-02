#!/bin/bash
# Test script for message streaming functionality
# Tests network interruption recovery and message ordering

set -e

API_URL="http://localhost:4000"
TEST_CONTROL="$API_URL/test-control"

echo "🧪 Message Streaming Test Suite"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
}

fail() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if server is running
info "Checking if server is running..."
if ! curl -s "$API_URL/health" > /dev/null 2>&1; then
    fail "Server is not running. Please start with 'pnpm dev'"
fi
pass "Server is running"
echo ""

# Test 4.2: Network Interruption Recovery
echo "📋 Test 4.2: Network Interruption Recovery"
echo "-------------------------------------------"

info "Step 1: Disable test mode (baseline)"
curl -s -X POST "$TEST_CONTROL" \
  -H "Content-Type: application/json" \
  -d '{"enabled":false}' > /dev/null
pass "Test mode disabled"

info "Step 2: Enable network error simulation"
curl -s -X POST "$TEST_CONTROL" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"errorType":"network","createSessionEnabled":false,"sendPromptEnabled":true}' > /dev/null
pass "Network errors enabled for messages"

info "Step 3: Manual test required"
echo ""
echo "  Please perform the following in the UI:"
echo "  1. Create a new session (should work)"
echo "  2. Send a message (should fail with network error)"
echo "  3. Verify error message appears in UI"
echo "  4. Verify 'Agent is typing...' is removed"
echo "  5. Verify retry button appears"
echo ""
read -p "  Press Enter when test is complete..."

info "Step 4: Disable test mode"
curl -s -X POST "$TEST_CONTROL" \
  -H "Content-Type: application/json" \
  -d '{"enabled":false}' > /dev/null
pass "Test mode disabled"

info "Step 5: Verify recovery"
echo ""
echo "  Please verify in the UI:"
echo "  1. Send another message (should work)"
echo "  2. Message should stream normally"
echo ""
read -p "  Press Enter when recovery is verified..."

pass "Test 4.2 complete"
echo ""

# Test 4.3: Message Ordering
echo "📋 Test 4.3: Message Ordering"
echo "------------------------------"

info "Manual test required"
echo ""
echo "  Please perform the following in the UI:"
echo "  1. Send message: 'Count from 1 to 5'"
echo "  2. Verify numbers appear in order: 1, 2, 3, 4, 5"
echo "  3. Send message: 'List 3 fruits'"
echo "  4. Verify fruits appear in order"
echo ""
read -p "  Press Enter when test is complete..."

pass "Test 4.3 complete"
echo ""

# Test 4.4: Concurrent Streaming
echo "📋 Test 4.4: Concurrent Streaming"
echo "----------------------------------"

info "Manual test required"
echo ""
echo "  Please perform the following:"
echo "  1. Open two browser tabs with the app"
echo "  2. Create sessions in both tabs"
echo "  3. Send messages in both tabs simultaneously"
echo "  4. Verify both streams work independently"
echo "  5. Verify no message mixing between tabs"
echo ""
read -p "  Press Enter when test is complete..."

pass "Test 4.4 complete"
echo ""

# Test 4.6: Performance
echo "📋 Test 4.6: Performance Test"
echo "------------------------------"

info "Manual test required"
echo ""
echo "  Please perform the following:"
echo "  1. Send message: 'Write a long story about a cat'"
echo "  2. Observe streaming performance"
echo "  3. Verify no lag or stuttering"
echo "  4. Verify UI remains responsive"
echo "  5. Check browser console for errors"
echo ""
read -p "  Press Enter when test is complete..."

pass "Test 4.6 complete"
echo ""

# Summary
echo "================================"
echo -e "${GREEN}✓ All tests complete!${NC}"
echo ""
echo "Test Results:"
echo "  ✓ 4.2 Network Interruption Recovery"
echo "  ✓ 4.3 Message Ordering"
echo "  ✓ 4.4 Concurrent Streaming"
echo "  ✓ 4.6 Performance"
echo ""
echo "Next steps:"
echo "  1. Review any issues found"
echo "  2. Update tasks.md with results"
echo "  3. Proceed to archiving if all tests pass"
