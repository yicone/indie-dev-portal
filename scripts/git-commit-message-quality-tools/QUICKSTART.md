# Quick Start Guide

## 5-Minute Setup

### Step 1: Check Commits (30 seconds)

```bash
cd /Users/tr/Workspace/indie-dev-portal
python3 scripts/git-commit-message-quality-tools/unified_commit_checker.py
```

**Output**:

```
⚠️  Found 26 problematic commits
✅ Fix plan saved to: /tmp/unified_commit_fixes.json
```

### Step 2: View Issues (1 minute)

```bash
python3 scripts/git-commit-message-quality-tools/ai_fix_helper.py
```

**Output**: Displays all problematic commits and fix suggestions

### Step 3: Request AI Fixes (2 minutes)

Copy Step 2 output, then tell AI:

```
Based on the above information, generate fixed_subject and fixed_body for each commit,
then update /tmp/unified_commit_fixes.json file.
```

AI will automatically populate the fix content.

### Step 4: Execute Fixes (1 minute)

```bash
scripts/git-commit-message-quality-tools/unified_commit_fixer.sh
```

Enter `yes` to confirm.

### Step 5: Verify (30 seconds)

```bash
python3 scripts/git-commit-message-quality-tools/unified_commit_checker.py
```

Should display:

```
🎉 Excellent\! All commits comply with standards\!
```

## FAQ

### Q: Why are fixed_subject and fixed_body empty?

A: This is by design\! They need to be populated by AI based on context to ensure fix accuracy.

### Q: How to rollback?

A: The fixer automatically creates a backup branch:

```bash
git reset --hard backup-unified-fix-YYYYMMDD-HHMMSS
```

### Q: Can it auto-fix?

A: Not recommended. AI-assisted fixes better understand semantics and generate more accurate results.

## Next Steps

- Read full documentation: `scripts/git-commit-message-quality-tools/README.md`
- View changelog: `scripts/git-commit-message-quality-tools/CHANGELOG.md`
