# Old Documentation System (Archived)

## Why These Documents Were Archived

These documents represented an older documentation management approach that has been replaced by OpenSpec.

**Date Archived**: 2025-11-01

**Reason**: The project adopted OpenSpec for specification-driven development. These documents conflicted with the OpenSpec workflow and caused confusion for AI agents and contributors.

## Archived Documents

### DOCUMENTATION_MANAGEMENT.md

**Original Purpose**: Guide for managing project documentation

**Why Archived**: Replaced by OpenSpec workflow (`openspec/AGENTS.md` and `openspec/project.md`)

**Migration**: All specification and requirement documentation now lives in `openspec/specs/` and `openspec/changes/`

### FUNCTIONAL_SPEC.md

**Original Purpose**: Functional specifications for the application

**Why Archived**: Specifications should be in OpenSpec format

**Migration**: Create OpenSpec specs in `openspec/specs/<capability>/spec.md` for new features. Existing functionality is documented through code and OpenSpec specs.

### NAMING_CONVENTIONS.md

**Original Purpose**: Naming conventions for the project

**Why Archived**: Project-specific rules should be in `.windsurfrules`

**Migration**: Naming conventions are now defined in `.windsurfrules` at the project root

## New Documentation Structure

### For Specifications and Requirements

Use OpenSpec:

- `openspec/specs/` - Current specifications
- `openspec/changes/` - Change proposals
- `openspec/project.md` - Project conventions

### For Supplementary Documentation

Use `docs/`:

- Testing guides and checklists
- Migration guides
- Lessons learned
- Quick start guides
- Roadmaps

### For Project Rules

Use `.windsurfrules` at project root

## References

- **OpenSpec Workflow**: See `openspec/AGENTS.md`
- **Documentation Migration Plan**: See `docs/DOCUMENTATION_MIGRATION_PLAN.md`
- **Lessons Learned**: See `docs/openspec-lessons-learned.md`

## Historical Note

These documents served the project well during its early development. They are preserved here for historical reference and to understand the evolution of the project's documentation practices.

If you need information from these documents:

1. Check if it's now in OpenSpec (`openspec/`)
2. Check if it's in `.windsurfrules`
3. Check current `docs/` for supplementary guides
4. If still needed, refer to these archived versions
