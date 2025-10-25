# Personal Developer Dashboard - Functional Specification

## Overview

The Personal Developer Dashboard is a Next.js 15 application that provides developers with a centralized view of their local repositories, recent commits, and quick actions. This document outlines the functional behavior implemented in the application.

## Core Features

### 1. Repository Dashboard

**Location**: `app/page.tsx`

**Functionality**:

- Displays all repositories from the SQLite database
- Real-time data fetching via React Query with 30-second stale time
- Automatic retry on failure (2 retries)
- Loading states with skeleton UI
- Error states with retry functionality
- Empty states when no repos match filters

**Data Flow**:

```
SQLite DB → Prisma → Express API → React Query → UI Components
```

### 2. Search & Filtering

**Search**:

- Real-time search across repo name, slug, and description
- Case-insensitive matching
- Resets pagination to page 1 on search

**Language Filter**:

- Dropdown with "All Languages" + detected languages from repos
- Filters by `primaryLanguage` field
- Resets pagination on filter change

**Sorting Options**:

- **Last Opened**: Sort by `lastOpenedAt` (most recent first)
- **Name**: Alphabetical sort by repo name
- **Commit Frequency**: Sort by commits per day (highest first)

### 3. Pagination

**Configuration**:

- Page size: 6 repositories per page
- Shows "X-Y of Z repositories"
- Previous/Next navigation buttons
- Disabled states when on first/last page

### 4. Repository Actions

**VS Code Button**:

- Opens repository in VS Code using `vscode://file/{repoPath}` protocol
- Requires VS Code to be installed

**Folder Button**:

- Opens repository folder in Finder (macOS)
- Uses `file://{repoPath}` protocol
- May be blocked by browser security in some browsers

**Diff Button**:

- Opens VS Code with git diff view
- Uses `vscode://file/{repoPath}?command=git.viewChanges`

**Notes Button**:

- Opens modal dialog for editing repository notes
- Saves to database via PATCH `/repos/:slug/notes`
- Invalidates React Query cache on success
- Shows loading/error states

### 5. Data Persistence

**Database**: SQLite (`dev.db`)

**Models**:

- `Repo`: Repository metadata with frameworks stored as JSON string
- `Commit`: Commit history linked to repos

**Seeding**:

```bash
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed from data/*.json
```

### 6. API Endpoints

**Base URL**: `http://localhost:4000`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/repos` | GET | List all repos with 5 recent commits |
| `/repos/:slug` | GET | Get single repo with 10 recent commits |
| `/repos/:slug/notes` | PATCH | Update repo notes |
| `/commits` | GET | Get commits for repo (query: `repoSlug`, `limit`) |

**Framework Serialization**:

- Stored as JSON string in SQLite
- Parsed in `api/transformers.ts`
- Returned as string array to frontend

### 7. Theme Support

**Themes**: Light & Dark (Catppuccin palette)

**Toggle**: Header button switches between themes

- Persists via `next-themes`
- Smooth transitions on all components

### 8. Error Handling

**API Errors**:

- Displayed via `ErrorState` component
- Shows error message if available
- Retry button refetches data

**Network Errors**:

- React Query automatic retry (2 attempts)
- Error boundary catches unhandled errors

**Validation**:

- Zod schemas validate API responses
- Type-safe throughout the stack

## Testing

### API Tests

Run diagnostic tests:

```bash
pnpm test:api
```

Tests all endpoints including:

- Health check
- Repository listing
- Single repository fetch
- Commits query
- Notes update

### Manual Testing Checklist

- [ ] Search filters repos correctly
- [ ] Language filter works
- [ ] All three sort options work
- [ ] Pagination navigates correctly
- [ ] Refresh button refetches data
- [ ] Theme toggle switches themes
- [ ] VS Code button opens repo (if VS Code installed)
- [ ] Notes dialog saves and displays
- [ ] Error state shows on API failure
- [ ] Loading skeleton displays during fetch

## Development Workflow

### Start Development

```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Start dev servers (Next.js + Express)
pnpm dev
```

### Code Quality

```bash
# Lint
pnpm lint

# Type check
pnpm typecheck

# Format
pnpm format:write
```

## Architecture Notes

### State Management

- React Query for server state
- Local React state for UI (search, filters, pagination)
- No global state library needed

### Type Safety

- Shared types in `types/git.ts`
- Prisma-generated types for database
- Zod validation for API boundaries

### Performance

- React Query caching (30s stale time)
- Pagination limits data rendering
- Optimistic updates for notes

### Accessibility

- Semantic HTML throughout
- ARIA labels on icon buttons
- Keyboard navigation support
- Focus management in dialogs

## Known Limitations

1. **Browser Protocols**: `vscode://` and `file://` may be blocked by browser security
2. **Local Only**: No remote git operations, purely local data
3. **Single User**: No authentication or multi-user support
4. **Mock Data**: Uses seeded data, not live git parsing

## Future Enhancements

- Real git integration (parse actual repos)
- GitHub/GitLab API integration
- Commit graph visualization
- Branch management
- CI/CD status webhooks
- Repository health metrics
