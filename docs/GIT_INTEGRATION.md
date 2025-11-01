# Git Integration Guide

## Overview

The Personal Developer Dashboard now supports **real git integration**, automatically scanning your local filesystem for git repositories and extracting metadata, commits, and project information.

## Features

### Automatic Repository Discovery

- **Recursive Scanning**: Scans configured directories for git repositories
- **Configurable Depth**: Control how deep to search (default: 2 levels)
- **Smart Filtering**: Skips `node_modules`, hidden directories, and non-git folders

### Metadata Extraction

#### Language Detection

- Analyzes file extensions across the repository
- Counts occurrences to determine primary language
- Supports: TypeScript, JavaScript, Python, Go, Rust, Java, Ruby, PHP, Swift, Kotlin

#### Framework Detection

- Scans for configuration files (e.g., `next.config.js`, `package.json`)
- Parses `package.json` dependencies
- Detects: Next.js, React, Vue, Angular, Express, NestJS, Prisma, Tailwind, and more

#### CI/CD Status

- Checks for CI configuration files
- Detects: GitHub Actions, GitLab CI, CircleCI, Travis CI, Jenkins
- Status: `passing`, `failing`, `pending`, or `none`

#### Description

- Extracts from `package.json` description field
- Falls back to first meaningful line in README
- Provides context for each repository

### Commit History

- Parses git log using `simple-git`
- Extracts: hash, message, author, date
- Configurable commit limit (default: 10 per repo)
- Handles repositories without commits gracefully

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Comma-separated paths to scan for git repositories
GIT_SCAN_PATHS="/Users/username/Projects,/Users/username/Workspace"

# Maximum directory depth to scan (default: 2)
GIT_SCAN_DEPTH=2
```

### Example Configuration

```bash
# Single path
GIT_SCAN_PATHS="/Users/john/Projects"

# Multiple paths
GIT_SCAN_PATHS="/Users/john/Projects,/Users/john/Work,/Users/john/OpenSource"

# Deeper scanning (may be slower)
GIT_SCAN_DEPTH=3
```

## Usage

### Initial Sync

Scan your filesystem and populate the database:

```bash
pnpm git:sync
```

Output example:

```
🔍 Scanning for git repositories...

📂 Scan paths: /Users/username/Projects
📊 Max depth: 2

✅ Found 15 git repositories

  + Created: my-awesome-app
  + Created: another-project
  ...

📈 Summary:
   Created: 15
   Updated: 0
   Total: 15
```

### Re-sync (Update)

Run the same command to update existing repositories:

```bash
pnpm git:sync
```

**Behavior**:

- **New repos**: Created in database
- **Existing repos**: Metadata updated, commits refreshed
- **Preserved data**: Notes and `lastOpenedAt` are kept

### Automatic Sync (Optional)

Add to your workflow:

```bash
# Add to package.json scripts
"dev": "pnpm git:sync && concurrently \"pnpm dev:web\" \"pnpm dev:server\""
```

Or create a cron job:

```bash
# Sync every hour
0 * * * * cd /path/to/indie-dev-portal && pnpm git:sync
```

## How It Works

### 1. Repository Scanning

```typescript
scanForRepos(basePath, maxDepth)
  ↓
  Recursively search directories
  ↓
  Check if directory is a git repo (has .git)
  ↓
  Return list of repo paths
```

### 2. Metadata Extraction

```typescript
parseGitRepo(repoPath)
  ↓
  ├─ detectPrimaryLanguage() → Count file extensions
  ├─ detectFrameworks() → Check config files
  ├─ detectCIStatus() → Look for CI configs
  ├─ getRepoDescription() → Parse package.json/README
  └─ getCommits() → Parse git log
  ↓
  Return GitRepoInfo
```

### 3. Database Sync

```typescript
syncRepos()
  ↓
  Scan all configured paths
  ↓
  Parse each repository
  ↓
  For each repo:
    ├─ Exists? → Update metadata, refresh commits
    └─ New? → Create repo with commits
  ↓
  Report summary
```

## API Integration

The git integration works seamlessly with the existing API:

- `GET /repos` - Returns all synced repositories
- `GET /repos/:slug` - Returns single repository
- `GET /commits?repoSlug=X` - Returns commits for repo
- `PATCH /repos/:slug/notes` - Update notes (preserved during sync)

No API changes required! The frontend automatically displays real git data.

## Performance

### Optimization Tips

1. **Limit Scan Depth**: Use `GIT_SCAN_DEPTH=1` for faster scans
2. **Specific Paths**: Only scan directories with git repos
3. **Exclude Large Directories**: Avoid scanning entire home directory
4. **Periodic Sync**: Run sync manually or on a schedule, not on every request

### Benchmarks

- **15 repositories**: ~3-5 seconds
- **50 repositories**: ~10-15 seconds
- **100+ repositories**: ~30-60 seconds

Times vary based on repository size and commit history.

## Troubleshooting

### No Repositories Found

```bash
❌ No scan paths configured!
   Set GIT_SCAN_PATHS in your .env file
```

**Solution**: Add `GIT_SCAN_PATHS` to `.env`

### Permission Errors

```
Failed to scan /path/to/dir: EACCES: permission denied
```

**Solution**: Ensure read permissions on scan paths

### Empty Commits

```
Failed to get commits: GitError: fatal: your current branch 'main' does not have any commits yet
```

**Solution**: This is normal for new repos. The repo is still synced, just without commits.

### Slow Scanning

**Solutions**:

- Reduce `GIT_SCAN_DEPTH`
- Scan fewer/smaller directories
- Exclude large monorepos

## Migration from Mock Data

### Option 1: Keep Mock Data

Mock data and real git data coexist in the database. No action needed.

### Option 2: Clean Start

```bash
# Clear database
rm dev.db

# Recreate and sync
pnpm db:migrate
pnpm git:sync
```

### Option 3: Remove Mock Data

```bash
# In Prisma Studio or SQL
DELETE FROM Repo WHERE slug IN ('alpha', 'beta', 'gamma', 'delta', 'epsilon');
```

## Advanced Usage

### Custom Sync Script

Create your own sync logic:

```typescript
import { scanAndParseRepos } from './lib/gitService';

const repos = await scanAndParseRepos(['/path/to/projects'], 2);

// Filter, transform, or process repos
const filtered = repos.filter((r) => r.primaryLanguage === 'TypeScript');

// Sync to database
// ... your logic
```

### Programmatic Access

```typescript
import { isGitRepo, parseGitRepo } from './lib/gitService';

// Check if directory is a git repo
const isRepo = await isGitRepo('/path/to/dir');

// Parse a single repo
const repoInfo = await parseGitRepo('/path/to/repo');
```

## Future Enhancements

- [ ] Watch filesystem for new repositories
- [ ] Real-time commit updates via git hooks
- [ ] Branch detection and management
- [ ] Remote repository info (GitHub/GitLab)
- [ ] Repository health metrics
- [ ] Dependency analysis
- [ ] Code statistics (lines of code, contributors)

## See Also

- `lib/gitService.ts` - Git integration implementation
- `scripts/sync-git-repos.ts` - Sync script
- `openspec/project.md` - Project conventions and tech stack
