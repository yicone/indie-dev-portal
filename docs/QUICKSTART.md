# Quick Start Guide

## Prerequisites

- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)
- VS Code (optional, for protocol handlers)
- Git repositories on your local machine

## Setup & Run

### Option 1: Real Git Integration (Recommended)

```bash
# 1. Install dependencies
pnpm install

# 2. Setup database
pnpm db:generate
pnpm db:migrate

# 3. Configure git scan paths
# Edit .env and add:
# GIT_SCAN_PATHS="/Users/username/Projects,/Users/username/Workspace"

# 4. Sync your git repositories
pnpm git:sync

# 5. Start development servers
pnpm dev
```

### Option 2: Mock Data (Quick Test)

```bash
# 1. Install dependencies
pnpm install

# 2. Setup database with mock data
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 3. Start development servers
pnpm dev
```

The application will be available at:

- **Frontend**: <http://localhost:3000>
- **API**: <http://localhost:4000>

## Verify Installation

```bash
# Test API endpoints
pnpm test:api

# Check code quality
pnpm lint
pnpm typecheck
```

## Features to Test

1. **Search** - Type in the search box to filter repos
2. **Language Filter** - Select a language from dropdown
3. **Sort** - Try sorting by Last Opened, Name, or Commit Frequency
4. **Pagination** - Navigate between pages (if >6 repos)
5. **Refresh** - Click refresh button in header
6. **Theme Toggle** - Switch between light/dark mode
7. **Repository Actions**:
   - **VS Code** - Opens repo in VS Code (requires VS Code)
   - **Folder** - Opens repo folder in Finder
   - **Diff** - Opens git diff in VS Code
   - **Notes** - Edit and save repository notes

## Troubleshooting

### Port Already in Use

```bash
# Kill processes on ports 3000 and 4000
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9

# Then restart
pnpm dev
```

### Database Issues

```bash
# Reset database
rm dev.db
pnpm db:migrate
pnpm db:seed
```

### VS Code Protocol Not Working

The `vscode://` protocol requires VS Code to be installed and may be blocked by some browsers. Try:

- Use Chrome/Edge (better protocol support)
- Install VS Code if not already installed
- Check browser console for errors

## Project Structure

```
indie-dev-portal/
├── app/                    # Next.js pages
│   ├── page.tsx           # Main dashboard
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── dashboard/        # Dashboard-specific
│   └── ui/               # Reusable UI (shadcn)
├── api/                   # Express API
│   ├── server.ts         # API entry point
│   ├── repos.ts          # Repos router
│   └── commits.ts        # Commits router
├── lib/                   # Utilities
│   ├── gitUtils.ts       # API fetch functions
│   └── repoActions.ts    # Repository actions
├── prisma/               # Database
│   └── schema.prisma     # Database schema
├── data/                 # Mock data
│   ├── repos.json
│   └── commits.json
└── scripts/              # Utility scripts
    ├── seed.ts           # Database seeding
    └── test-api.ts       # API tests
```

## Documentation

- [FUNCTIONAL_SPEC.md](FUNCTIONAL_SPEC.md) - Detailed feature documentation
- [GIT_INTEGRATION.md](GIT_INTEGRATION.md) - How git scanning works
- [ROADMAP.md](ROADMAP.md) - Future plans and known limitations
- [../AGENTS.md](../AGENTS.md) - Agent collaboration guide
- [../CHANGELOG.md](../CHANGELOG.md) - Version history

## Next Steps

After verifying everything works:

1. Review [FUNCTIONAL_SPEC.md](FUNCTIONAL_SPEC.md) for detailed features
2. Check [ROADMAP.md](ROADMAP.md) for limitations and future plans
3. Configure git scanning paths in `.env`
4. Run `pnpm git:sync` regularly to update repository data

Enjoy your Personal Developer Dashboard! 🚀
