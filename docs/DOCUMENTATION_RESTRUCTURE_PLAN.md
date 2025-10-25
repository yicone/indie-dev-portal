# Documentation Restructure Plan

## 🎯 Goal: Integrate Solutions A + B + C

Combine all three approaches to create a clean, DRY, and navigable documentation structure.

## 📋 Current Problems

1. **Too many root files** (6 markdown files)
2. **40-50% content duplication** (Known Limitations, Features, Next Steps)
3. **No clear entry point** for users/AI agents
4. **Inconsistent naming** (UPPERCASE, kebab-case mixed)
5. **Outdated summary files** (IMPLEMENTATION_SUMMARY, GIT_INTEGRATION_SUMMARY)

## 🏗️ Integrated Solution

### Phase 1: Clean Root Directory (Solution A)

**Target Structure**:

```
/
├── README.md                  # Navigation hub (Solution C)
├── AGENTS.md                  # AI agent collaboration (keep)
├── CHANGELOG.md               # Version history (new)
└── docs/
    ├── README.md              # Documentation index (new)
    ├── QUICKSTART.md          # Moved from root
    ├── ROADMAP.md             # Unified Next Steps (new)
    ├── FUNCTIONAL_SPEC.md     # SSOT for features (Solution B)
    ├── GIT_INTEGRATION.md     # SSOT for git features (Solution B)
    ├── FIXES_INDEX.md         # Keep
    ├── NAMING_CONVENTIONS.md  # Keep
    ├── fixes/                 # Keep
    │   └── 2025-10-26-*.md
    └── archive/               # Deprecated docs
        ├── PROJECT_STATUS.md
        ├── IMPLEMENTATION_SUMMARY.md
        └── GIT_INTEGRATION_SUMMARY.md
```

**Actions**:

```bash
# Move files
mv QUICKSTART.md docs/
mv PROJECT_STATUS.md docs/archive/
mv IMPLEMENTATION_SUMMARY.md docs/archive/
mv GIT_INTEGRATION_SUMMARY.md docs/archive/

# Create new files
touch docs/README.md
touch docs/ROADMAP.md
touch CHANGELOG.md
```

### Phase 2: Establish Single Source of Truth (Solution B)

**Information Ownership**:

| Information Type | Authority (SSOT) | References From |
|------------------|------------------|-----------------|
| **Features List** | `docs/FUNCTIONAL_SPEC.md` | README (highlights only) |
| **Known Limitations** | `docs/ROADMAP.md` | All other files reference this |
| **Next Steps / Roadmap** | `docs/ROADMAP.md` | All other files reference this |
| **Quick Start** | `docs/QUICKSTART.md` | README (short version + link) |
| **Git Integration** | `docs/GIT_INTEGRATION.md` | README (overview + link) |
| **Fixes** | `docs/FIXES_INDEX.md` | README (link only) |
| **Project Status** | `CHANGELOG.md` + `docs/ROADMAP.md` | README (summary + links) |

**Deduplication Actions**:

1. **Consolidate "Known Limitations"**:
   - Create comprehensive list in `docs/ROADMAP.md`
   - Remove from: README, FUNCTIONAL_SPEC, GIT_INTEGRATION
   - Replace with: "See [Known Limitations](docs/ROADMAP.md#known-limitations)"

2. **Consolidate "Next Steps"**:
   - Merge all "Next Steps" sections into `docs/ROADMAP.md`
   - Organize by: Short-term (1-3 months), Mid-term (3-6 months), Long-term (6+ months)
   - Remove from all other files

3. **Consolidate "Features"**:
   - `docs/FUNCTIONAL_SPEC.md` = Complete detailed list
   - `README.md` = Top 5-7 highlights + link
   - Remove from: PROJECT_STATUS (archived), GIT_INTEGRATION_SUMMARY (archived)

### Phase 3: Transform README into Navigation Hub (Solution C)

**New README.md Structure**:

```markdown
# Personal Developer Dashboard

[Brief 2-3 sentence description]

## ✨ Highlights

- 🔍 Real Git Integration - Automatic repository discovery
- 📊 Smart Dashboard - Search, filter, sort your projects
- 🎯 Quick Actions - Open in VS Code, view diffs, add notes
- 🎨 Modern UI - Light/Dark themes with smooth animations

[See complete feature list →](docs/FUNCTIONAL_SPEC.md)

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure git scanning
cp .env.example .env
# Edit .env: Set GIT_SCAN_PATHS

# 3. Sync repositories
pnpm git:sync

# 4. Start development
pnpm dev
```

[Detailed setup guide →](docs/QUICKSTART.md)

## 📚 Documentation

### For Users

- [Quick Start Guide](docs/QUICKSTART.md) - Get running in 5 minutes
- [Feature Documentation](docs/FUNCTIONAL_SPEC.md) - Complete feature list
- [Git Integration Guide](docs/GIT_INTEGRATION.md) - How repository scanning works

### For Developers

- [Agent Collaboration](AGENTS.md) - AI agent workflow and documentation standards
- [Roadmap & Limitations](docs/ROADMAP.md) - Future plans and current limitations
- [Changelog](CHANGELOG.md) - Version history

### For Contributors

- [Documentation Index](docs/README.md) - All documentation files
- [Naming Conventions](docs/NAMING_CONVENTIONS.md) - Documentation standards
- [Fixes Index](docs/FIXES_INDEX.md) - Bug fixes and improvements

## 🔗 Quick Links

- [Report a Bug](https://github.com/username/repo/issues)
- [Request a Feature](https://github.com/username/repo/issues)
- [View Roadmap](docs/ROADMAP.md)

## 📄 License

MIT

```

## 🚨 Potential Conflicts & Solutions

### Conflict 1: File Movement Breaking Links

**Problem**: Moving files will break existing links in other documents.

**Solution**:
```bash
# After moving files, update all references
grep -r "QUICKSTART.md" . --include="*.md" | grep -v "node_modules"
# Manually update each reference from QUICKSTART.md to docs/QUICKSTART.md
```

**Prevention**: Use relative links consistently:

- From root: `docs/QUICKSTART.md`
- From docs/: `QUICKSTART.md` or `./QUICKSTART.md`

### Conflict 2: SSOT vs. User Convenience

**Problem**: Users might want quick answers without clicking through links.

**Solution**: **Balanced Approach**

- README: Brief highlights + links (not just links)
- Authority docs: Complete information
- Example:

  ```markdown
  ## Known Limitations
  
  - No real-time updates (requires manual `pnpm git:sync`)
  - Local repositories only (no GitHub/GitLab integration yet)
  
  [See complete list and workarounds →](docs/ROADMAP.md#known-limitations)
  ```

### Conflict 3: Documentation Index vs. Navigation Hub

**Problem**: Both `README.md` and `docs/README.md` could be confusing.

**Solution**: **Clear Differentiation**

- `/README.md` = Project introduction + navigation (for users)
- `/docs/README.md` = Documentation index (for contributors/AI agents)

**docs/README.md** content:

```markdown
# Documentation Index

Complete list of all documentation files with descriptions.

## Entry Points

- **For Users**: Start with [QUICKSTART.md](QUICKSTART.md)
- **For AI Agents**: Start with [FIXES_INDEX.md](FIXES_INDEX.md)
- **For Contributors**: Start with [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md)

## All Documentation Files

[Organized list with descriptions...]
```

### Conflict 4: Archive vs. Delete

**Problem**: Should we delete or archive outdated files?

**Solution**: **Archive with Deprecation Notice**

Add to top of archived files:

```markdown
> **⚠️ DEPRECATED**: This document has been archived.
> 
> - For project status, see [CHANGELOG.md](../../CHANGELOG.md) and [ROADMAP.md](../ROADMAP.md)
> - For git integration, see [GIT_INTEGRATION.md](../GIT_INTEGRATION.md)
> 
> This file is kept for historical reference only.
```

### Conflict 5: Maintaining SSOT Over Time

**Problem**: How to prevent future duplication?

**Solution**: **Documentation Checklist in AGENTS.md**

Add to AGENTS.md:

```markdown
### Before Adding Documentation

- [ ] Check if information already exists (use grep)
- [ ] If exists, link to it instead of duplicating
- [ ] If new, determine which file is the authority
- [ ] Update cross-references in related files
- [ ] Follow SSOT principle (see NAMING_CONVENTIONS.md)
```

## 📊 Before & After Comparison

### Root Directory Files

| Before | After | Change |
|--------|-------|--------|
| 6 files | 3 files | -50% |
| 32.4 KB total | ~15 KB total | -54% |

### Content Duplication

| Content Type | Before | After | Reduction |
|--------------|--------|-------|-----------|
| Known Limitations | 6 copies | 1 authority + references | -83% |
| Features List | 4 copies | 1 authority + highlights | -75% |
| Next Steps | 4 copies | 1 unified roadmap | -75% |
| Quick Start | 3 copies | 1 detailed + 1 brief | -67% |

### User Experience

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Time to find info | ~3 mins | ~30 secs | 6x faster |
| Files to check | 3-4 files | 1-2 files | 50% fewer |
| Broken links | High risk | Low risk | Systematic |
| Maintenance effort | High | Low | 60% reduction |

## ✅ Implementation Checklist

### Phase 1: Structure (Day 1)

- [ ] Create `docs/archive/` directory
- [ ] Create `docs/guides/` directory (future)
- [ ] Move `QUICKSTART.md` to `docs/`
- [ ] Move outdated files to `docs/archive/`
- [ ] Add deprecation notices to archived files
- [ ] Create `docs/README.md`
- [ ] Create `docs/ROADMAP.md`
- [ ] Create `CHANGELOG.md`

### Phase 2: Consolidation (Day 2)

- [ ] Merge all "Known Limitations" into `docs/ROADMAP.md`
- [ ] Merge all "Next Steps" into `docs/ROADMAP.md`
- [ ] Update `docs/FUNCTIONAL_SPEC.md` as feature authority
- [ ] Remove duplicated content from other files
- [ ] Add cross-references

### Phase 3: Navigation (Day 3)

- [ ] Rewrite `README.md` as navigation hub
- [ ] Add "See X for details" links throughout
- [ ] Update all file references (grep for broken links)
- [ ] Test all links manually
- [ ] Update `AGENTS.md` with new structure

### Phase 4: Validation (Day 4)

- [ ] Run link checker
- [ ] Verify no broken references
- [ ] Check all cross-references work
- [ ] Test AI agent retrieval pattern
- [ ] Get team review

## 🎯 Success Criteria

1. ✅ Root directory has ≤3 markdown files
2. ✅ Content duplication <10%
3. ✅ All links work correctly
4. ✅ Clear entry points for users/developers/AI
5. ✅ SSOT principle enforced
6. ✅ Documentation follows naming conventions
7. ✅ Easy to maintain (single update point)

## 📝 Notes

- Keep this plan updated as we implement
- Document any deviations from the plan
- Track time spent for future reference
- Collect feedback from team/users

---

**Status**: 📋 Planning Complete - Ready for Implementation  
**Estimated Time**: 4 days  
**Risk Level**: Low (can rollback via git)
