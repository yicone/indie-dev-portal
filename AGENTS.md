# Agents Guide

## Context

- **Product** Personal Developer Dashboard that surfaces local repos, recent commits, and quick actions.
- **Design source** Use prototype assets under `prototype/Peronal Developer Dashboard - AI First Draft/` as the UI authority.
- **Tech stack** Next.js 15 + TypeScript + Tailwind + shadcn/ui for the app shell, Express + Prisma + SQLite for data, pnpm for package management.

## Data Inputs

### Real Git Integration (Primary)

- **Repos** Scanned from local filesystem via `lib/gitService.ts`
- **Commits** Parsed from git log using `simple-git`
- **Metadata** Auto-detected: languages, frameworks, CI/CD status
- **Sync** Run `pnpm git:sync` to scan and update repositories
- **Config** `GIT_SCAN_PATHS` and `GIT_SCAN_DEPTH` in `.env`

### Mock Data (Optional)

- **Repos** `data/repos.json` (frameworks stored as JSON strings in Prisma, decode in `api/transformers.ts`)
- **Commits** `data/commits.json` seeded into SQLite via `scripts/seed.ts`
- **Cleanup** Run `pnpm db:clean-mock` to remove mock data

### Environment

- **Env** `.env.example` documents `DATABASE_URL`, `API_PORT`, `NEXT_PUBLIC_API_BASE_URL`, `GIT_SCAN_PATHS`, `GIT_SCAN_DEPTH`

## Agent Responsibilities

- **[frontend-agent]**
  - Implement dashboard pages under `app/` using components from `prototype/.../components/` as references.
  - Maintain Tailwind theme tokens in `app/globals.css` and `tailwind.config.ts` to match Catppuccin palettes.
  - Consume REST endpoints via utilities in `lib/gitUtils.ts`; add React Query hooks as needed.
- **[backend-agent]**
  - Manage Prisma schema (`prisma/schema.prisma`) and Express routers inside `api/`.
  - Ensure `frameworks` are serialized as strings; update `scripts/seed.ts` if model changes.
  - Expose health and data endpoints consumed by the Next.js app.
- **[data-agent]**
  - Curate mock repo/commit data in `data/`; keep schemas aligned with frontend expectations (e.g., five recent commits, ciStatus, notes).
  - Regenerate seeds with `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed` after changes.
- **[tooling-agent]**
  - Maintain configs: `package.json`, `.eslintrc.json`, `tsconfig.json`, Tailwind/PostCSS settings.
  - Manage Husky + lint-staged hooks and ensure Prettier/ESLint rules stay consistent across agents.
- **[documentation-agent]**
  - Maintain documentation structure and consistency across all docs.
  - Follow naming conventions in `docs/NAMING_CONVENTIONS.md`.
  - Update `docs/FIXES_INDEX.md` when fixes are implemented.
  - Keep documentation synced with code changes.

## Collaboration Workflow

- **Bootstrap** `pnpm install` then approve optional build scripts if required.
- **Database** `pnpm db:generate` → `pnpm db:migrate` → `pnpm git:sync` (syncs real git repos).
- **Development** Run `pnpm dev` to start Next.js and Express concurrently (`http://localhost:3000`, `http://localhost:4000`).
- **Git Sync** Run `pnpm git:sync` to discover and update repositories from filesystem.
- **Lint/Format** Use `pnpm lint` and `pnpm format:write` before handoffs.
- **Design Verification** Cross-check every UI change against the prototype folder before merging.

## Documentation Workflow

### Quick Reference

**📍 For AI Agents**: Read `docs/FIXES_INDEX.md` first for all fixes, then follow links to detailed docs if needed.

**For complete documentation guidelines**, see:

- `docs/FIXES_INDEX.md` - AI retrieval patterns and fix summaries
- `docs/NAMING_CONVENTIONS.md` - File naming standards and structure

### When Implementing Fixes

1. **Create detailed doc**: `docs/fixes/YYYY-MM-DD-<description>.md`
2. **Add summary** to `docs/FIXES_INDEX.md`
3. **Follow checklist** in the detailed doc template

### When Code Changes

- Update related docs immediately (feature docs, API docs, README, AGENTS.md)
- Check for outdated references: `grep -r "old-name" docs/`
- Move deprecated docs to `docs/archive/` with deprecation notice

## Notes

- Keep `.gitignore` exclusions in sync with repo tooling (prototype assets should remain included for reference).
- When updating shared types, change both `types/git.ts` and corresponding Prisma models.
- Document major architectural decisions in `README.md` alongside this file when new capabilities are added.
