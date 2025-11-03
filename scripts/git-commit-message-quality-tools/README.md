# Git Commit Message Quality Tools

## Overview

This toolkit checks and fixes Git commit messages to ensure compliance with project standards.

## Tool List

### 1. `unified_commit_checker.py` - Unified Checker

**Features**:

- Scans all Git commits
- Applies 13 validation rules
- Generates issue report (JSON format)

**Usage**:

```bash
python3 scripts/git-commit-message-quality-tools/unified_commit_checker.py
```

**Output**:

- Console: Issue statistics
- File: `/tmp/unified_commit_fixes.json`

### 2. `ai_fix_helper.py` - AI Fix Helper

**Features**:

- Reads checker-generated JSON
- Displays commits needing fixes
- Provides fix suggestions

**Usage**:

```bash
python3 scripts/git-commit-message-quality-tools/ai_fix_helper.py
```

**Workflow**:

1. Display all problematic commits
2. Provide fix suggestions
3. Wait for AI to populate `fixed_subject` and `fixed_body`

### 3. `unified_commit_fixer.sh` - Unified Fixer

**Features**:

- Reads populated JSON
- Rewrites history using git-filter-repo
- Auto-backup and verification

**Usage**:

```bash
scripts/git-commit-message-quality-tools/unified_commit_fixer.sh
```

**Note**: AI must populate fix content first\!

## Complete Workflow

### Step 1: Check All Commits

```bash
cd /Users/tr/Workspace/indie-dev-portal
python3 scripts/git-commit-message-quality-tools/unified_commit_checker.py
```

### Step 2: View Issues and Get AI Fix Suggestions

```bash
python3 scripts/git-commit-message-quality-tools/ai_fix_helper.py
```

### Step 3: Use AI to Populate Fix Content

Provide Step 2 output to AI (Cascade), requesting AI to generate for each commit:

- `fixed_subject`: Fixed subject (≤100 characters)
- `fixed_body`: Fixed body

AI will directly edit `/tmp/unified_commit_fixes.json` file.

### Step 4: Execute Fixes

```bash
scripts/git-commit-message-quality-tools/unified_commit_fixer.sh
# Enter "yes" to confirm
```

### Step 5: Verify Results

```bash
python3 scripts/git-commit-message-quality-tools/unified_commit_checker.py
```

## Validation Rules

1. **contains-\*\*\*\***: Contains `****` placeholder
2. **subject-too-long**: Subject exceeds 100 characters
3. **contains-Chinese**: Contains Chinese characters
4. **emoji-in-subject**: Subject contains emoji
5. **markdown-in-subject**: Subject contains markdown markers
6. **invalid-format**: Doesn't match `type(scope): description` format
7. **emoji-first-line**: Body first line is standalone emoji
8. **incomplete-list-items**: Incomplete list items
9. **too-many-empty-lines**: Too many empty lines
10. **incomplete-subject-ending**: Incomplete subject ending
11. **multiple-spaces**: Multiple consecutive spaces
12. **emoji-in-body**: Body contains emoji
13. **markdown-chaos-in-body**: Chaotic markdown markers in body
14. **malformed-code-blocks**: Malformed code blocks

## JSON Schema

```json
{
  "hash": "Short hash (7 chars)",
  "full_hash": "Full hash (40 chars)",
  "original_subject": "Original subject",
  "original_body": "Original body (fully preserved)",
  "issues": ["List of issue types"],
  "fixed_subject": "Fixed subject (populated by AI)",
  "fixed_body": "Fixed body (populated by AI)"
}
```

## Important Notes

1. **Body Integrity**: `original_body` field fully preserves all content, no truncation
2. **AI Fixes**: `fixed_subject` and `fixed_body` must be populated by AI, not auto-generated
3. **History Rewrite**: Fixes will rewrite Git history, all commit hashes will change
4. **Auto Backup**: Backup branch created automatically before fixes
5. **Manual Confirmation**: Fixes require typing `yes` to confirm

## Troubleshooting

### Issue: Checker Can't Find Commits

```bash
# Ensure in Git repository
git status

# Check Python version
python3 --version  # Requires 3.6+
```

### Issue: Fixer Can't Find JSON File

```bash
# Ensure checker ran first
python3 scripts/git-commit-message-quality-tools/unified_commit_checker.py

# Check file exists
ls -lh /tmp/unified_commit_fixes.json
```

### Issue: fixed_subject and fixed_body Are Empty

This is normal\! These fields need to be populated by AI:

```bash
# 1. Run AI helper tool
python3 scripts/git-commit-message-quality-tools/ai_fix_helper.py

# 2. Provide output to AI
# 3. AI will populate /tmp/unified_commit_fixes.json
```

## Examples

### Checker Output Example

```
============================================================
Git Commit Message Unified Checker
============================================================

🔍 Starting check of all commits...

📊 Total 239 commits

⚠️  Found 26 problematic commits

Issue type statistics:
  incomplete-list-items: 15 commits
  emoji-in-subject: 4 commits
  ...

✅ Fix plan saved to: /tmp/unified_commit_fixes.json

⚠️  Note:
  - fixed_subject and fixed_body fields are empty
  - Need AI to populate fix content based on context
```

### AI Helper Tool Output Example

```
============================================================
Commit 1/26: 0052619
============================================================

📋 Original Subject:
  fix(streaming): prevent timeout during long-running

📋 Original Body:
   1| Agent operationsFixed streaming timeout...
   2| - Agent approved to run pnpm outdated (id:0)
   ...

⚠️  Issues:
  - incomplete-list-items

💡 Fix Suggestions:
  - Clean up incomplete list items (lines with only markers, no content)
```

## Related Documentation

- Complete usage documentation: `/tmp/UNIFIED_COMMIT_TOOLS_README.md`
- Tools summary: `/tmp/TOOLS_SUMMARY.md`
