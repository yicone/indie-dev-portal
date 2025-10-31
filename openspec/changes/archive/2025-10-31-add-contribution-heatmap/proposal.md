# Add Contribution Heatmap

## Why

Users need a visual overview of their development activity across all repositories to identify patterns, track consistency, and celebrate productivity milestones. A GitHub-style contribution heatmap provides an intuitive, at-a-glance view of commit frequency over the past year.

## What Changes

- Add a new `ContributionHeatmap` component displaying aggregated commit activity across all repositories
- Position the heatmap at the top of the dashboard, below the header and above the project grid
- Implement a 365-day calendar grid (7 rows × 53 columns) with color intensity representing commit frequency
- Add hover tooltips showing exact date and commit count for each day
- Fetch and aggregate commit data from all repositories via a new API endpoint
- Style the heatmap using Catppuccin color palette to match existing UI design
- Display total contribution count for the year alongside the heatmap

## Impact

### Affected Specs

- **NEW**: `contribution-heatmap` - Core heatmap visualization and data aggregation

### Affected Code

- **Frontend**:
  - New component: `components/dashboard/ContributionHeatmap.tsx`
  - New utility: `lib/heatmapUtils.ts` (date calculations, color mapping)
  - Modified: `app/page.tsx` (integrate heatmap into dashboard layout)
  - New types: `types/heatmap.ts` (contribution data structures)

- **Backend**:
  - New endpoint: `GET /api/contributions/heatmap` (aggregate commits by date)
  - New utility: `api/services/contributionService.ts` (data aggregation logic)
  - Modified: `api/server.ts` (register new route)

- **Database**:
  - No schema changes required (uses existing `Commit` model with `committedAt` index)

### Dependencies

- No new external dependencies required
- Leverages existing `@tanstack/react-query` for data fetching
- Uses existing Tailwind + shadcn/ui styling system
