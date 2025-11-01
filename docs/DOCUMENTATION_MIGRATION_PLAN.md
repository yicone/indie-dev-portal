# Documentation Migration Plan

## Problem Statement

The project has two conflicting documentation management approaches:

1. **Old Method**: Custom documentation structure in `docs/` with `DOCUMENTATION_MANAGEMENT.md` as guide
2. **New Method**: OpenSpec-driven specifications in `openspec/`

This causes:

- Confusion for AI agents (fall back to old method when no spec exists)
- Inconsistent documentation (e.g., `docs/AGENT_CHAT_UI_*.md` created outside OpenSpec)
- Potential contributor confusion (two different systems)
- Violation of Single Source of Truth principle

## Current State Analysis

### Category 1: Conflicting Documentation (Must Migrate or Remove)

**Old Specification Documents**:

- `docs/DOCUMENTATION_MANAGEMENT.md` - Conflicts with OpenSpec workflow
- `docs/FUNCTIONAL_SPEC.md` - Should be in OpenSpec specs
- `docs/NAMING_CONVENTIONS.md` - Should be in OpenSpec project.md or .windsurfrules

**Recently Created Non-OpenSpec Documents**:

- `docs/AGENT_CHAT_UI_IMPROVEMENTS.md` - Should be in OpenSpec change
- `docs/AGENT_CHAT_UI_PHASE1_SUMMARY.md` - Should be in OpenSpec change
- `docs/AGENT_CHAT_UI_TESTING_GUIDE.md` - Can keep as supplementary
- Lowercase duplicates - Should be removed

### Category 2: Valuable Operational Documents (Keep)

**Process Documents**:

- `docs/openspec-lessons-learned.md` ✅ - Lessons learned
- `docs/session-status-test-checklist.md` ✅ - Testing checklist
- `docs/agent-session-states.md` ✅ - State documentation
- `docs/database-migration-guide.md` ✅ - Migration guide

**Meta Documents**:

- `docs/README.md` ✅ - Index for docs/
- `docs/QUICKSTART.md` ✅ - Quick start guide
- `docs/ROADMAP.md` ✅ - Project roadmap

**Archive**:

- `docs/archive/*` ✅ - Historical records

**Templates**:

- `docs/templates/*` ✅ - Reusable templates

### Category 3: Root Documents (Review and Update)

- `AGENTS.md` ✅ - Already migrated to OpenSpec
- `README.md` ⚠️ - May reference old docs
- `CHANGELOG.md` ✅ - Keep as is
- `CLAUDE.md` ⚠️ - May reference old docs

## Migration Strategy

### Phase 1: Establish Clear Boundaries (Immediate)

**Goal**: Define what goes where

**OpenSpec Territory** (Single Source of Truth for Requirements):

- All feature specifications → `openspec/specs/`
- All change proposals → `openspec/changes/`
- All architectural decisions → `openspec/specs/*/design.md`
- Project conventions → `openspec/project.md`

**docs/ Territory** (Supplementary Documentation):

- Testing guides and checklists
- Migration guides
- Lessons learned
- Quick start guides
- Roadmaps
- Templates

**Root Territory** (Entry Points):

- `README.md` - Project overview
- `AGENTS.md` - AI agent entry point (OpenSpec managed)
- `CHANGELOG.md` - Change history
- `.windsurfrules` - Project-specific rules

### Phase 2: Remove Conflicting Documents (Immediate)

**Action**: Archive or remove old specification documents

```bash
# Move to archive
mkdir -p docs/archive/old-doc-system
mv docs/DOCUMENTATION_MANAGEMENT.md docs/archive/old-doc-system/
mv docs/FUNCTIONAL_SPEC.md docs/archive/old-doc-system/
mv docs/NAMING_CONVENTIONS.md docs/archive/old-doc-system/

# Remove duplicates
rm docs/agent-chat-ui-improvements.md
rm docs/agent-chat-ui-phase1-summary.md
rm docs/agent-chat-ui-testing-guide.md

# Keep uppercase versions, but mark as deprecated
```

### Phase 3: Migrate Content to OpenSpec (Gradual)

**FUNCTIONAL_SPEC.md → OpenSpec**:

- Extract requirements → Create specs in `openspec/specs/`
- Extract features → Create change proposals if not yet implemented
- Keep implementation notes in code comments

**NAMING_CONVENTIONS.md → .windsurfrules**:

- Move naming rules to `.windsurfrules`
- Reference from `openspec/project.md` if needed

**DOCUMENTATION_MANAGEMENT.md → Deprecate**:

- OpenSpec workflow replaces this entirely
- Keep in archive for reference

### Phase 4: Update References (Immediate)

**Update root documents**:

- `README.md` - Remove references to old docs, point to OpenSpec
- `CLAUDE.md` - Update if it references old docs
- `.windsurfrules` - Ensure it only references OpenSpec

**Update remaining docs/**:

- Add deprecation notices to conflicting docs
- Update cross-references

### Phase 5: Prevent Regression (Immediate)

**Add to .windsurfrules**:

```markdown
## Documentation Management

**Single Source of Truth**: OpenSpec

- All feature specifications MUST be in `openspec/specs/`
- All change proposals MUST be in `openspec/changes/`
- Never create specification documents in `docs/`
- `docs/` is for supplementary documentation only (testing guides, migration guides, lessons learned)

**When to use OpenSpec**:

- ✅ New features or capabilities
- ✅ Breaking changes
- ✅ Architecture changes
- ✅ Requirements and scenarios

**When to use docs/**:

- ✅ Testing checklists
- ✅ Migration guides
- ✅ Lessons learned
- ✅ Quick start guides
- ❌ Never for feature specifications
```

## Detailed Action Plan

### Immediate Actions (Today)

1. **Create OpenSpec change**: `cleanup-documentation-structure`
   - proposal.md: Why and impact
   - tasks.md: Step-by-step cleanup
   - No spec deltas needed (tooling/docs only)

2. **Archive conflicting documents**:

   ```bash
   mkdir -p docs/archive/old-doc-system
   git mv docs/DOCUMENTATION_MANAGEMENT.md docs/archive/old-doc-system/
   git mv docs/FUNCTIONAL_SPEC.md docs/archive/old-doc-system/
   git mv docs/NAMING_CONVENTIONS.md docs/archive/old-doc-system/
   ```

3. **Remove duplicate documents**:

   ```bash
   git rm docs/agent-chat-ui-improvements.md
   git rm docs/agent-chat-ui-phase1-summary.md
   git rm docs/agent-chat-ui-testing-guide.md
   ```

4. **Update .windsurfrules**:
   - Add clear documentation management rules
   - Specify OpenSpec as single source of truth
   - Define docs/ scope clearly

5. **Add deprecation notices**:
   - Add to archived docs explaining why they were moved
   - Add to uppercase AGENT*CHAT_UI*\*.md explaining they should be in OpenSpec

### Short-term Actions (This Week)

6. **Review and update README.md**:
   - Remove references to old docs
   - Point to OpenSpec for specifications
   - Point to docs/ for supplementary materials

7. **Create docs/README.md update**:
   - Clarify purpose of docs/ directory
   - List what belongs here vs OpenSpec
   - Provide examples

8. **Migrate valuable content**:
   - Extract any valuable content from FUNCTIONAL_SPEC.md
   - Create appropriate OpenSpec specs if needed
   - Extract naming conventions to .windsurfrules

### Long-term Actions (Next Sprint)

9. **Audit all docs/ files**:
   - Ensure each has clear purpose
   - Remove redundant files
   - Update cross-references

10. **Create contributor guide**:
    - Explain OpenSpec workflow
    - Explain docs/ purpose
    - Provide examples of both

11. **Add pre-commit checks** (optional):
    - Warn if new .md files created in docs/ with certain patterns
    - Suggest OpenSpec workflow instead

## Success Criteria

- ✅ No conflicting documentation management guides
- ✅ Clear separation: OpenSpec for specs, docs/ for supplementary
- ✅ .windsurfrules explicitly defines documentation strategy
- ✅ No duplicate or conflicting documents
- ✅ All references updated
- ✅ AI agents consistently use OpenSpec workflow

## Risks and Mitigation

**Risk**: Losing valuable content from old docs
**Mitigation**: Archive first, review before deletion, extract valuable content

**Risk**: Breaking existing workflows
**Mitigation**: Gradual migration, clear communication, update references

**Risk**: AI agents still creating wrong docs
**Mitigation**: Strong rules in .windsurfrules, clear examples, validation in pre-commit

## Timeline

- **Day 1** (Today): Archive conflicting docs, update .windsurfrules
- **Day 2-3**: Update references, add deprecation notices
- **Week 1**: Migrate valuable content, update contributor docs
- **Week 2**: Final audit and cleanup

## Questions for Decision

1. **Keep or remove AGENT*CHAT_UI*\*.md files?**
   - Option A: Remove (they should be in OpenSpec)
   - Option B: Keep with deprecation notice (reference for testing)
   - **Recommendation**: Remove IMPROVEMENTS and SUMMARY, keep TESTING_GUIDE

2. **What to do with FUNCTIONAL_SPEC.md content?**
   - Option A: Migrate to OpenSpec specs
   - Option B: Archive as historical reference
   - **Recommendation**: Archive, create new specs as needed

3. **Naming conventions location?**
   - Option A: .windsurfrules
   - Option B: openspec/project.md
   - Option C: Both (reference from project.md to .windsurfrules)
   - **Recommendation**: Option C

## Next Steps

1. Review this plan with team/user
2. Get approval for immediate actions
3. Create OpenSpec change: `cleanup-documentation-structure`
4. Execute Phase 1 and 2
5. Monitor for regression
