<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

---

## Project Rules

### File Naming Conventions

#### Documentation Files

**In docs/ directory**:

- Use `SCREAMING_SNAKE_CASE.md` for top-level docs (e.g., `QUICKSTART.md`, `ROADMAP.md`)
- Use `kebab-case.md` for subdirectory docs (e.g., `docs/fixes/2025-10-26-fix-name.md`)
- Use descriptive names that indicate purpose

**In openspec/ directory**:

- Use `kebab-case` for change IDs (e.g., `add-feature-name`, `fix-bug-name`)
- Use `kebab-case` for capability names (e.g., `agent-chat-ui`, `http-server`)
- Standard files: `proposal.md`, `tasks.md`, `design.md`, `spec.md`

#### Code Files

Follow Next.js and TypeScript conventions:

- Components: `PascalCase.tsx` (e.g., `AgentChatPanel.tsx`)
- Utilities: `camelCase.ts` (e.g., `gitUtils.ts`)
- API routes: `kebab-case.ts` (e.g., `agent-sessions.ts`)
- Types: `PascalCase` (e.g., `SessionStatus`)

### Commit Message Format

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

### Code Style

#### TypeScript/React

- Use functional components with hooks
- Prefer `const` over `let`
- Use TypeScript strict mode
- Avoid `any` type (use proper types or `unknown`)
- Use async/await over promises

#### Documentation

- Use Markdown for all documentation
- Include code examples where helpful
- Link to related documents
- Keep line length reasonable (<120 characters)
- Use relative links for internal references

### Testing Requirements

#### Before Committing

- ✅ TypeScript compilation passes (`pnpm exec tsc --noEmit`)
- ✅ No console errors
- ✅ Markdown linting passes (automatic via pre-commit hook)
- ✅ Documentation links valid (automatic via pre-commit hook)

#### For OpenSpec Changes

- ✅ Validate with `openspec validate <change-id> --strict`
- ✅ All tasks in tasks.md marked as complete
- ✅ Spec deltas follow correct format (#### Scenario:)

#### For Features

- ✅ Manual testing completed
- ✅ Testing checklist followed (if exists)
- ✅ No regressions in existing functionality

### AI Agent Behavior

#### When Starting a Task

1. Check for existing OpenSpec specs and changes
2. Read relevant documentation
3. Understand the context before coding
4. Ask clarifying questions if needed

#### When Implementing Features

1. Always create OpenSpec change first
2. Follow the spec deltas
3. Update tasks.md as you progress
4. Test frequently during development
5. Commit incrementally with clear messages

#### When Documenting

1. Specifications → OpenSpec (`openspec/specs/` and `openspec/changes/`)
2. Supplementary guides → `docs/` (testing, migration, lessons learned)
3. Never duplicate specifications

#### Documentation Management

**OpenSpec Territory** (Specifications and Requirements):

- ✅ All feature specifications → `openspec/specs/<capability>/spec.md`
- ✅ All change proposals → `openspec/changes/<change-id>/`
- ✅ All architectural decisions → `openspec/specs/<capability>/design.md`
- ✅ Project conventions → `openspec/project.md`

**docs/ Territory** (Supplementary Documentation Only):

- ✅ Testing guides and checklists
- ✅ Migration guides
- ✅ Lessons learned
- ✅ Quick start guides
- ✅ Roadmaps
- ❌ Never create specification documents in docs/

### References

- **OpenSpec Workflow**: `openspec/AGENTS.md`
- **Project Conventions**: `openspec/project.md`
- **Lessons Learned**: `docs/openspec-lessons-learned.md`
