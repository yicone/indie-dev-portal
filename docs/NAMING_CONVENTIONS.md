# Documentation Naming Conventions

## Quick Navigation for AI Agents

**📍 Entry Points (Start Here)**:

- `docs/FIXES_INDEX.md` → Quick reference, links to `docs/fixes/YYYY-MM-DD-*.md`
- `README.md` → Project overview
- `AGENTS.md` → Agent collaboration guide
- `docs/NAMING_CONVENTIONS.md` → This file (documentation standards)

**Path Structure**:

```
docs/
├── FIXES_INDEX.md              # Read this first for fixes
├── NAMING_CONVENTIONS.md       # This file
├── GIT_INTEGRATION.md          # Feature docs
├── FUNCTIONAL_SPEC.md          # Specifications
└── fixes/                      # Detailed fix docs (linked from index)
    ├── 2025-10-26-last-committed-branch-display.md
    └── YYYY-MM-DD-<description>.md
```

---

## Fix/Issue Documentation

We use a **hybrid approach** optimized for AI agents:

1. **Index file** (`docs/FIXES_INDEX.md`) - Quick reference with summaries
2. **Individual files** (`docs/fixes/YYYY-MM-DD-*.md`) - Detailed documentation

**Why hybrid?**

- AI reads index first (one tool call, gets all summaries)
- Follows links to details only if needed
- Index stays small, detailed docs separate
- Better than single log (grows too large) or files only (requires directory listing)

### Pattern

```
docs/fixes/<issue-date>-<brief-description>.md
```

Each fix gets:

- Detailed file in `docs/fixes/`
- Summary entry in `docs/FIXES_INDEX.md`

### Examples

**Good Names**:

- `docs/fixes/2025-10-25-last-committed-branch-display.md` - Specific date and issue
- `docs/fixes/ui-performance-improvements.md` - Clear topic
- `docs/fixes/git-sync-error-handling.md` - Specific feature area
- `docs/API_MIGRATION_V2.md` - Major change documentation
- `docs/BREAKING_CHANGES.md` - Important updates

**Avoid**:

- `docs/FIXES_SUMMARY.md` - Too generic, will conflict with future fixes
- `docs/fix1.md`, `docs/fix2.md` - Not descriptive
- `docs/temp.md` - Unclear purpose

### Recommended Structure

```
docs/
├── README.md                           # Documentation index
├── GIT_INTEGRATION.md                  # Feature documentation
├── FUNCTIONAL_SPEC.md                  # Specifications
├── NAMING_CONVENTIONS.md               # This file
├── FIXES_INDEX.md                      # Quick reference index (AI-friendly)
└── fixes/                              # Individual fix documentation
    ├── 2025-10-25-last-committed.md
    ├── 2025-10-26-branch-detection.md
    └── 2025-10-27-performance.md
```

**FIXES_INDEX.md** entry format:

```markdown
## YYYY-MM-DD: Fix Title

**File**: [fixes/YYYY-MM-DD-description.md](fixes/YYYY-MM-DD-description.md)  
**Status**: ✅ Completed / 🚧 In Progress / ⏳ Planned
**Issue**: Brief description  
**Solution**: Brief solution  
**Files Modified**: List of files
**Impact**: User-facing impact
```

See `docs/FIXES_INDEX.md` for complete examples and AI agent usage guide.

## Other Documentation Types

### Feature Documentation

```
docs/<FEATURE_NAME>.md
```

Examples:

- `docs/GIT_INTEGRATION.md`
- `docs/THEME_SYSTEM.md`
- `docs/SEARCH_FILTERS.md`

### Architecture Documentation

```
docs/architecture/<COMPONENT>.md
```

Examples:

- `docs/architecture/DATABASE_SCHEMA.md`
- `docs/architecture/API_DESIGN.md`
- `docs/architecture/COMPONENT_STRUCTURE.md`

### Guides

```
docs/guides/<GUIDE_NAME>.md
```

Examples:

- `docs/guides/DEPLOYMENT.md`
- `docs/guides/CONTRIBUTING.md`
- `docs/guides/TESTING.md`

### API Documentation

```
docs/api/<ENDPOINT_GROUP>.md
```

Examples:

- `docs/api/REPOS.md`
- `docs/api/COMMITS.md`
- `docs/api/AUTHENTICATION.md`

## File Naming Rules

1. **Use UPPERCASE for major docs**: `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`
2. **Use descriptive names**: Avoid generic names like `doc1.md`, `notes.md`
3. **Use hyphens for multi-word**: `git-integration.md` not `git_integration.md`
4. **Include dates for time-sensitive docs**: `2025-10-25-migration.md`
5. **Group related docs in folders**: `docs/fixes/`, `docs/guides/`, `docs/api/`

## Version-Specific Documentation

For version-specific changes:

```
docs/versions/
├── v1.0.0-RELEASE_NOTES.md
├── v1.1.0-RELEASE_NOTES.md
└── v2.0.0-BREAKING_CHANGES.md
```

## Deprecation

When documentation becomes outdated:

1. **Move to archive**:

   ```
   docs/archive/2025-10-25-old-git-integration.md
   ```

2. **Add deprecation notice** at the top:

   ```markdown
   > **⚠️ DEPRECATED**: This document is outdated. See [NEW_DOC.md](NEW_DOC.md) instead.
   ```

3. **Update references** in other documents

## Summary

### For Future Fixes

1. Create detailed doc: `docs/fixes/YYYY-MM-DD-<description>.md`
2. Add summary entry to `docs/FIXES_INDEX.md` (see template there)
3. Follow the pattern in existing fixes

## Quick Reference

| Type         | Pattern                       | Example                              |
| ------------ | ----------------------------- | ------------------------------------ |
| Fix (dated)  | `fixes/YYYY-MM-DD-<desc>.md`  | `fixes/2025-10-26-last-committed.md` |
| Feature      | `<FEATURE>.md`                | `GIT_INTEGRATION.md`                 |
| Guide        | `guides/<GUIDE>.md`           | `guides/DEPLOYMENT.md`               |
| API          | `api/<ENDPOINT>.md`           | `api/REPOS.md`                       |
| Architecture | `architecture/<COMPONENT>.md` | `architecture/DATABASE.md`           |
| Version      | `versions/v<X.Y.Z>-<TYPE>.md` | `versions/v2.0.0-BREAKING.md`        |
