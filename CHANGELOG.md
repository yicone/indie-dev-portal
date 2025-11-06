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

## [1.1.0] - 2025-11-06

### Added

- **Chat with Repos**: AI-powered coding assistant with repository context
  - Repository-aware chat sessions with automatic context loading
  - Session management with inline editing and archiving
  - Quick session creation with repository filtering
  - Compact message display with syntax highlighting
  - Real-time streaming responses via WebSocket
  - Agent and model selection (currently supports Gemini CLI)
  - Session search and filtering by repository
  - Archive/unarchive sessions for better organization

- **Open Source Preparation**: Prepared project for open source release
  - Rebranded to "DevDesk" with new tagline
  - Added AGPL-3.0 license
  - Created comprehensive CONTRIBUTING.md guide
  - Added CODE_OF_CONDUCT.md (Contributor Covenant v2.1)
  - Added SECURITY.md with vulnerability reporting process
  - Added GitHub issue templates (bug report, feature request)
  - Added GitHub pull request template
  - Configured commitlint for commit message validation
  - Added commit message template (.gitmessage)
  - Updated package.json with repository metadata
  - Added NOTICE file documenting third-party licenses

- **Documentation System**: Complete documentation management framework
  - Comprehensive documentation structure in `docs/`
  - OpenSpec workflow for spec-driven development
  - SSOT (Single Source of Truth) principle implementation
  - Hybrid approach (index + detailed files) for AI optimization
  - Audience-oriented organization (Users/Developers/Contributors)
  - Progressive disclosure pattern (summaries + links)

### Changed

- **Project Name**: Renamed from "Personal Developer Dashboard" to "DevDesk"
- **License**: Changed to AGPL-3.0 (copyleft)
- **Documentation**: Restructured for better organization and AI agent compatibility

### Planned

See [ROADMAP.md](docs/ROADMAP.md) for future plans and known limitations.

---

**Note**: This project reached production-ready status with version 1.0.0. All core features are implemented and tested.
