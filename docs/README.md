# Supplementary Documentation

This directory contains **supplementary documentation only**. All specifications and requirements are managed in the `openspec/` directory.

## 📍 Entry Points

Choose your starting point based on your role:

- **👤 For Users**: Start with [QUICKSTART.md](QUICKSTART.md)
- **🤖 For AI Agents**: Start with [../AGENTS.md](../AGENTS.md) → [../openspec/AGENTS.md](../openspec/AGENTS.md)
- **👨‍💻 For Contributors**: Start with [../openspec/project.md](../openspec/project.md) and [../AGENTS.md](../AGENTS.md)
- **🔧 For Developers**: Start with [../openspec/AGENTS.md](../openspec/AGENTS.md)

## 📐 Documentation Structure

### Specifications (openspec/)

**All specifications and requirements live here:**

- `openspec/specs/` - Current specifications (what IS built)
- `openspec/changes/` - Change proposals (what SHOULD change)
- `openspec/project.md` - Project conventions and tech stack
- `openspec/AGENTS.md` - OpenSpec workflow instructions

### Supplementary Docs (docs/)

**This directory contains:**

- Testing guides and checklists
- Migration guides
- Lessons learned
- Quick start guides
- Roadmaps
- Templates

**Never create specification documents here!**

## 📚 All Documentation Files

### User Documentation

| File                                     | Description                        | Audience          |
| ---------------------------------------- | ---------------------------------- | ----------------- |
| [QUICKSTART.md](QUICKSTART.md)           | Get up and running in 5 minutes    | New users         |
| [GIT_INTEGRATION.md](GIT_INTEGRATION.md) | How git repository scanning works  | Users, Developers |
| [ROADMAP.md](ROADMAP.md)                 | Future plans and known limitations | All users         |

### Developer Documentation

| File                                                               | Description                         | Audience              |
| ------------------------------------------------------------------ | ----------------------------------- | --------------------- |
| [openspec-lessons-learned.md](openspec-lessons-learned.md)         | OpenSpec best practices and lessons | AI agents, Developers |
| [AGENT_CHAT_UI_TESTING_GUIDE.md](AGENT_CHAT_UI_TESTING_GUIDE.md)   | Testing guide for Agent Chat UI     | Developers            |
| [FIXES_INDEX.md](FIXES_INDEX.md)                                   | Bug fixes and improvements index    | AI agents, Developers |
| [DOCUMENTATION_MIGRATION_PLAN.md](DOCUMENTATION_MIGRATION_PLAN.md) | Documentation cleanup plan          | Contributors          |

### Project Documentation

| File                               | Description                         | Audience |
| ---------------------------------- | ----------------------------------- | -------- |
| [../README.md](../README.md)       | Project overview and navigation hub | Everyone |
| [../CHANGELOG.md](../CHANGELOG.md) | Version history and changes         | Everyone |

### Fix Documentation

| Directory        | Description                | Audience              |
| ---------------- | -------------------------- | --------------------- |
| [fixes/](fixes/) | Detailed fix documentation | AI agents, Developers |

Current fixes:

- [2025-10-26-last-committed-branch-display.md](fixes/2025-10-26-last-committed-branch-display.md) - Last Committed & Branch Display fixes

### Archived Documentation

| Directory                                          | Description                 | Note                      |
| -------------------------------------------------- | --------------------------- | ------------------------- |
| [archive/old-doc-system/](archive/old-doc-system/) | Old specification documents | Moved to OpenSpec         |
| [archive/](archive/)                               | Other deprecated docs       | Historical reference only |

**Old specification system** (moved to `openspec/`):

- `FUNCTIONAL_SPEC.md` - Now in `openspec/project.md` and `openspec/specs/`
- `DOCUMENTATION_MANAGEMENT.md` - Now in `AGENTS.md` and `openspec/AGENTS.md`
- `NAMING_CONVENTIONS.md` - Now in `AGENTS.md`

**Other archived files**:

- `PROJECT_STATUS.md` - Superseded by CHANGELOG.md and ROADMAP.md
- `IMPLEMENTATION_SUMMARY.md` - Superseded by GIT_INTEGRATION.md
- `GIT_INTEGRATION_SUMMARY.md` - Superseded by GIT_INTEGRATION.md

## 🔍 Finding Information

### By Topic

- **Setup & Installation**: [QUICKSTART.md](QUICKSTART.md)
- **Project Conventions**: [../openspec/project.md](../openspec/project.md)
- **Git Integration**: [GIT_INTEGRATION.md](GIT_INTEGRATION.md)
- **Future Plans**: [ROADMAP.md](ROADMAP.md)
- **Known Issues**: [ROADMAP.md](ROADMAP.md#known-limitations)
- **Bug Fixes**: [FIXES_INDEX.md](FIXES_INDEX.md)
- **OpenSpec Workflow**: [../openspec/AGENTS.md](../openspec/AGENTS.md)
- **Project Rules**: [../AGENTS.md](../AGENTS.md)
- **Version History**: [../CHANGELOG.md](../CHANGELOG.md)

### By Audience

**New Users**:

1. [../README.md](../README.md) - Project overview
2. [QUICKSTART.md](QUICKSTART.md) - Get started
3. [../openspec/project.md](../openspec/project.md) - Tech stack and conventions

**Developers**:

1. [../openspec/AGENTS.md](../openspec/AGENTS.md) - OpenSpec workflow
2. [GIT_INTEGRATION.md](GIT_INTEGRATION.md) - Technical details
3. [FIXES_INDEX.md](FIXES_INDEX.md) - Recent changes

**Contributors**:

1. [../AGENTS.md](../AGENTS.md) - Project rules and conventions
2. [../openspec/AGENTS.md](../openspec/AGENTS.md) - Spec-driven workflow
3. [openspec-lessons-learned.md](openspec-lessons-learned.md) - Best practices

**AI Agents**:

1. [../AGENTS.md](../AGENTS.md) - Entry point
2. [../openspec/AGENTS.md](../openspec/AGENTS.md) - OpenSpec instructions
3. [../AGENTS.md](../AGENTS.md) - Project-specific rules

## 📝 Documentation Principles

This project follows OpenSpec for spec-driven development:

1. **Specifications in OpenSpec**: All requirements and specs in `openspec/`
2. **Supplementary in docs/**: Testing guides, migration docs, lessons learned
3. **Single Source of Truth (SSOT)**: Each piece of information exists in one authoritative location
4. **Clear Entry Points**: Different audiences have clear starting points
5. **Consistent Naming**: Follows conventions in [../AGENTS.md](../AGENTS.md)

## 🔄 Keeping Documentation Updated

When making changes:

1. **Specifications**: Always use OpenSpec workflow (see [../openspec/AGENTS.md](../openspec/AGENTS.md))
2. **Supplementary docs**: Update in `docs/` following [../AGENTS.md](../AGENTS.md)
3. **Update cross-references**: Check for links to the changed content
4. **Update this index**: If adding/removing files, update this page

See [../openspec/AGENTS.md](../openspec/AGENTS.md) for detailed workflow.

## 📊 Documentation Statistics

- **Specifications**: `openspec/specs/` and `openspec/changes/`
- **Supplementary Docs**: 7 active files in `docs/`
- **Archived**: Old specification system in `docs/archive/old-doc-system/`
- **Last Major Update**: November 1, 2025 (Documentation cleanup)

---

**Maintained by**: Project maintainers  
**Last Updated**: November 1, 2025  
**Questions?**: See [../AGENTS.md](../AGENTS.md) or [../openspec/AGENTS.md](../openspec/AGENTS.md)
