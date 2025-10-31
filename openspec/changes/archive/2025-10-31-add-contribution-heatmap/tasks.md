# Implementation Tasks

## 1. Backend Implementation

- [x] 1.1 Create contribution service (`api/services/contributionService.ts`)
  - [x] Implement date aggregation logic for past 365 days
  - [x] Query commits grouped by date using Prisma
  - [x] Return sparse array of `{ date, count }` objects
- [x] 1.2 Add heatmap API endpoint (`api/server.ts`)
  - [x] Register `GET /api/contributions/heatmap` route
  - [x] Add error handling and validation
  - [x] Test endpoint with curl/Postman
- [x] 1.3 Optimize database query performance
  - [x] Verify `committedAt` index usage
  - [x] Test query performance with sample data (1000+ commits)

## 2. Frontend Types and Utilities

- [x] 2.1 Create heatmap types (`types/heatmap.ts`)
  - [x] Define `ContributionDay` interface
  - [x] Define `HeatmapData` interface
  - [x] Export color intensity levels enum
- [x] 2.2 Create heatmap utilities (`lib/heatmapUtils.ts`)
  - [x] Implement date range generator (365 days)
  - [x] Implement color intensity mapper (5 levels)
  - [x] Implement week/month label generators
  - [x] Add timezone-aware date formatting
- [x] 2.3 Add data fetching utility (`lib/contributionApi.ts`)
  - [x] Create `fetchContributions` function using fetch
  - [x] Add TypeScript types for API response

## 3. Heatmap Component

- [x] 3.1 Create base component (`components/dashboard/ContributionHeatmap.tsx`)
  - [x] Set up React Query hook for data fetching
  - [x] Implement loading skeleton state
  - [x] Implement error state with retry button
- [x] 3.2 Implement heatmap grid rendering
  - [x] Generate 7×53 grid structure
  - [x] Map contribution data to cells
  - [x] Apply Catppuccin color classes based on intensity
  - [x] Add proper spacing and alignment
- [x] 3.3 Add month labels component
  - [x] Calculate month positions
  - [x] Render month abbreviations (Jan, Feb, etc.)
  - [x] Align labels with grid columns
- [x] 3.4 Add day labels component
  - [x] Render Mon, Wed, Fri labels
  - [x] Align labels with grid rows
  - [x] Apply muted text styling
- [x] 3.5 Add contribution summary
  - [x] Calculate total from data
  - [x] Display "X contributions in the last year" text
  - [x] Style using existing typography

## 4. Interactive Features

- [x] 4.1 Implement tooltip component
  - [x] Use shadcn/ui Tooltip primitive
  - [x] Format date as "Month Day, Year"
  - [x] Display "X contributions" or "No contributions"
  - [x] Add 200ms hover delay
  - [x] Handle edge positioning
- [x] 4.2 Add hover states
  - [x] Subtle scale/opacity effect on cell hover
  - [x] Maintain accessibility (keyboard navigation)

## 5. Responsive Design

- [x] 5.1 Desktop layout (≥1024px)
  - [x] Full 53-week grid
  - [x] 12px × 12px cells with 2px gaps
  - [x] Proper container width
- [x] 5.2 Tablet layout (768px-1023px)
  - [x] Proportional scaling
  - [x] Maintain readability
- [x] 5.3 Mobile layout (<768px)
  - [x] Show recent 26 weeks by default
  - [x] Enable horizontal scroll for full view
  - [x] Minimum 10px × 10px touch targets

## 6. Dashboard Integration

- [x] 6.1 Update dashboard page (`app/page.tsx`)
  - [x] Import ContributionHeatmap component
  - [x] Position below DashboardHeader
  - [x] Add proper spacing/margins
  - [x] Ensure layout doesn't break existing components
- [x] 6.2 Configure React Query
  - [x] Set 5-minute cache time
  - [x] Add date-based cache key
  - [x] Configure stale time appropriately

## 7. Testing and Validation

- [x] 7.1 Test with various data scenarios
  - [x] Empty state (no commits)
  - [x] Sparse data (few commits)
  - [x] Dense data (many commits)
  - [x] Edge dates (today, 365 days ago)
- [x] 7.2 Cross-browser testing
  - [x] Chrome/Edge
  - [x] Firefox
  - [x] Safari
- [x] 7.3 Responsive testing
  - [x] Desktop (1920px, 1440px, 1024px)
  - [x] Tablet (768px, 1023px)
  - [x] Mobile (375px, 414px)
- [x] 7.4 Performance testing
  - [x] Measure initial load time
  - [x] Verify query performance (<100ms)
  - [x] Check React Query caching behavior

## 8. Documentation and Polish

- [x] 8.1 Add JSDoc comments to utilities
- [x] 8.2 Verify Catppuccin color consistency
  - [x] Compare with existing ProjectCard colors
  - [x] Ensure proper theme support (light/dark)
- [x] 8.3 Run linter and formatter
  - [x] `pnpm lint`
  - [x] `pnpm format:write`
- [x] 8.4 Update README if needed
  - [x] Document new feature
  - [x] Add screenshot

## 9. Final Validation

- [x] 9.1 Run full test suite
- [x] 9.2 Verify against prototype design system
- [x] 9.3 Test with real git data (`pnpm git:sync`)
- [x] 9.4 Confirm no console errors or warnings
- [x] 9.5 Validate OpenSpec compliance
  - [x] Run `openspec validate add-contribution-heatmap --strict`
  - [x] Ensure all requirements are met
