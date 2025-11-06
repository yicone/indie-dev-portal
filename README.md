# DevDesk

A local-first multi-repo workspace for developers.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue)

## ✨ Highlights

- 🔍 **Real Git Integration** - Automatic repository discovery and metadata extraction
- 📊 **Smart Dashboard** - Search, filter, and sort your projects
- 🤖 **Chat with Repos** - AI-powered coding assistant with repository context (powered by Gemini CLI)
- 🎯 **Quick Actions** - Open in VS Code, view diffs, add notes
- 🎨 **Modern UI** - Light/Dark themes with smooth animations
- ⚡ **Fast & Local** - SQLite database, no cloud dependencies

[See complete feature list →](openspec/project.md)

## 🚀 Quick Start

For complete setup instructions, see **[Quick Start Guide](docs/QUICKSTART.md)**.

```bash
# Quick setup
pnpm install && cp .env.example .env
pnpm db:generate && pnpm db:migrate
pnpm git:sync && pnpm dev
```

Open <http://localhost:3000> to view the dashboard.

## 📖 Documentation

### For Users

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get running in 5 minutes
- **[Git Integration Guide](docs/GIT_INTEGRATION.md)** - How repository scanning works
- **[Roadmap & Limitations](docs/ROADMAP.md)** - Future plans and current limitations

### For Contributors

- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to this project
- **[Project Conventions](openspec/project.md)** - Tech stack, architecture, and development workflow
- **[Feature Specifications](openspec/specs/)** - Current feature specs and requirements
- **[OpenSpec Workflow](openspec/AGENTS.md)** - Spec-driven development process
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines
- **[Changelog](CHANGELOG.md)** - Version history

### For AI Agents

- **[Agent Collaboration](AGENTS.md)** - AI agent entry point
- **[OpenSpec Lessons](docs/OPENSPEC_LESSONS_LEARNED.md)** - Best practices and lessons learned

## 🚽️ Tech Stack

**Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, React Query  
**Backend**: Express, Prisma, SQLite, simple-git  
**Development**: ESLint, Prettier, Husky

[See detailed architecture →](openspec/project.md#architecture-patterns)

## 📝 Key Commands

```bash
pnpm dev          # Start development servers
pnpm git:sync     # Sync git repositories
pnpm db:migrate   # Run database migrations
pnpm lint         # Run linting
```

## 🔧 Configuration

[See configuration details →](docs/QUICKSTART.md)

## 🔄 How It Works

1. **Scan**: Configure paths in `.env`, run `pnpm git:sync`
2. **Discover**: Automatically finds git repositories and extracts metadata
3. **Browse**: View all projects in the dashboard at `localhost:3000`
4. **Update**: Run `pnpm git:sync` periodically to refresh data

[Learn more →](docs/GIT_INTEGRATION.md)

## 🐛 Troubleshooting

**Common issues**:

- No repositories found? Check `GIT_SCAN_PATHS` in `.env`
- VS Code not opening? Ensure VS Code is installed and try Chrome/Edge
- Slow scanning? Reduce `GIT_SCAN_DEPTH` or scan fewer directories

[See troubleshooting guide →](docs/QUICKSTART.md#troubleshooting)

## 🚧 Known Limitations

[See limitations and workarounds →](docs/ROADMAP.md#known-limitations)

## 🗺️ Roadmap

**Short-term**: Agent Task Panel for real-time task monitoring, Multi-agent support (Codex CLI, Claude Code)  
**Mid-term**: Keyboard shortcuts, GitHub API integration, file watcher  
**Long-term**: Session export, advanced git operations

[View detailed roadmap →](docs/ROADMAP.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our [code style](CONTRIBUTING.md#code-style)
4. Write tests for your changes
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
6. Push to your fork and open a Pull Request

### Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

### Security

If you discover a security vulnerability, please follow our [Security Policy](SECURITY.md).

## 📄 License

AGPL-3.0 - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- Design inspiration from modern developer tools
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Color palette from [Catppuccin](https://github.com/catppuccin)

---

**Built with ❤️ using AI-first development**
