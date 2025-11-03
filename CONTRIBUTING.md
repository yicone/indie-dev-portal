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

## Making Changes

### Branching Strategy

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

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

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

### Scope (Optional)

The scope should be the name of the affected module or component:

- `api`: Backend API
- `ui`: User interface
- `db`: Database
- `git`: Git integration
- `agent`: AI agent features
- `docs`: Documentation

### Examples

```bash
# Feature
git commit -m "feat(agent): add streaming response support"

# Bug fix
git commit -m "fix(api): correct session status transition logic"

# Documentation
git commit -m "docs: update contribution guidelines"

# Breaking change
git commit -m "feat(api): redesign authentication flow

BREAKING CHANGE: API endpoints now require JWT tokens"
```

### Commit Message Validation

Commits are automatically validated using commitlint. Invalid commit messages will be rejected.

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

### PR Description Template

When you open a PR, please fill out the template:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How to test these changes

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] Added tests
- [ ] All tests pass
```

### Review Process

1. **Automated checks** must pass (linting, tests, build)
2. **Code review** by at least one maintainer
3. **Changes requested** may require updates
4. **Approval** and merge by maintainer

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises
- Avoid `any` type - use proper types or `unknown`
- Use functional components with hooks (React)

### Naming Conventions

- **Files**: `camelCase.ts` for utilities, `PascalCase.tsx` for components
- **Variables**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`
- **Functions**: `camelCase`

### Code Organization

```typescript
// 1. Imports (external, then internal)
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component/Function
export function MyComponent({ title }: Props) {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Functions
  const handleClick = () => {
    // ...
  };

  // 6. Render
  return <div>{title}</div>;
}
```

### Formatting

We use Prettier for code formatting. Run before committing:

```bash
pnpm format:write
```

Configuration is in `.prettierrc`.

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests once (CI mode)
pnpm test:run
```

### Writing Tests

- Place tests next to the code: `myModule.test.ts`
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies

Example:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myFunction', () => {
  it('should return expected result', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

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
