# Personal Developer Dashboard

A modern, AI-first developer dashboard that surfaces your local git repositories, recent commits, and quick actions at a glance.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Highlights

- 🔍 **Real Git Integration** - Automatic repository discovery and metadata extraction
- 📊 **Smart Dashboard** - Search, filter, and sort your projects
- 🎯 **Quick Actions** - Open in VS Code, view diffs, add notes
- 🎨 **Modern UI** - Light/Dark themes with smooth animations
- ⚡ **Fast & Local** - SQLite database, no cloud dependencies

[See complete feature list →](openspec/project.md)

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Setup database
pnpm db:generate && pnpm db:migrate

# 3. Configure git scanning
cp .env.example .env
# Edit .env: Set GIT_SCAN_PATHS to your project directories

# 4. Sync repositories
pnpm git:sync

# 5. Start development
pnpm dev
```

Open <http://localhost:3000> to view the dashboard.

[Detailed setup guide →](docs/QUICKSTART.md)

## 📖 Documentation

### For Users

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get running in 5 minutes
- **[Git Integration Guide](docs/GIT_INTEGRATION.md)** - How repository scanning works
- **[Roadmap & Limitations](docs/ROADMAP.md)** - Future plans and current limitations

### For Developers

- **[Project Conventions](openspec/project.md)** - Tech stack, data inputs, and development workflow
- **[OpenSpec Workflow](openspec/AGENTS.md)** - Spec-driven development process
- **[Agent Collaboration](AGENTS.md)** - AI agent entry point
- **[Changelog](CHANGELOG.md)** - Version history

### For Contributors

- **[Documentation Index](docs/README.md)** - All supplementary documentation
- **[OpenSpec Lessons](docs/openspec-lessons-learned.md)** - Best practices and lessons learned
- **[Fixes Index](docs/FIXES_INDEX.md)** - Bug fixes and improvements

## 🛠️ Tech Stack

**Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, React Query  
**Backend**: Express, Prisma, SQLite, simple-git  
**Development**: ESLint, Prettier, Husky

## 📝 Key Commands

```bash
pnpm dev          # Start development servers
pnpm git:sync     # Sync git repositories
pnpm db:migrate   # Run database migrations
pnpm lint         # Run linting
```

[See detailed setup guide →](docs/QUICKSTART.md)

## 🔧 Configuration

Key environment variables in `.env`:

```bash
GIT_SCAN_PATHS="/Users/username/Projects,/Users/username/Workspace"
GIT_SCAN_DEPTH=2
DATABASE_URL="file:./dev.db"
```

[See setup guide for details →](docs/QUICKSTART.md)

## 🔄 How It Works

1. **Scan**: Configure paths in `.env`, run `pnpm git:sync`
2. **Discover**: Automatically finds git repositories and extracts metadata
3. **Browse**: View all projects in the dashboard at `localhost:3000`
4. **Update**: Run `pnpm git:sync` periodically to refresh data

[Learn more about git integration →](docs/GIT_INTEGRATION.md)

## 🐛 Troubleshooting

**Common issues**:

- No repositories found? Check `GIT_SCAN_PATHS` in `.env`
- VS Code not opening? Ensure VS Code is installed and try Chrome/Edge
- Slow scanning? Reduce `GIT_SCAN_DEPTH` or scan fewer directories

[See troubleshooting guide →](docs/QUICKSTART.md#troubleshooting)

## 🚧 Known Limitations

- **No Real-Time Updates**: Requires manual `pnpm git:sync` to refresh
- **Local Repositories Only**: No GitHub/GitLab integration yet
- **Browser Restrictions**: Some protocols may be blocked

[See complete list and workarounds →](docs/ROADMAP.md#known-limitations)

## 🗺️ Roadmap

**Short-term**: Branch detection, unit tests, improved search  
**Mid-term**: GitHub API, file watcher, commit graphs  
**Long-term**: Multi-user support, CI/CD integration

[View detailed roadmap →](docs/ROADMAP.md)

## 🤝 Contributing

This project was built with AI pair programming using Windsurf Cascade.

**For Contributors**:

- **AI Agents**: See [AGENTS.md](AGENTS.md) for OpenSpec workflow entry point
- **OpenSpec Process**: Follow [OpenSpec Workflow](openspec/AGENTS.md) for spec-driven development
- **Project Rules**: Review [.windsurfrules](.windsurfrules) for project conventions
- **Code Style**: Run `pnpm lint` and `pnpm format:write` before committing

**Documentation Standards**:

- **Specifications**: All specs in `openspec/specs/` and `openspec/changes/`
- **Supplementary Docs**: Testing guides, migration docs in `docs/`
- **SSOT Principle**: Every piece of information has one authoritative source
- **Entry Points**: Start with `AGENTS.md`, `openspec/project.md`, or `docs/README.md`

[OpenSpec lessons learned →](docs/openspec-lessons-learned.md)

## 📄 License

MIT

## 🙏 Acknowledgments

- Design inspiration from modern developer tools
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Color palette from [Catppuccin](https://github.com/catppuccin)

---

**Built with ❤️ using AI-first development**
