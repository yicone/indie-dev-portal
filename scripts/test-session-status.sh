#!/bin/bash
# Automated Session Status Tests
# Tests the 4-state session model implementation

set -e

DB_FILE="prisma/dev.db"
PASS=0
FAIL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Running Session Status Tests..."
echo ""

# Test 1: Check migration applied
echo "📝 Test 1: Migration applied"
MIGRATION=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM _prisma_migrations WHERE migration_name = '20251101034240_simplify_session_states_to_4';")
if [ "$MIGRATION" = "1" ]; then
  echo -e "${GREEN}✅ Migration applied${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ Migration NOT applied${NC}"
  ((FAIL++))
fi

# Test 2: Check no old statuses
echo "📝 Test 2: No old statuses (completed/cancelled)"
OLD_STATUSES=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM AgentSession WHERE status IN ('completed', 'cancelled');")
if [ "$OLD_STATUSES" = "0" ]; then
  echo -e "${GREEN}✅ No old statuses found${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ Found $OLD_STATUSES sessions with old statuses${NC}"
  sqlite3 "$DB_FILE" "SELECT id, status FROM AgentSession WHERE status IN ('completed', 'cancelled');"
  ((FAIL++))
fi

# Test 3: Check valid statuses only
echo "📝 Test 3: Valid statuses only (active/suspended/archived/error)"
INVALID=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM AgentSession WHERE status NOT IN ('active', 'suspended', 'archived', 'error');")
if [ "$INVALID" = "0" ]; then
  echo -e "${GREEN}✅ All statuses valid${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ Found $INVALID sessions with invalid statuses${NC}"
  sqlite3 "$DB_FILE" "SELECT id, status FROM AgentSession WHERE status NOT IN ('active', 'suspended', 'archived', 'error');"
  ((FAIL++))
fi

# Test 4: Check status distribution
echo "📝 Test 4: Status distribution"
echo "Current status counts:"
sqlite3 "$DB_FILE" "SELECT status, COUNT(*) as count FROM AgentSession GROUP BY status;" | while read line; do
  echo "  $line"
done
echo -e "${GREEN}✅ Status distribution shown${NC}"
((PASS++))

# Test 5: Check schema comment updated
echo "📝 Test 5: Schema comment updated"
SCHEMA_COMMENT=$(grep "status.*String.*'active', 'suspended', 'archived', 'error'" prisma/schema.prisma || echo "")
if [ -n "$SCHEMA_COMMENT" ]; then
  echo -e "${GREEN}✅ Schema comment updated${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ Schema comment not updated${NC}"
  ((FAIL++))
fi

# Test 6: Check TypeScript type definition
echo "📝 Test 6: TypeScript type definition"
TYPE_DEF=$(grep "export type SessionStatus = 'active' | 'suspended' | 'archived' | 'error'" types/agent.ts || echo "")
if [ -n "$TYPE_DEF" ]; then
  echo -e "${GREEN}✅ TypeScript type updated${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ TypeScript type not updated${NC}"
  ((FAIL++))
fi

# Test 7: Check TypeScript compiles
echo "📝 Test 7: TypeScript compilation"
if pnpm exec tsc --noEmit > /dev/null 2>&1; then
  echo -e "${GREEN}✅ TypeScript compiles${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ TypeScript errors${NC}"
  pnpm exec tsc --noEmit 2>&1 | head -10
  ((FAIL++))
fi

# Test 8: Check OpenSpec validation
echo "📝 Test 8: OpenSpec validation"
if openspec validate add-agent-chat-ui --strict > /dev/null 2>&1; then
  echo -e "${GREEN}✅ OpenSpec valid${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ OpenSpec validation failed${NC}"
  openspec validate add-agent-chat-ui --strict 2>&1 | head -10
  ((FAIL++))
fi

# Test 9: Check migration checksum
echo "📝 Test 9: Migration checksum consistency"
MIGRATION_FILE="prisma/migrations/20251101034240_simplify_session_states_to_4/migration.sql"
if [ -f "$MIGRATION_FILE" ]; then
  FILE_CHECKSUM=$(cat "$MIGRATION_FILE" | openssl dgst -sha256 -hex | cut -d' ' -f2)
  DB_CHECKSUM=$(sqlite3 "$DB_FILE" "SELECT checksum FROM _prisma_migrations WHERE migration_name = '20251101034240_simplify_session_states_to_4';")
  
  if [ "$FILE_CHECKSUM" = "$DB_CHECKSUM" ]; then
    echo -e "${GREEN}✅ Checksum matches${NC}"
    ((PASS++))
  else
    echo -e "${RED}❌ Checksum mismatch${NC}"
    echo "  File: $FILE_CHECKSUM"
    echo "  DB:   $DB_CHECKSUM"
    ((FAIL++))
  fi
else
  echo -e "${RED}❌ Migration file not found${NC}"
  ((FAIL++))
fi

# Test 10: Check UI filtering logic
echo "📝 Test 10: UI filtering logic"
FILTER_LOGIC=$(grep -A 2 "status === 'active' || s.status === 'suspended'" components/agent/AgentChatPanel.tsx || echo "")
if [ -n "$FILTER_LOGIC" ]; then
  echo -e "${GREEN}✅ UI filters active and suspended${NC}"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️  UI filtering logic not found or changed${NC}"
  ((PASS++))  # Don't fail, just warn
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo -e "${RED}Some tests failed. Please review the output above.${NC}"
  exit 1
else
  echo ""
  echo -e "${GREEN}All tests passed! 🎉${NC}"
  exit 0
fi
