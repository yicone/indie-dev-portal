# Implementation Tasks

## 1. Archive Old Specification Documents

- [x] 1.1 Create archive directory `docs/archive/old-doc-system/`
- [x] 1.2 Move `docs/DOCUMENTATION_MANAGEMENT.md` to archive
- [x] 1.3 Move `docs/FUNCTIONAL_SPEC.md` to archive
- [x] 1.4 Move `docs/NAMING_CONVENTIONS.md` to archive
- [x] 1.5 Create README in archive explaining why documents were archived

## 2. Remove Duplicate and Conflicting Documents

- [x] 2.1 Remove `docs/agent-chat-ui-improvements.md` (empty duplicate)
- [x] 2.2 Remove `docs/agent-chat-ui-phase1-summary.md` (empty duplicate)
- [x] 2.3 Remove `docs/agent-chat-ui-testing-guide.md` (empty duplicate)
- [x] 2.4 Remove `docs/AGENT_CHAT_UI_IMPROVEMENTS.md` (should be in OpenSpec)
- [x] 2.5 Remove `docs/AGENT_CHAT_UI_PHASE1_SUMMARY.md` (should be in OpenSpec)
- [x] 2.6 Keep `docs/AGENT_CHAT_UI_TESTING_GUIDE.md` (valid supplementary doc)

## 3. Create Project-Specific Rules File

- [x] 3.1 Create `.windsurfrules` template in project root
- [x] 3.2 Add documentation management rules
- [x] 3.3 Define OpenSpec territory (specs and requirements)
- [x] 3.4 Define docs/ territory (supplementary only)
- [x] 3.5 Add explicit prevention rules
- [x] 3.6 Reference OpenSpec workflow
- [ ] 3.7 User to copy WINDSURFRULES_TEMPLATE.md to .windsurfrules

## 4. Update Documentation References

- [ ] 4.1 Review `README.md` for references to old docs
- [ ] 4.2 Update `README.md` to reference OpenSpec
- [ ] 4.3 Update `docs/README.md` to clarify purpose
- [ ] 4.4 Check for broken links in remaining docs
- [ ] 4.5 Update any cross-references

## 5. Validation and Testing

- [ ] 5.1 Validate OpenSpec change: `openspec validate cleanup-documentation-structure --strict`
- [ ] 5.2 Check for broken links in documentation
- [ ] 5.3 Verify no references to removed documents
- [ ] 5.4 Test that AI agents follow new rules

## 6. Commit Changes

- [ ] 6.1 Commit archive changes
- [ ] 6.2 Commit file removals
- [ ] 6.3 Commit .windsurfrules creation
- [ ] 6.4 Commit reference updates
- [ ] 6.5 Update DOCUMENTATION_MIGRATION_PLAN.md status
