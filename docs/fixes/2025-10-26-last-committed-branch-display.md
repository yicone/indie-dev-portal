# Fixes Summary - Last Committed & Branch Name Issues

## Issues Identified

### 1. Showing "Last Committed" Instead of "Last Opened"

**Problem**: The original implementation showed "Last Opened" which was inaccurate since developers typically open projects directly in VS Code, not through the dashboard.

**Root Cause**: Tracking "Last Opened" via dashboard clicks doesn't reflect actual usage patterns.

**Solution Implemented**:

Changed the UI to display **"Last Committed"** using the most recent commit timestamp from git data.

1. **Updated UI** (`components/dashboard/ProjectCard.tsx`):
   - Changed icon from `Calendar` to `GitCommit`
   - Display `repo.commits[0]?.committedAt` (most recent commit)
   - Use `formatRelativeTime()` for human-readable format (e.g., "2 hours ago")
   - Show "No commits" if repository has no commits

**Benefits**:

- ✅ **Accurate**: Reflects actual development activity
- ✅ **No tracking needed**: Data comes directly from git
- ✅ **Auto-updates**: Refreshes when you run `pnpm git:sync`
- ✅ **Meaningful**: Shows when work was last done, not when dashboard was clicked

**How It Works Now**:

- Dashboard shows when the last commit was made (e.g., "3 hours ago", "2 days ago")
- Automatically updates when you sync repositories
- Sorting by commit date works correctly

### 2. Branch Name Shows Repo Name Instead

**Problem**: The commit list shows the repository slug (e.g., "tastetrip-supplier-images-uploader") instead of the actual git branch name (e.g., "main", "develop").

**Root Cause**:

- The git service doesn't extract branch information
- The UI was incorrectly displaying `commit.repoSlug` instead of branch name
- Commit data doesn't include branch information

**Temporary Fix Applied**:

- Changed line 180 in `ProjectCard.tsx` to show hardcoded "main"
- This is a placeholder until proper branch detection is implemented

**Proper Solution (Not Yet Implemented)**:

To fully fix this, we need to:

1. **Update Git Service** (`lib/gitService.ts`):

   ```typescript
   // Add to parseGitRepo function
   const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
   ```

2. **Update Prisma Schema** (`prisma/schema.prisma`):

   ```prisma
   model Repo {
     // ... existing fields
     currentBranch String?
   }
   
   model Commit {
     // ... existing fields
     branch String?
   }
   ```

3. **Run Migration**:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

4. **Update Types** (`types/git.ts`):

   ```typescript
   export type Repo = {
     // ... existing fields
     currentBranch: string | null;
   };
   
   export type Commit = {
     // ... existing fields
     branch: string | null;
   };
   ```

5. **Update UI** (`components/dashboard/ProjectCard.tsx`):

   ```typescript
   <GitBranch className="h-3 w-3" /> {repo.currentBranch || 'main'}
   ```

## Testing

### Test Last Opened Tracking

1. Start the dev server: `pnpm dev`
2. Open the dashboard at `http://localhost:3000`
3. Click the "VS Code" button on any repository
4. Refresh the page
5. The "Last opened" should now show the current time instead of "Never"

### Verify Branch Name Fix

1. Check the commit list in any repository card
2. Should now show "main" instead of the repo slug
3. For proper branch names, implement the full solution above

## Files Modified

### Last Committed Display

- `components/dashboard/ProjectCard.tsx` - Changed to show last commit time instead of last opened

### Branch Name Display

- `components/dashboard/ProjectCard.tsx` - Changed to show "main" (temporary fix)

## Known Limitations

1. **Last Committed Display**:
   - Shows relative time (e.g., "2 hours ago") which updates only on page refresh
   - Requires `pnpm git:sync` to pick up new commits
   - Shows "No commits" for repositories without any commits

2. **Branch Name Display**:
   - Currently shows hardcoded "main" for all repos
   - Doesn't detect actual current branch
   - Doesn't track which branch each commit belongs to

## Future Enhancements

### Last Committed

- [ ] Real-time commit detection via git hooks
- [ ] Show commit frequency metrics
- [ ] Highlight repositories with recent activity
- [ ] Filter by commit recency (e.g., "active this week")

### Branch Detection

- [ ] Detect current branch from git
- [ ] Show branch name per commit
- [ ] Track all branches in repository
- [ ] Show branch switcher in UI
- [ ] Highlight commits from different branches

## Migration Notes

If you already have repositories in the database:

1. **Last Opened**: No migration needed. Field already exists in schema, just wasn't being updated.
2. **Branch Detection**: Will require schema changes and migration (see Proper Solution above).

## Related Documentation

- [Git Integration Guide](GIT_INTEGRATION.md) - How git scanning works
- [Functional Spec](FUNCTIONAL_SPEC.md) - Complete feature documentation
- [API Documentation](../api/repos.ts) - API endpoint details
