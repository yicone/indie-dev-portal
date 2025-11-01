# Project Conventions

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
