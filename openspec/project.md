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

**TypeScript/JavaScript**:

- Use TypeScript for all new code (strict mode enabled)
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises
- Avoid `any` type - use proper types or `unknown`
- Use functional components with hooks (React)

**Naming Conventions**:

- Variables/Functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Types/Interfaces: `PascalCase`
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- API routes: `kebab-case.ts`

**Formatting**: Use Prettier (`.prettierrc`). Run `pnpm format:write` before committing.

### File Naming Conventions

**Documentation files**:

- `docs/`: `SCREAMING_SNAKE_CASE.md` for top-level, `kebab-case.md` for subdirectories
- `openspec/`: `kebab-case` for change IDs and capability names
- Standard OpenSpec files: `proposal.md`, `tasks.md`, `design.md`, `spec.md`

**Code documentation**:

- Use Markdown for all documentation
- Include code examples where helpful
- Link to related documents
- Keep line length <120 characters
- Use relative links for internal references

### Project Structure

```
indie-dev-portal/
├── api/              # Backend API (Express)
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Shared utilities
├── prisma/           # Database schema
├── openspec/         # OpenSpec specifications
├── docs/             # Documentation
└── scripts/          # Build and utility scripts
```

### Architecture Patterns

**Frontend**: Next.js 15 App Router with React Server Components  
**Backend**: Express REST API with Prisma ORM  
**Database**: SQLite for local-first storage  
**State Management**: React Query for server state, React hooks for local state  
**Styling**: Tailwind CSS + shadcn/ui components

**Data Flow**: Filesystem → Git Service → Prisma → API → React Query → UI

### Testing Strategy

**Unit Tests**: Vitest for utilities and components  
**E2E Tests**: Playwright (planned)  
**API Tests**: `pnpm test:api` for endpoint validation  
**Test Files**: Place tests next to code as `*.test.ts`  
**Coverage**: Focus on critical paths and business logic

### Quality Checks

**Before Committing**:

- ✅ TypeScript compilation passes (`pnpm exec tsc --noEmit`)
- ✅ No console errors
- ✅ Markdown linting passes (automatic via pre-commit hook)
- ✅ Documentation links valid (automatic via pre-commit hook)

**For OpenSpec Changes**:

- ✅ Validate with `openspec validate <change-id> --strict`
- ✅ All tasks in tasks.md marked as complete
- ✅ Spec deltas follow correct format (#### Scenario:)

**For Features**:

- ✅ Manual testing completed
- ✅ Testing checklist followed (if exists)
- ✅ No regressions in existing functionality

### Git Workflow

**Branching Strategy**:

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

**Commit Convention**: [Conventional Commits](https://www.conventionalcommits.org/)

- Format: `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `spec`
- Validation: Automatic via commitlint + husky

**Pull Requests**:

- Require passing CI checks and code review before merge
- Use PR template: Description, Type of Change, Testing, Checklist
- Review process: Automated checks → Code review → Approval → Merge

## Domain Context

**Core Concept**: DevDesk is a local-first developer workspace that discovers and tracks git repositories on the local filesystem.

**Key Workflows**:

1. Repository discovery via filesystem scanning
2. Metadata extraction from git history and config files
3. Dashboard visualization with search/filter/sort
4. Quick actions (open in VS Code, view diffs, add notes)

## Important Constraints

**Technical**:

- Local-first: No cloud dependencies, all data stored in SQLite
- Browser security: Protocol handlers (`vscode://`, `file://`) may be restricted
- Manual sync: No real-time updates, requires `pnpm git:sync`

**Performance**:

- Scan depth limited by `GIT_SCAN_DEPTH` to avoid excessive filesystem traversal
- Pagination: 6 repos per page to maintain UI responsiveness

## Development Workflow

**Setup**:

1. `pnpm install` - Install dependencies
2. `pnpm db:generate` → `pnpm db:migrate` - Setup database
3. `pnpm git:sync` - Sync real git repositories
4. `pnpm dev` - Start servers (`localhost:3000`, `localhost:4000`)

**Daily Workflow**:

- Run `pnpm git:sync` to update repository data
- Use `pnpm lint` and `pnpm format:write` before commits
- Cross-check UI changes against prototype folder

### Documentation Principles

1. **Single Source of Truth (SSOT)**: Every piece of information has ONE authoritative source
2. **Hybrid Approach**: Index files for quick access, detailed files for depth
3. **Audience-Oriented**: Organize by user type (Users/Developers/Contributors)
4. **Progressive Disclosure**: Brief summaries + links to details

## Documentation Territory

**OpenSpec Territory** (Specifications & Requirements):

- `openspec/specs/<capability>/spec.md` - Current truth (what IS built)
- `openspec/specs/<capability>/design.md` - Technical patterns and decisions
- `openspec/changes/<id>/` - Proposals (what SHOULD change)
- `openspec/changes/archive/YYYY-MM-DD-<id>/` - Completed changes

**docs/ Territory** (Supplementary Documentation ONLY):

- `docs/QUICKSTART.md`, `docs/ROADMAP.md` - Top-level guides
- `docs/testing/` - Testing guides and checklists
- `docs/summaries/YYYY-MM-DD-summary.md` - Work summaries (keep 1 month)
- `docs/archive/` - Outdated documentation (review annually)

**Rules**:

- ✅ Specifications → `openspec/specs/`
- ✅ Change proposals → `openspec/changes/`
- ✅ Supplementary guides → `docs/`
- ❌ Never create specifications in `docs/`
- ❌ Never duplicate requirements from OpenSpec

**Testing Documentation**:

- Change-specific tests → `openspec/changes/<id>/TESTING.md` or `openspec/changes/archive/YYYY-MM-DD-<id>/TESTING.md`
- General testing guides → `docs/testing/<topic>-testing-guide.md`
- Test checklists → `docs/testing/<feature>-test-checklist.md`

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

## External Dependencies

**Prerequisites**:

- Node.js 20.x or higher
- pnpm 8.x or higher
- Git CLI
- VS Code (optional, for protocol handler integration)

**Key Libraries**:

- Next.js 15, TypeScript, @radix-ui, Tailwind CSS, shadcn/ui, React Query
- Express, Prisma, SQLite, simple-git
- ESLint, Prettier, Husky

## Design Guidelines

- Use prototype assets under `prototype/DevDesk - AI First Draft/` as the UI authority
- Follow Catppuccin color palette for theming
- Maintain WCAG accessibility standards
