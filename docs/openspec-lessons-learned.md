# OpenSpec Lessons Learned

## Overview

This document captures lessons learned from using OpenSpec for spec-driven development in this project.

---

## Lesson 1: Tasks.md Must Be Updated During Development

### What Happened

**Change**: `add-agent-chat-ui`

**Problem**:

- Created `tasks.md` with 30 tasks at the start
- Implemented all functionality successfully
- **Never updated tasks.md during development**
- Archived with 0/30 tasks marked complete

**Discovery**:

- User noticed all tasks were `[ ]` even after archive
- Asked: "Why didn't task status change until archive ended?"

### Root Cause

**OpenSpec Workflow Step 6**:

> **Update checklist** - After all work is done, set every task to `- [x]` so the list reflects reality

**What we missed**:

1. ❌ Didn't update tasks.md as we completed each task
2. ❌ Didn't review tasks.md before archiving
3. ❌ Used `--yes` flag which skipped the warning

### OpenSpec Archive Behavior

```bash
$ openspec archive add-agent-chat-ui --yes

Task status: 0/30 tasks
Warning: 30 incomplete task(s) found. Continuing due to --yes flag.
```

**Design**:

- ✅ OpenSpec **detected** incomplete tasks
- ⚠️ Gave a **warning**
- ❌ But `--yes` flag **bypassed** the check

### Correct Workflow

**During Development**:

```bash
# After implementing each task
git add components/agent/AgentFloatingButton.tsx

# Update tasks.md
sed -i '' 's/- \[ \] 6.1 AgentFloatingButton/- [x] 6.1 AgentFloatingButton/' \
  openspec/changes/add-agent-chat-ui/tasks.md

git add openspec/changes/add-agent-chat-ui/tasks.md
git commit -m "feat: add AgentFloatingButton

Implements task 6.1 from add-agent-chat-ui"
```

**Before Archiving**:

```bash
# 1. Review tasks.md
cat openspec/changes/add-agent-chat-ui/tasks.md | grep -c "\[ \]"
# Should be 0

# 2. Update any missed tasks
# Edit tasks.md to mark completed tasks

# 3. Archive without --yes to see warnings
openspec archive add-agent-chat-ui
# Review the warning, confirm tasks are complete

# 4. Or use --yes only if you're sure
openspec archive add-agent-chat-ui --yes
```

### Fix Applied

**After Archive**:

- Updated archived `tasks.md` to mark all 30 tasks complete
- Committed with explanation of the oversight
- Documented this lesson learned

### Impact

**Low Impact** (this time):

- Archived change still valid
- Specs were created correctly
- Just a documentation issue

**Could be High Impact**:

- If tasks were actually incomplete
- If someone relied on tasks.md for status
- If we forgot to implement something

### Prevention

**For Future Changes**:

1. **Update tasks.md incrementally**:

   ```bash
   # Add to commit message template
   # Implements task X.Y from <change-id>
   ```

2. **Pre-archive checklist**:

   ```bash
   # Before archiving
   - [ ] All tasks in tasks.md marked [x]
   - [ ] All code implemented
   - [ ] All tests passing
   - [ ] Specs validated
   ```

3. **Don't use --yes blindly**:

   ```bash
   # First run without --yes
   openspec archive <change-id>
   # Review warnings
   # Then use --yes if appropriate
   ```

4. **Automate task tracking** (future):
   ```bash
   # Git hook to remind about tasks.md
   # .git/hooks/pre-commit
   if git diff --cached --name-only | grep -q "^components/\|^api/"; then
     echo "Remember to update tasks.md!"
   fi
   ```

---

## Lesson 2: Bug Fixes Don't Require Spec Updates

### Context

**Bug**: Idle cleanup was archiving sessions (violated spec)

**Question**: "Should we update spec, proposal, design, tasks?"

**Answer**: No! The spec was already correct.

### Key Insight

**Spec-Driven Development**:

```
Spec defines: archived = user action only ✅
Code did: archived = idle cleanup too ❌
Fix: Make code match spec ✅
```

**This is the ideal flow**:

1. Spec defines correct behavior
2. Code deviates from spec (bug)
3. Testing discovers deviation
4. Fix code to match spec
5. **No spec update needed**

### When to Update Specs

**Update specs when**:

- ✅ Adding new features
- ✅ Changing behavior intentionally
- ✅ Breaking changes
- ✅ Architecture changes

**Don't update specs when**:

- ❌ Fixing bugs (code → spec)
- ❌ Refactoring (same behavior)
- ❌ Performance improvements (same behavior)
- ❌ Code cleanup

### Value of Specs

This bug demonstrated the value of specs:

1. **Spec defined correct behavior**: "user explicitly archives"
2. **Code violated spec**: idle cleanup archived
3. **Testing caught violation**: manual test discovered it
4. **Spec guided fix**: made code match spec

**Specs are the source of truth** ✅

---

## Lesson 3: Manual Testing Catches Design Violations

### Discovery

**Test 3**: Server restart → suspended

**Discovery**: Previous session became `archived` unexpectedly

**Root Cause**: Idle cleanup was calling `cancelSession()` which archived

### Value of Manual Testing

**Automated tests** (scripts/test-session-status.sh):

- ✅ Verified database state
- ✅ Checked type definitions
- ✅ Validated migrations
- ❌ Didn't catch idle cleanup behavior

**Manual testing** (docs/session-status-test-checklist.md):

- ✅ Followed user workflow
- ✅ Observed unexpected behavior
- ✅ Questioned design consistency
- ✅ **Found the bug**

### Lesson

**Both types of testing are essential**:

- Automated: Fast, repeatable, catches regressions
- Manual: Exploratory, catches design issues, validates UX

**Best practice**:

1. Write automated tests for known scenarios
2. Do manual testing for new features
3. Convert manual test findings to automated tests
4. Keep both in sync

---

## Summary

### Key Takeaways

1. **Tasks.md is a living document**
   - Update as you work, not after
   - Review before archiving
   - Don't bypass warnings blindly

2. **Specs are the source of truth**
   - Bug fixes restore spec compliance
   - Don't update specs for bug fixes
   - Specs guide implementation

3. **Manual testing is valuable**
   - Catches design violations
   - Validates user experience
   - Complements automated tests

### Process Improvements

**Before starting a change**:

- [ ] Read and understand the spec
- [ ] Review tasks.md
- [ ] Plan incremental updates

**During development**:

- [ ] Update tasks.md as you complete tasks
- [ ] Commit tasks.md with code changes
- [ ] Reference task numbers in commits

**Before archiving**:

- [ ] Review tasks.md completion
- [ ] Run all tests (automated + manual)
- [ ] Validate against spec
- [ ] Archive without --yes first

**After archiving**:

- [ ] Verify specs created correctly
- [ ] Check archived change structure
- [ ] Document any lessons learned

---

## References

- OpenSpec Workflow: `openspec/AGENTS.md`
- Task Checklist: `openspec/changes/<change-id>/tasks.md`
- Manual Tests: `docs/session-status-test-checklist.md`
- Automated Tests: `scripts/test-session-status.sh`

---

## Change Log

- 2025-11-01: Initial document created after `add-agent-chat-ui` archive
- Lesson 1: Tasks.md not updated during development
- Lesson 2: Bug fixes don't require spec updates
- Lesson 3: Manual testing catches design violations
