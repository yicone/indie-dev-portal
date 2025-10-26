# Documentation Management Guide

> **For AI Agents**: This is the authoritative guide for the `[documentation-agent]`. Follow these rules and workflows when managing project documentation.

## 📋 Table of Contents

- [Core Principles](#core-principles)
- [Documentation Structure](#documentation-structure)
- [Single Source of Truth (SSOT)](#single-source-of-truth-ssot)
- [Documentation Workflow](#documentation-workflow)
- [File Naming Conventions](#file-naming-conventions)
- [Content Guidelines](#content-guidelines)
- [AI Agent Retrieval Optimization](#ai-agent-retrieval-optimization)
- [Maintenance Procedures](#maintenance-procedures)
- [Quality Checklist](#quality-checklist)

---

## Core Principles

### 1. Single Source of Truth (SSOT)

**Rule**: Every piece of information should have ONE authoritative source.

**Implementation**:

- Identify the most appropriate document for each type of information
- Other documents may summarize but MUST link to the authority
- Never duplicate detailed content across multiple files

**Example**:

```markdown
<!-- ❌ BAD: Duplicating content -->

README.md: Full list of 10 known limitations
FUNCTIONAL_SPEC.md: Same full list of 10 known limitations
ROADMAP.md: Same full list of 10 known limitations

<!-- ✅ GOOD: SSOT with references -->

ROADMAP.md: Full list of 10 known limitations (AUTHORITY)
README.md: 3 key limitations + link to ROADMAP.md
FUNCTIONAL_SPEC.md: Brief mention + link to ROADMAP.md
```

### 2. Hybrid Approach (Index + Detail)

**Rule**: Use index files for quick overview, detailed files for depth.

**Structure**:

```
docs/
├── FIXES_INDEX.md          # Quick summaries (1 tool call)
└── fixes/                  # Detailed docs (on-demand)
    └── YYYY-MM-DD-*.md
```

**Benefits**:

- AI agents: 1-2 tool calls instead of 5+
- Humans: Quick scan + deep dive option
- Scalability: Index stays small, details grow separately

### 3. Audience-Oriented Organization

**Rule**: Organize documentation by user type, not by technical structure.

**Categories**:

- **For Users**: Getting started, features, troubleshooting
- **For Developers**: Architecture, APIs, workflows
- **For Contributors**: Standards, conventions, processes

### 4. Progressive Disclosure

**Rule**: Show brief summaries first, provide links for details.

**Pattern**:

```markdown
## Section Title

Brief 1-3 sentence summary of key points.

[See complete guide →](path/to/detailed-doc.md)
```

---

## Documentation Structure

### Required Files (Root)

```
/
├── README.md              # Navigation hub (100-200 lines max)
├── CHANGELOG.md           # Version history (authority)
├── AGENTS.md              # AI agent collaboration guide
└── LICENSE                # Project license
```

### Required Files (docs/)

```
docs/
├── README.md              # Documentation index
├── QUICKSTART.md          # Getting started guide
├── FUNCTIONAL_SPEC.md     # Feature documentation (authority)
├── ROADMAP.md             # Future plans + limitations (authority)
├── NAMING_CONVENTIONS.md  # Documentation standards
├── FIXES_INDEX.md         # Bug fixes index
├── DOCUMENTATION_MANAGEMENT.md  # This file
└── fixes/                 # Detailed fix documentation
    └── YYYY-MM-DD-*.md
```

### Optional Directories

```
docs/
├── guides/                # Tutorial-style guides
├── api/                   # API documentation
├── architecture/          # System design docs
└── archive/               # Deprecated documents
```

---

## Single Source of Truth (SSOT)

### Authority Mapping

| Information Type      | Authority Document                        | Reference Documents           |
| --------------------- | ----------------------------------------- | ----------------------------- |
| **Known Limitations** | `docs/ROADMAP.md`                         | README.md, FUNCTIONAL_SPEC.md |
| **Future Roadmap**    | `docs/ROADMAP.md`                         | README.md, FUNCTIONAL_SPEC.md |
| **Features**          | `docs/FUNCTIONAL_SPEC.md`                 | README.md (highlights only)   |
| **Version History**   | `CHANGELOG.md`                            | README.md, docs/README.md     |
| **Quick Start**       | `docs/QUICKSTART.md`                      | README.md (condensed)         |
| **Bug Fixes**         | `docs/FIXES_INDEX.md` → `docs/fixes/*.md` | README.md (if major)          |
| **Naming Standards**  | `docs/NAMING_CONVENTIONS.md`              | AGENTS.md (reference)         |

### Reference Pattern

When referencing authority documents:

```markdown
<!-- Brief summary (2-3 key points) -->

- Point 1
- Point 2
- Point 3

[See complete [topic] →](path/to/authority.md)
```

**Rules**:

- Use arrow (→) to indicate "see more"
- Use descriptive link text (not "click here")
- Keep summaries to 3-5 items maximum
- Always provide context before the link

---

## Documentation Workflow

### When Creating New Documentation

1. **Determine Document Type**:
   - Is this a new authority document?
   - Is this a reference/summary?
   - Is this a detailed guide?

2. **Check for Existing Content**:

   ```bash
   # Search for related content
   grep -r "topic keyword" docs/
   ```

3. **Follow Naming Convention**:
   - See `docs/NAMING_CONVENTIONS.md`
   - Use consistent prefixes and dates

4. **Create Document**:
   - Use appropriate template (see Templates section)
   - Include frontmatter if needed
   - Add to relevant index

5. **Update References**:
   - Add to `docs/README.md` index
   - Update related documents with links
   - Update `AGENTS.md` if workflow changes

### When Updating Existing Documentation

1. **Identify Document Type**:
   - Authority document? Update directly
   - Reference document? Check if summary needs update
   - Both? Update authority first, then references

2. **Update Authority Document**:

   ```markdown
   <!-- Update the authoritative source -->

   docs/ROADMAP.md: Add new limitation
   ```

3. **Update References** (if needed):

   ```markdown
   <!-- Only if the change is significant -->

   README.md: Update summary if it affects top 3 items
   ```

4. **Verify Links**:

   ```bash
   # Check for broken links
   grep -r "\[.*\](.*)" docs/ | grep "broken-link"
   ```

### When Deprecating Documentation

1. **Move to Archive**:

   ```bash
   mv docs/OLD_DOC.md docs/archive/
   ```

2. **Add Deprecation Notice**:

   ```markdown
   # Document Title

   > **⚠️ DEPRECATED**: This document has been archived as of YYYY-MM-DD.
   >
   > **Current Information**:
   >
   > - For [topic A], see [NEW_DOC_A.md](../NEW_DOC_A.md)
   > - For [topic B], see [NEW_DOC_B.md](../NEW_DOC_B.md)
   >
   > This file is kept for historical reference only.

   ---

   [Original content below...]
   ```

3. **Update All References**:
   - Remove from active indexes
   - Update links in other documents
   - Add note in CHANGELOG.md

---

## File Naming Conventions

### General Rules

- Use `SCREAMING_SNAKE_CASE.md` for root-level docs
- Use `kebab-case.md` for docs/ subdirectories
- Use dates for temporal documents: `YYYY-MM-DD-description.md`

### Examples

```
# Root level
README.md
CHANGELOG.md
AGENTS.md
LICENSE

# docs/ level
docs/QUICKSTART.md
docs/FUNCTIONAL_SPEC.md
docs/ROADMAP.md
docs/NAMING_CONVENTIONS.md

# docs/fixes/ level
docs/fixes/2025-10-26-last-committed-branch-display.md
docs/fixes/2025-10-27-search-performance-optimization.md

# docs/guides/ level
docs/guides/git-integration-setup.md
docs/guides/theme-customization.md
```

### Special Files

- `README.md`: Always uppercase, used for indexes
- `CHANGELOG.md`: Always uppercase, version history
- `LICENSE`: No extension, project license
- `AGENTS.md`: Always uppercase, AI agent guide

---

## Content Guidelines

### README.md (Navigation Hub)

**Purpose**: Quick overview + navigation to detailed docs

**Structure**:

```markdown
# Project Title

Brief 1-2 sentence description.

## Highlights (5-7 key points)

## Quick Start (5-10 commands)

## Documentation

### For Users

### For Developers

### For Contributors

## Tech Stack (1-3 lines)

## Key Commands (4-6 commands)

## Configuration (3-5 key variables)

## How It Works (3-5 steps)

## Troubleshooting (3-5 common issues)

## Known Limitations (3-5 key items + link)

## Roadmap (brief timeline + link)

## Contributing

## License
```

**Length**: 100-200 lines maximum

**Rules**:

- Every section should have a "See more →" link
- No detailed content (move to docs/)
- Use bullet points, not paragraphs
- Keep code examples minimal

### CHANGELOG.md (Version History)

**Purpose**: Track all notable changes

**Format**: Follow [Keep a Changelog](https://keepachangelog.com/)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [1.0.0] - YYYY-MM-DD

### Added

- Feature A
- Feature B
```

### docs/ROADMAP.md (Future Plans)

**Purpose**: Authority for limitations and future plans

**Structure**:

```markdown
# Roadmap & Known Limitations

## Known Limitations

### Current Constraints

1. **Limitation 1**: Description + workaround
2. **Limitation 2**: Description + workaround

## Roadmap

### Short-term (1-3 months)

### Mid-term (3-6 months)

### Long-term (6+ months)

## Priority Matrix

## Version Planning
```

### docs/FIXES_INDEX.md (Bug Fixes)

**Purpose**: Quick index of all fixes

**Structure**:

```markdown
# Fixes Index

Quick reference for all bug fixes and improvements.

## Recent Fixes

### [Fix Title](fixes/YYYY-MM-DD-description.md)

**Date**: YYYY-MM-DD  
**Impact**: High/Medium/Low  
**Summary**: 1-2 sentence description

[Read detailed fix →](fixes/YYYY-MM-DD-description.md)
```

---

## AI Agent Retrieval Optimization

### Entry Points

**Always document these in key files**:

```markdown
**📍 Entry Points (Always Start Here)**:

- `docs/FIXES_INDEX.md` → Links to detailed fixes
- `README.md` → Project overview and quick start
- `AGENTS.md` → Agent collaboration guide
- `docs/NAMING_CONVENTIONS.md` → Documentation standards
```

### Retrieval Pattern

```
User asks about [topic]
    ↓
1. Read index file (1 tool call)
    ↓
2. Find relevant entry with link
    ↓
3. Answer from summary OR
    ↓
4. Follow link to detailed doc (1 more tool call)
```

**Total**: 1-2 tool calls (vs 5+ without optimization)

### Optimization Rules

1. **Index files should be < 200 lines**
2. **Summaries should be 1-3 sentences**
3. **Links should be descriptive**
4. **Use consistent heading structure**
5. **Include "See more →" pattern**

---

## Maintenance Procedures

### Weekly Tasks

- [ ] Review recent commits for doc updates needed
- [ ] Check for broken links in modified files
- [ ] Update CHANGELOG.md if releases occurred

### Monthly Tasks

- [ ] Full link check across all documentation
- [ ] Review ROADMAP.md for completed items
- [ ] Archive outdated documents
- [ ] Update docs/README.md index

### Quarterly Tasks

- [ ] Full documentation audit
- [ ] Check for content duplication
- [ ] Verify SSOT compliance
- [ ] Update templates if needed
- [ ] Review and update this guide

### Link Checking

```bash
# Check for broken internal links
grep -r "\[.*\](.*\.md)" docs/ | while read line; do
  # Extract and verify each link
  echo "Checking: $line"
done

# Check for broken anchor links
grep -r "#" docs/*.md
```

### Consistency Audit

```bash
# Find potential duplicates
grep -r "Known Limitations" docs/
grep -r "Roadmap" docs/
grep -r "Quick Start" docs/

# Verify each has proper SSOT structure
```

---

## Quality Checklist

### Before Committing Documentation

- [ ] **SSOT Compliance**
  - [ ] No duplicate detailed content
  - [ ] References link to authority
  - [ ] Authority documents are complete

- [ ] **Link Integrity**
  - [ ] All internal links work
  - [ ] Anchor links point to existing headers
  - [ ] No broken references

- [ ] **Naming Conventions**
  - [ ] File names follow standards
  - [ ] Consistent capitalization
  - [ ] Dates in YYYY-MM-DD format

- [ ] **Content Quality**
  - [ ] Clear and concise
  - [ ] Proper grammar and spelling
  - [ ] Code examples are tested
  - [ ] Screenshots are up-to-date

- [ ] **Structure**
  - [ ] Proper heading hierarchy
  - [ ] Table of contents if > 100 lines
  - [ ] Consistent formatting

- [ ] **AI Optimization**
  - [ ] Entry points documented
  - [ ] Summaries are brief
  - [ ] Links are descriptive
  - [ ] Index files are updated

### Documentation Review Checklist

When reviewing documentation changes:

- [ ] Does this follow SSOT principle?
- [ ] Are there any duplicates created?
- [ ] Are all links working?
- [ ] Is the naming convention followed?
- [ ] Is the content in the right audience category?
- [ ] Are indexes updated?
- [ ] Is CHANGELOG.md updated if needed?

---

## Templates

### New Feature Documentation

````markdown
# Feature Name

> **Authority**: This is the authoritative documentation for [Feature Name].

## Overview

Brief description of what this feature does.

## Use Cases

1. **Use Case 1**: Description
2. **Use Case 2**: Description

## How It Works

1. Step 1
2. Step 2
3. Step 3

## Configuration

```bash
# Configuration example
SETTING_NAME=value
```
````

## Examples

### Example 1: Basic Usage

```language
code example
```

### Example 2: Advanced Usage

```language
code example
```

## Limitations

See [ROADMAP.md](ROADMAP.md#known-limitations) for current limitations.

## Related Documentation

- [Related Doc 1](path/to/doc1.md)
- [Related Doc 2](path/to/doc2.md)

````

### New Fix Documentation

```markdown
# Fix: [Brief Title]

**Date**: YYYY-MM-DD
**Impact**: High/Medium/Low
**Status**: ✅ Fixed / 🚧 In Progress / ⏳ Planned

## Problem

Describe the issue that was encountered.

## Root Cause

Explain what was causing the problem.

## Solution

Describe how the problem was fixed.

### Changes Made

1. **File 1**: What changed
2. **File 2**: What changed

### Code Changes

```language
// Before
old code

// After
new code
````

## Testing

How to verify the fix works:

1. Step 1
2. Step 2
3. Expected result

## Prevention

How to avoid this issue in the future.

## Related Issues

- [Issue #123](link)
- [Related Fix](path/to/related-fix.md)

```

---

## Common Scenarios

### Scenario 1: Adding a New Feature

1. Document in `docs/FUNCTIONAL_SPEC.md` (authority)
2. Add highlight to `README.md` if major
3. Update `CHANGELOG.md`
4. Add to `docs/QUICKSTART.md` if affects setup
5. Update `docs/README.md` index

### Scenario 2: Fixing a Bug

1. Create `docs/fixes/YYYY-MM-DD-description.md`
2. Add entry to `docs/FIXES_INDEX.md`
3. Update `CHANGELOG.md`
4. Update related docs if behavior changed

### Scenario 3: Deprecating a Feature

1. Add to `docs/ROADMAP.md` under "Deprecated"
2. Update `docs/FUNCTIONAL_SPEC.md` with deprecation notice
3. Update `CHANGELOG.md`
4. Add migration guide if needed

### Scenario 4: Restructuring Documentation

1. Create restructure plan (like `DOCUMENTATION_RESTRUCTURE_PLAN.md`)
2. Create progress tracker (like `RESTRUCTURE_PROGRESS.md`)
3. Execute in phases
4. Validate all links
5. Archive old structure
6. Update this guide if patterns change

---

## Troubleshooting

### Issue: Content Duplication Found

**Solution**:
1. Identify the most appropriate authority document
2. Move detailed content there
3. Replace other instances with summaries + links
4. Update SSOT mapping in this guide

### Issue: Broken Links After Refactor

**Solution**:
1. Use grep to find all references: `grep -r "old-path" docs/`
2. Update each reference to new path
3. Add redirects in archived files
4. Run link checker

### Issue: Documentation Out of Sync with Code

**Solution**:
1. Review recent commits: `git log --since="1 week ago" --oneline`
2. Check for code changes affecting docs
3. Update relevant authority documents
4. Update CHANGELOG.md
5. Set up pre-commit hook to remind about docs

---

## References

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Documentation Best Practices](https://documentation.divio.com/)

---

**Last Updated**: October 26, 2025
**Maintained By**: [documentation-agent]
**Review Frequency**: Quarterly
```
