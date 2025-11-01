# Fixes Index

Quick reference for all fixes and improvements. For detailed documentation, see individual files in `fixes/`.

## 📍 For AI Agents

**This is your entry point for fixes!**

**How to use**:

1. **Read this file first** - Get summaries of all fixes (one tool call)
2. **Answer from summary** - Most questions can be answered from entries below
3. **Follow links if needed** - Read detailed docs in `fixes/YYYY-MM-DD-*.md` for deep dives
4. **Use grep to search** - Find specific fixes by keyword

**Example workflow**:

```
User: "How was the last opened feature fixed?"
  ↓
AI: Read this file (one tool call)
  ↓
AI: Find "Last Committed & Branch Display" entry
  ↓
AI: Answer from summary (no additional calls needed!)
```

**Path pattern**: Links like `[fixes/2025-10-26-...md](fixes/2025-10-26-...md)` point to:

```
/Users/tr/Workspace/indie-dev-portal/docs/fixes/2025-10-26-last-committed-branch-display.md
```

This approach minimizes tool calls while maintaining detailed documentation.

---

## 2025-10-26: Last Committed & Branch Display

**File**: [fixes/2025-10-26-last-committed-branch-display.md](fixes/2025-10-26-last-committed-branch-display.md)  
**Status**: ✅ Completed  
**Issue**:

- "Last Opened" was inaccurate (users open projects directly in VS Code)
- Branch name showing repository slug instead of actual branch

**Solution**:

- Changed to "Last Committed" using most recent commit timestamp from git
- Temporary fix: Show "main" for branch name (full branch detection pending)

**Files Modified**:

- `components/dashboard/ProjectCard.tsx` - Display last commit time, show "main" for branch
- `lib/repoActions.ts` - Removed tracking code (not needed)
- `api/repos.ts` - Removed unused endpoint

**Impact**: More accurate activity tracking, simpler implementation

---

## 2025-10-25: Real Git Integration

**File**: [GIT_INTEGRATION_SUMMARY.md](archive/GIT_INTEGRATION_SUMMARY.md)  
**Status**: ✅ Completed  
**Issue**: Dashboard using mock data instead of real repositories

**Solution**:

- Implemented git repository scanning from local filesystem
- Automatic language and framework detection
- CI/CD configuration detection
- Live commit history parsing
- Sync script: `pnpm git:sync`

**Files Created**:

- `lib/gitService.ts` - Git integration service layer
- `scripts/sync-git-repos.ts` - Repository sync script
- `docs/GIT_INTEGRATION.md` - Integration documentation

**Files Modified**:

- `.env.example` - Added git configuration
- `package.json` - Added `git:sync` script
- `QUICKSTART.md` - Added git integration steps

**Impact**: 15 real repositories synced successfully, production-ready

---

## Adding New Fixes

**Template for new entries**:

```markdown
## YYYY-MM-DD: Fix Title

**File**: [fixes/YYYY-MM-DD-description.md](fixes/YYYY-MM-DD-description.md)  
**Status**: ✅ Completed / 🚧 In Progress / ⏳ Planned  
**Issue**: Brief description of the problem

**Solution**: Brief description of the fix

**Files Modified**:

- `file1.ts` - What changed
- `file2.tsx` - What changed

**Impact**: User-facing impact or technical benefit
```

**Steps**:

1. Create detailed doc in `docs/fixes/YYYY-MM-DD-<description>.md`
2. Add summary entry above using this template
3. See `.windsurfrules` for naming standards
