# Contributing to DevDesk

Thank you for your interest in contributing to DevDesk! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/indie-dev-portal.git
   cd indie-dev-portal
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/yicone/indie-dev-portal.git
   ```

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher
- Git

### Installation

```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:generate
pnpm db:migrate

# Configure environment
cp .env.example .env
# Edit .env: Set GIT_SCAN_PATHS to your project directories

# Sync repositories (optional)
pnpm git:sync

# Start development server
pnpm dev
```

The application will be available at <http://localhost:3000>.

For detailed project structure, see [Project Structure](openspec/project.md#project-structure) in project conventions.

## Making Changes

### Branching Strategy

See [Git Workflow](openspec/project.md#git-workflow) in project conventions for our branching strategy and commit guidelines.

### Workflow

1. **Create a branch** from `main`:

   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our [code style](#code-style)

3. **Test your changes**:

   ```bash
   pnpm typecheck    # TypeScript compilation
   pnpm lint         # ESLint
   pnpm format       # Prettier
   pnpm test         # Unit tests
   ```

4. **Commit your changes** following [commit guidelines](#commit-guidelines)

5. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

For detailed commit conventions and examples, see [Git Workflow](openspec/project.md#git-workflow) in project conventions.

**Quick Reference**:

- Format: `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `spec`
- Commits are automatically validated using commitlint

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if applicable)
- [ ] Tests added/updated (if applicable)
- [ ] All tests pass locally
- [ ] No console errors or warnings
- [ ] Commit messages follow conventions

For PR template and review process details, see [Git Workflow](openspec/project.md#git-workflow) in project conventions.

## Code Style

For detailed code style guidelines, see [Code Style](openspec/project.md#code-style) in project conventions.

**Quick Reference**:

- Use TypeScript for all new code
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises
- Avoid `any` type
- Files: `camelCase.ts` for utilities, `PascalCase.tsx` for components
- Run `pnpm format:write` before committing

## Testing

For testing strategy and guidelines, see [Testing Strategy](openspec/project.md#testing-strategy) in project conventions.

**Quick Reference**:

- Place tests next to code: `*.test.ts`
- Run tests: `pnpm test`
- Follow AAA pattern: Arrange, Act, Assert

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Explain "why" not "what" in comments
- Keep comments up-to-date with code

### Project Documentation

- Update `README.md` for user-facing changes
- Update `docs/` for detailed guides
- Update `openspec/` for specifications

### OpenSpec Workflow

For significant changes, follow the OpenSpec workflow:

1. Create proposal: `openspec/changes/[change-id]/proposal.md`
2. Define tasks: `openspec/changes/[change-id]/tasks.md`
3. Write spec deltas: `openspec/changes/[change-id]/specs/`
4. Validate: `openspec validate [change-id] --strict`
5. Implement changes
6. Archive: Move to `openspec/changes/archive/`

See [OpenSpec documentation](openspec/AGENTS.md) for details.

## Getting Help

- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Report vulnerabilities via [SECURITY.md](SECURITY.md)

## License

By contributing, you agree that your contributions will be licensed under the AGPL-3.0 License.

---

Thank you for contributing to DevDesk! 🚀
