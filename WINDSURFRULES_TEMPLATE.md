# Project-Specific Rules Template

**Instructions**: Copy this content to `.windsurfrules` in the project root.

---

# Personal Developer Dashboard - Project Rules

## Documentation Management

### Single Source of Truth: OpenSpec

**All specifications and requirements MUST use OpenSpec format.**

#### OpenSpec Territory (Specifications and Requirements)

- ✅ **All feature specifications** → `openspec/specs/<capability>/spec.md`
- ✅ **All change proposals** → `openspec/changes/<change-id>/`
- ✅ **All architectural decisions** → `openspec/specs/<capability>/design.md`
- ✅ **Project conventions** → `openspec/project.md`

#### docs/ Territory (Supplementary Documentation Only)

- ✅ **Testing guides and checklists** (e.g., `session-status-test-checklist.md`)
- ✅ **Migration guides** (e.g., `database-migration-guide.md`)
- ✅ **Lessons learned** (e.g., `openspec-lessons-learned.md`)
- ✅ **Quick start guides** (e.g., `QUICKSTART.md`)
- ✅ **Roadmaps** (e.g., `ROADMAP.md`)
- ✅ **Templates** → `docs/templates/`
- ❌ **Never create specification documents in docs/**

#### Root Territory (Entry Points)

- `README.md` - Project overview and quick start
- `AGENTS.md` - AI agent entry point (OpenSpec managed)
- `CHANGELOG.md` - Change history
- `.windsurfrules` - This file

### When to Use OpenSpec

**Always create OpenSpec change for**:

- ✅ New features or capabilities
- ✅ Breaking changes (API, schema, architecture)
- ✅ Performance or security changes that affect behavior
- ✅ Any change that introduces new requirements

**Skip OpenSpec for**:

- ✅ Bug fixes (restoring intended behavior)
- ✅ Typos, formatting, comments
- ✅ Dependency updates (non-breaking)
- ✅ Configuration changes
- ✅ Tests for existing behavior

### Workflow: Always Spec First

**Correct workflow**:

1. Create OpenSpec change (`openspec/changes/<change-id>/`)
2. Write proposal.md (why and impact)
3. Write spec deltas (requirements and scenarios)
4. Validate (`openspec validate <change-id> --strict`)
5. Implement code
6. Update tasks.md as you go
7. Archive change when deployed

**Never**:

- ❌ Implement features without creating spec first
- ❌ Create custom specification documents in `docs/`
- ❌ Skip OpenSpec workflow for "fast iteration"

### Prevention Rules

**If you find yourself**:

- Creating a new .md file in `docs/` with requirements or specifications
- Writing "Requirement:", "Scenario:", or "The system SHALL" in `docs/`
- Documenting feature behavior outside of OpenSpec

**Then**:

- STOP immediately
- Create an OpenSpec change instead
- Follow the OpenSpec workflow

## OpenSpec Workflow Reference

### Creating Changes

```bash
# 1. Check context
openspec list
openspec list --specs

# 2. Create change
mkdir -p openspec/changes/<change-id>/specs/<capability>

# 3. Write proposal.md, tasks.md, spec deltas

# 4. Validate
openspec validate <change-id> --strict
```

### Implementing Changes

1. Read proposal.md
2. Read tasks.md
3. Implement sequentially
4. Update tasks.md as you complete each task (mark [x])
5. Confirm all tasks completed

### Archiving Changes

```bash
# After deployment
openspec archive <change-id> --yes

# For tooling-only changes (no spec updates)
openspec archive <change-id> --skip-specs --yes
```

## File Naming Conventions

### Documentation Files

**In docs/ directory**:

- Use `SCREAMING_SNAKE_CASE.md` for top-level docs (e.g., `QUICKSTART.md`, `ROADMAP.md`)
- Use `kebab-case.md` for subdirectory docs (e.g., `docs/fixes/2025-10-26-fix-name.md`)
- Use descriptive names that indicate purpose

**In openspec/ directory**:

- Use `kebab-case` for change IDs (e.g., `add-feature-name`, `fix-bug-name`)
- Use `kebab-case` for capability names (e.g., `agent-chat-ui`, `http-server`)
- Standard files: `proposal.md`, `tasks.md`, `design.md`, `spec.md`

### Code Files

Follow Next.js and TypeScript conventions:

- Components: `PascalCase.tsx` (e.g., `AgentChatPanel.tsx`)
- Utilities: `camelCase.ts` (e.g., `gitUtils.ts`)
- API routes: `kebab-case.ts` (e.g., `agent-sessions.ts`)
- Types: `PascalCase` (e.g., `SessionStatus`)

## Commit Message Format

Use conventional commits:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `spec`: OpenSpec changes (proposals, specs)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:

```
feat(agent): add session archiving functionality
fix(api): correct session status transition logic
docs: update OpenSpec lessons learned
spec(openspec): add improve-agent-chat-ui-ux change
```

## Testing Requirements

### Before Committing

- ✅ TypeScript compilation passes (`pnpm exec tsc --noEmit`)
- ✅ No console errors
- ✅ Markdown linting passes (automatic via pre-commit hook)
- ✅ Documentation links valid (automatic via pre-commit hook)

### For OpenSpec Changes

- ✅ Validate with `openspec validate <change-id> --strict`
- ✅ All tasks in tasks.md marked as complete
- ✅ Spec deltas follow correct format (#### Scenario:)

### For Features

- ✅ Manual testing completed
- ✅ Testing checklist followed (if exists)
- ✅ No regressions in existing functionality

## Code Style

### TypeScript/React

- Use functional components with hooks
- Prefer `const` over `let`
- Use TypeScript strict mode
- Avoid `any` type (use proper types or `unknown`)
- Use async/await over promises

### Documentation

- Use Markdown for all documentation
- Include code examples where helpful
- Link to related documents
- Keep line length reasonable (<120 characters)
- Use relative links for internal references

## AI Agent Behavior

### When Starting a Task

1. Check for existing OpenSpec specs and changes
2. Read relevant documentation
3. Understand the context before coding
4. Ask clarifying questions if needed

### When Implementing Features

1. Always create OpenSpec change first
2. Follow the spec deltas
3. Update tasks.md as you progress
4. Test frequently during development
5. Commit incrementally with clear messages

### When Documenting

1. Specifications → OpenSpec
2. Supplementary guides → docs/
3. Project rules → .windsurfrules
4. Never duplicate specifications

## References

- **OpenSpec Workflow**: `openspec/AGENTS.md`
- **Project Conventions**: `openspec/project.md`
- **Lessons Learned**: `docs/openspec-lessons-learned.md`
- **Documentation Migration**: `docs/DOCUMENTATION_MIGRATION_PLAN.md`

---

**Last Updated**: 2025-11-01
**Version**: 1.0.0
