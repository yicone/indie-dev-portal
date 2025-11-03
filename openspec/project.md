# Project Context

## Purpose

DevDesk that surfaces local repos, recent commits, and quick actions.

## Tech Stack

- Next.js 15 + TypeScript + Tailwind + shadcn/ui for the app shell
- Express + Prisma + SQLite for data
- pnpm for package management.

## Project Conventions

### Data Inputs

#### Real Git Integration (Primary)

- **Repos** Scanned from local filesystem via `lib/gitService.ts`
- **Commits** Parsed from git log using `simple-git`
- **Metadata** Auto-detected: languages, frameworks, CI/CD status
- **Sync** Run `pnpm git:sync` to scan and update repositories
- **Config** `GIT_SCAN_PATHS` and `GIT_SCAN_DEPTH` in `.env`

#### Mock Data (Optional)

- **Repos** `data/repos.json` (frameworks stored as JSON strings in Prisma, decode in `api/transformers.ts`)
- **Commits** `data/commits.json` seeded into SQLite via `scripts/seed.ts`
- **Cleanup** Run `pnpm db:clean-mock` to remove mock data

#### Environment

- **Env** `.env.example` documents `DATABASE_URL`, `API_PORT`, `NEXT_PUBLIC_API_BASE_URL`, `GIT_SCAN_PATHS`, `GIT_SCAN_DEPTH`

#### Consistency

- When updating shared types, change both `types/git.ts` and corresponding Prisma models.

### Code Style

<!-- [Describe your code style preferences, formatting rules, and naming conventions] -->

#### Documentation Files

**In docs/ directory**:

- Use `SCREAMING_SNAKE_CASE.md` for top-level docs (e.g., `QUICKSTART.md`, `ROADMAP.md`)
- Use `kebab-case.md` for subdirectory docs (e.g., `testing/agent-chat-ui-testing-guide.md`)
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

### Architecture Patterns

<!-- [Document your architectural decisions and patterns] -->

### Testing Strategy

<!-- [Explain your testing approach and requirements] -->

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

### Git Workflow

<!-- [Describe your branching strategy and commit conventions] -->

## Domain Context

<!-- [Add domain-specific knowledge that AI assistants need to understand] -->

## Important Constraints

<!-- [List any technical, business, or regulatory constraints] -->

### Collaboration Workflow

- **Bootstrap** `pnpm install` then approve optional build scripts if required.
- **Database** `pnpm db:generate` → `pnpm db:migrate` → `pnpm git:sync` (syncs real git repos).
- **Development** Run `pnpm dev` to start Next.js and Express concurrently (`http://localhost:3000`, `http://localhost:4000`).
- **Git Sync** Run `pnpm git:sync` to discover and update repositories from filesystem.
- **Lint/Format** Use `pnpm lint` and `pnpm format:write` before handoffs.
- **Design Verification** Cross-check every UI change against the prototype folder before merging.

### Documentation Principles

1. **Single Source of Truth (SSOT)**: Every piece of information has ONE authoritative source
2. **Hybrid Approach**: Index files for quick access, detailed files for depth
3. **Audience-Oriented**: Organize by user type (Users/Developers/Contributors)
4. **Progressive Disclosure**: Brief summaries + links to details

### Documentation Territory

**OpenSpec Territory** (Specifications & Requirements):

- `openspec/specs/<capability>/spec.md` - Current truth (what IS built)
- `openspec/specs/<capability>/design.md` - Technical patterns and decisions
- `openspec/changes/<id>/` - Proposals (what SHOULD change)
- `openspec/changes/archive/YYYY-MM-DD-<id>/` - Completed changes

**docs/ Territory** (Supplementary Documentation ONLY):

- `docs/QUICKSTART.md`, `docs/ROADMAP.md` - Top-level guides (SCREAMING_SNAKE_CASE)
- `docs/testing/` - Testing guides and checklists (kebab-case)
- `docs/summaries/YYYY-MM-DD-summary.md` - Work summaries (kebab-case, dated)
- `docs/archive/` - Outdated documentation

**Forbidden**:

- ❌ Never create specification documents in `docs/`
- ❌ Never duplicate requirements from OpenSpec in `docs/`
- ❌ Never create feature proposals in `docs/`

**Testing Documentation Rules**:

- **Change-specific tests** → `openspec/changes/<id>/TESTING.md` or `openspec/changes/archive/YYYY-MM-DD-<id>/TESTING.md`
- **General testing guides** → `docs/testing/<topic>-testing-guide.md`
- **Test checklists** → `docs/testing/<feature>-test-checklist.md`

**Lifecycle Management**:

- `docs/summaries/` - Keep for 1 month, then archive or delete
- `docs/archive/` - Review annually, delete if no longer relevant

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
- **Lessons Learned**: `docs/OPENSPEC_LESSONS_LEARNED.md`

## External Dependencies

<!-- [Document key external services, APIs, or systems] -->

### Design source

- Use prototype assets under `prototype/Peronal Developer Dashboard - AI First Draft/` as the UI authority.
