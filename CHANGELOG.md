# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-25

### Added

- **Real Git Integration**: Automatic repository discovery and metadata extraction
  - Scans local filesystem for git repositories
  - Detects 10+ programming languages automatically
  - Identifies 20+ frameworks from config files
  - Parses commit history with full details
  - CI/CD configuration detection

- **Dashboard Features**:
  - Repository overview with search and filter
  - Sort by name, last opened, or commit frequency
  - Pagination (6 repos per page)
  - Real-time data fetching with React Query

- **Quick Actions**:
  - Open in VS Code (`vscode://` protocol)
  - Open in Finder (`file://` protocol)
  - View git diff
  - Add and edit project notes

- **Modern UI**:
  - Light/Dark theme toggle (Catppuccin palette)
  - Responsive design for all screen sizes
  - Smooth animations and transitions
  - WCAG compliant accessibility
  - Keyboard navigation support

- **Data Management**:
  - SQLite database with Prisma ORM
  - REST API with Express
  - Automatic data sync via `pnpm git:sync`

### Technical

- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS + shadcn/ui components
- React Query for data fetching
- simple-git for git operations
- Prisma for database management

## [Unreleased]

### Planned

See [ROADMAP.md](docs/ROADMAP.md) for future plans and known limitations.

---

**Note**: This project reached production-ready status with version 1.0.0. All core features are implemented and tested.
