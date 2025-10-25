# Personal Developer Dashboard

A modern, AI-first developer dashboard that surfaces your local git repositories, recent commits, and quick actions at a glance.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🔍 Real Git Integration

- **Automatic Repository Discovery**: Scans your local filesystem for git repositories
- **Smart Metadata Extraction**: Detects languages, frameworks, and CI/CD configurations
- **Live Commit History**: Parses git log with full commit details
- **Intelligent Detection**: Identifies 10+ languages and 20+ frameworks automatically

### 📊 Dashboard

- **Repository Overview**: View all your projects in one place
- **Search & Filter**: Find repos by name, language, or framework
- **Sort Options**: By last opened, name, or commit frequency
- **Pagination**: Clean navigation through large repo collections

### 🎯 Quick Actions

- **Open in VS Code**: Launch repositories directly in your editor
- **Open in Finder**: Quick access to project folders
- **View Git Diff**: See uncommitted changes instantly
- **Add Notes**: Track project-specific information

### 🎨 Modern UI

- **Light/Dark Themes**: Catppuccin color palette
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Polished user experience
- **Accessible**: WCAG compliant with keyboard navigation

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Git repositories on your local machine
- VS Code (optional, for protocol handlers)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd indie-dev-portal

# 2. Install dependencies
pnpm install

# 3. Setup database
pnpm db:generate
pnpm db:migrate

# 4. Configure git scan paths
cp .env.example .env
# Edit .env and set:
# GIT_SCAN_PATHS="/Users/username/Projects,/Users/username/Workspace"

# 5. Sync your git repositories
pnpm git:sync

# 6. Start development servers
pnpm dev
```

Visit:

- **Frontend**: <http://localhost:3000>
- **API**: <http://localhost:4000>

## 📖 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running quickly
- **[Git Integration Guide](docs/GIT_INTEGRATION.md)** - Detailed git integration documentation
- **[Functional Specification](docs/FUNCTIONAL_SPEC.md)** - Complete feature documentation
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - What was built and how
- **[Agents Guide](AGENTS.md)** - Multi-agent collaboration workflow

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **React Query** - Server state management
- **Lucide Icons** - Icon library

### Backend

- **Express** - REST API server
- **Prisma** - Database ORM
- **SQLite** - Local database
- **simple-git** - Git integration

### Development

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **tsx** - TypeScript execution

## 📝 Available Scripts

### Development

```bash
pnpm dev          # Start both Next.js and Express servers
pnpm dev:web      # Start Next.js only
pnpm dev:server   # Start Express API only
```

### Git Integration

```bash
pnpm git:sync     # Scan and sync git repositories
```

### Database

```bash
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run database migrations
pnpm db:seed      # Seed mock data (optional)
pnpm db:clean-mock # Remove mock data
```

### Testing & Quality

```bash
pnpm test:api     # Test API endpoints
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript checks
pnpm format       # Check code formatting
pnpm format:write # Fix code formatting
```

### Production

```bash
pnpm build        # Build for production
pnpm start        # Start production server
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```bash
# Database
DATABASE_URL="file:./dev.db"

# API Server
API_PORT=4000
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"

# Git Integration
GIT_SCAN_PATHS="/Users/username/Projects,/Users/username/Workspace"
GIT_SCAN_DEPTH=2
```

### Git Scan Paths

Configure which directories to scan for repositories:

- **Single path**: `GIT_SCAN_PATHS="/Users/username/Projects"`
- **Multiple paths**: `GIT_SCAN_PATHS="/Users/username/Projects,/Users/username/Work"`
- **Scan depth**: `GIT_SCAN_DEPTH=2` (how many levels deep to search)

## 📂 Project Structure

```
indie-dev-portal/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main dashboard
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── dashboard/        # Dashboard-specific components
│   ├── ui/               # Reusable UI components (shadcn)
│   └── providers/        # React context providers
├── api/                   # Express API
│   ├── server.ts         # API entry point
│   ├── repos.ts          # Repository endpoints
│   ├── commits.ts        # Commit endpoints
│   └── transformers.ts   # Data transformation
├── lib/                   # Utilities
│   ├── gitService.ts     # Git integration service
│   ├── gitUtils.ts       # API fetch functions
│   ├── repoActions.ts    # Repository actions
│   └── prisma.ts         # Prisma client
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration files
├── scripts/              # Utility scripts
│   ├── sync-git-repos.ts # Git sync script
│   ├── seed.ts           # Database seeding
│   ├── test-api.ts       # API tests
│   └── clean-mock-data.ts # Mock data cleanup
├── types/                # TypeScript types
│   └── git.ts            # Git-related types
├── data/                 # Mock data (optional)
│   ├── repos.json
│   └── commits.json
└── docs/                 # Documentation
    ├── GIT_INTEGRATION.md
    └── FUNCTIONAL_SPEC.md
```

## 🎯 Key Features Explained

### Git Integration

The dashboard automatically scans your filesystem for git repositories and extracts:

- **Primary Language**: Detected by analyzing file extensions
- **Frameworks**: Identified from config files and package.json
- **CI/CD Status**: Detected from workflow files
- **Commit History**: Parsed from git log
- **Description**: Extracted from package.json or README

### Repository Actions

- **VS Code**: Opens repo using `vscode://file/` protocol
- **Finder**: Opens folder using `file://` protocol
- **Diff**: Opens VS Code git diff view
- **Notes**: Persistent notes stored in database

### Search & Filter

- **Search**: Real-time search across name, slug, and description
- **Language Filter**: Filter by primary programming language
- **Sort Options**: Last opened, name, or commit frequency
- **Pagination**: 6 repositories per page

## 🔄 Workflow

### Initial Setup

1. Configure `GIT_SCAN_PATHS` in `.env`
2. Run `pnpm git:sync` to discover repositories
3. Start dashboard with `pnpm dev`
4. Browse your repositories at `http://localhost:3000`

### Regular Updates

Run `pnpm git:sync` periodically to:

- Pick up new repositories
- Update metadata for existing repos
- Refresh commit history
- Detect framework changes

### Data Management

- **User data preserved**: Notes and lastOpenedAt are never overwritten
- **Metadata updated**: Languages, frameworks, and commits refresh on sync
- **Coexistence**: Real and mock data can coexist in the database

## 🧪 Testing

### API Tests

```bash
pnpm test:api
```

Tests all endpoints:

- Health check
- Repository listing
- Single repository fetch
- Commits query
- Notes update

### Manual Testing

1. Search for repositories
2. Filter by language
3. Sort by different criteria
4. Navigate pagination
5. Test quick actions (VS Code, Finder, Diff, Notes)
6. Toggle theme
7. Refresh data

## 🐛 Troubleshooting

### No Repositories Found

- Check `GIT_SCAN_PATHS` is set correctly in `.env`
- Verify paths exist and contain git repositories
- Ensure read permissions on scan paths

### VS Code Protocol Not Working

- Ensure VS Code is installed
- Try Chrome/Edge (better protocol support)
- Check browser console for errors

### Slow Scanning

- Reduce `GIT_SCAN_DEPTH`
- Scan fewer directories
- Exclude large monorepos

### Port Already in Use

```bash
# Kill processes on ports 3000 and 4000
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

## 🚧 Known Limitations

1. **No Real-Time Updates**: Requires manual sync to pick up changes
2. **Local Only**: Only scans local filesystem, no remote repos
3. **No Branch Info**: Doesn't track branches or branch status
4. **Basic CI Detection**: Only detects presence, not actual status

## 🗺️ Roadmap

- [ ] Filesystem watching for automatic updates
- [ ] Git hooks for real-time commit tracking
- [ ] Branch detection and management
- [ ] Remote repository integration (GitHub/GitLab API)
- [ ] Repository health metrics
- [ ] Dependency vulnerability scanning
- [ ] Code statistics (LOC, contributors)
- [ ] Commit graph visualization

## 🤝 Contributing

This project was built with AI pair programming using Windsurf Cascade. See [AGENTS.md](AGENTS.md) for the multi-agent collaboration workflow.

## 📄 License

MIT

## 🙏 Acknowledgments

- Design inspiration from modern developer tools
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Color palette from [Catppuccin](https://github.com/catppuccin)

---

**Built with ❤️ using AI-first development**
