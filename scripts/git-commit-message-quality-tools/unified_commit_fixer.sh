#!/bin/bash

set -e

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
FIXES_FILE="/tmp/unified_commit_fixes.json"

echo "=========================================="
echo "Git Commit Message Unified Fixer"
echo "=========================================="
echo ""

# Check if fix file exists
if [ ! -f "$FIXES_FILE" ]; then
    echo "❌ Error: Fix file does not exist: $FIXES_FILE"
    echo ""
    echo "Please run checker first:"
    echo "  python3 /tmp/unified_commit_checker.py"
    echo ""
    exit 1
fi

cd "$REPO_DIR"

# Read fix count
FIXES_COUNT=$(jq length "$FIXES_FILE")

if [ "$FIXES_COUNT" -eq 0 ]; then
    echo "🎉 No commits need fixing\!"
    echo ""
    exit 0
fi

echo "📊 Fix information:"
echo "  - Fix file: $FIXES_FILE"
echo "  - Commits to fix: $FIXES_COUNT  commits"
echo ""

# Display issue statistics
echo "Issue type statistics:"
jq -r '
  [.[] | .issues[]] 
  | group_by(.) 
  | map({issue: .[0], count: length}) 
  | sort_by(.count) 
  | reverse 
  | .[] 
  | "  \(.issue): \(.count) commits"
' "$FIXES_FILE"
echo ""

# Display first 5 commits to be fixed
echo "First 5 commits to be fixed:"
jq -r '
  .[:5] 
  | .[] 
  | "\(.hash) - \(.original_subject[:60])...\n  Issues: \(.issues | join(", "))\n  Fixed: \(.fixed_subject[:60])..."
' "$FIXES_FILE"

if [ "$FIXES_COUNT" -gt 5 ]; then
    echo "... and $((FIXES_COUNT - 5)) "
fi
echo ""

# 1. Create backup
echo "📦 Step 1: Creating backup..."
BACKUP_BRANCH="backup-unified-fix-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH"
echo "✅ Backup branch: $BACKUP_BRANCH"
echo ""

# 2. Create git-filter-repo callback script
echo "📝 Step 2: Preparing git-filter-repo callback..."
cat > /tmp/unified_fix_callback.py << 'PYTHON_EOF'
import json

# Load fix plan
with open('/tmp/unified_commit_fixes.json', 'r', encoding='utf-8') as f:
    fixes_list = json.load(f)
    FIXES = {item['full_hash']: item for item in fixes_list}

# Get original commit ID
original_id = commit.original_id

if original_id:
    original_id_str = original_id.decode('utf-8') if isinstance(original_id, bytes) else str(original_id)
    
    if original_id_str in FIXES:
        fix = FIXES[original_id_str]
        new_subject = fix['fixed_subject']
        new_body = fix['fixed_body']
        
        # Combine into complete message
        if new_body:
            new_message = f"{new_subject}\n\n{new_body}"
        else:
            new_message = new_subject
        
        commit.message = new_message.encode('utf-8')
PYTHON_EOF

echo "✅ Callback script created"
echo ""

# 3. Confirm
echo "⚠️  Warning: This will rewrite Git history\!"
echo "⚠️  All commit hashes will change"
echo "⚠️  If issues occur, can rollback to: $BACKUP_BRANCH"
echo ""
echo "Fix details:"
echo "  - Will fix $FIXES_COUNT  commits"
echo "  - Backup branch: $BACKUP_BRANCH"
echo "  - Fix plan: $FIXES_FILE"
echo ""
read -p "ConfirmExecute fixes? (yes/N) " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Cancelled"
    echo ""
    echo "Backup branch created: $BACKUP_BRANCH"
    echo "To delete: git branch -D $BACKUP_BRANCH"
    echo ""
    exit 1
fi

# 4. Execute fixes
echo ""
echo "🚀 Step 3: Executing git-filter-repo..."
echo ""

START_TIME=$(date +%s)

git filter-repo --force \
  --commit-callback "$(cat /tmp/unified_fix_callback.py)"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "✅ Git history rewrite done\!"
echo "⏱️  Duration: ${DURATION} seconds"
echo ""

# 5. Verify
echo "📊 Step 4: Verifying fix results..."
echo ""

echo "Recent 10 commits:"
git log --oneline -10
echo ""

# Run checker verification
echo "Run checker verification..."
python3 /tmp/unified_commit_checker.py > /tmp/verify_result.txt 2>&1

if grep -q "All commits comply with standards" /tmp/verify_result.txt; then
    echo "✅ Verification passed: All commits now comply with standards！"
else
    echo "⚠️  Verification found issues, please check: /tmp/verify_result.txt"
    REMAINING=$(grep "Found.*issues" /tmp/verify_result.txt || echo "unknown")
    echo "   $REMAINING"
fi

echo ""
echo "=========================================="
echo "🎉 Fixes complete\!"
echo "=========================================="
echo ""

echo "📊 Statistics:"
echo "  - Fixed commits: $FIXES_COUNT"
echo "  - Duration: ${DURATION} seconds"
echo "  - Backup branch: $BACKUP_BRANCH"
echo ""

echo "📝 Next steps:"
echo ""
echo "1. Verify fix results:"
echo "   git log --oneline -20"
echo "   git show <hash>"
echo ""
echo "2. If satisfied, delete backup:"
echo "   git branch -D $BACKUP_BRANCH"
echo ""
echo "3. If rollback needed:"
echo "   git reset --hard $BACKUP_BRANCH"
echo ""
echo "4. Push to remote (if needed):"
echo "   git push --force-with-lease origin main"
echo ""

# Save fix report
cat > /tmp/unified_fix_report.txt << EOF
Git Commit Message Unified Fix Report
================================

Execution time: $(date)
Fixes count: $FIXES_COUNT commits
Duration: ${DURATION} seconds
Backup branch: $BACKUP_BRANCH

Fixed commits:
$(jq -r '.[] | "\(.hash) - \(.original_subject[:60])..."' "$FIXES_FILE")

Verify results:
$(cat /tmp/verify_result.txt)

EOF

echo "📄 Full report saved to: /tmp/unified_fix_report.txt"
echo ""
