# Cleanup Documentation Structure

## Why

The project has two conflicting documentation management approaches that cause confusion:

1. **Old Method**: Custom documentation structure with `DOCUMENTATION_MANAGEMENT.md` as guide
2. **New Method**: OpenSpec-driven specifications in `openspec/`

This causes:

- AI agents fall back to old method when no spec exists
- Inconsistent documentation (e.g., `AGENT_CHAT_UI_*.md` created outside OpenSpec)
- Potential contributor confusion (two different systems)
- Violation of Single Source of Truth principle

Recent example: `improve-agent-chat-ui-ux` was implemented without spec first, resulting in custom docs instead of OpenSpec format.

## What Changes

### Remove Conflicting Documents

- Archive old specification documents to `docs/archive/old-doc-system/`:
  - `DOCUMENTATION_MANAGEMENT.md` - Conflicts with OpenSpec workflow
  - `FUNCTIONAL_SPEC.md` - Should be in OpenSpec specs
  - `NAMING_CONVENTIONS.md` - Should be in project rules

- Remove duplicate empty files:
  - `docs/agent-chat-ui-improvements.md` (0 bytes)
  - `docs/agent-chat-ui-phase1-summary.md` (0 bytes)
  - `docs/agent-chat-ui-testing-guide.md` (0 bytes)

- Remove non-OpenSpec documents:
  - `docs/AGENT_CHAT_UI_IMPROVEMENTS.md` - Content should be in OpenSpec change
  - `docs/AGENT_CHAT_UI_PHASE1_SUMMARY.md` - Content should be in OpenSpec change
  - Keep `docs/AGENT_CHAT_UI_TESTING_GUIDE.md` - Valid supplementary testing guide

### Establish Clear Boundaries

Consolidate all project rules into `AGENTS.md` to define:

- OpenSpec territory: All specifications and requirements
- docs/ territory: Supplementary documentation only (testing, migration, lessons)
- Explicit rules to prevent regression
- Cross-AI-agent portability (works with Windsurf, Cursor, Continue, etc.)

### Update References

- Update `README.md` to reference OpenSpec
- Update `docs/README.md` to clarify purpose
- Ensure no broken references

## Impact

### Affected Documentation

- **Archived**: 3 old specification documents + 1 outdated summary
- **Removed**: 4 duplicate/conflicting documents
- **Consolidated**: All project rules into `AGENTS.md` (cross-AI-agent portable)
- **Renamed**: 6 files to enforce naming conventions (SCREAMING_SNAKE_CASE)
- **Updated**: README files and all references
- **Deprecated**: FIXES_INDEX.md and fixes/ (marked as historical)

### Benefits

- Single source of truth for specifications (OpenSpec)
- Clear separation of concerns
- Prevents AI agent confusion
- Better contributor experience
- Prepared for open source

### Migration Path

1. Archive old docs (preserve in git history)
2. Remove duplicates and conflicts
3. Create `.windsurfrules` with explicit rules
4. Update references
5. No code changes required
6. No database changes required

## Non-Goals

- Not migrating content from old docs to OpenSpec (do as needed)
- Not changing existing OpenSpec structure
- Not modifying working documentation (testing guides, etc.)
