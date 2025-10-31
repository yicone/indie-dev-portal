# contribution-heatmap Specification

## Purpose

TBD - created by archiving change add-contribution-heatmap. Update Purpose after archive.

## Requirements

### Requirement: Heatmap Visualization

The system SHALL display a contribution heatmap showing aggregated commit activity across all repositories for the past 365 days in a calendar grid format.

#### Scenario: Display annual contribution grid

- **WHEN** the dashboard loads
- **THEN** the heatmap displays a 7-row (days of week) by 53-column (weeks) grid
- **AND** each cell represents one day
- **AND** cells are colored based on commit frequency using Catppuccin color palette
- **AND** the grid starts from 365 days ago and ends at today
- **AND** the current week is right-aligned

#### Scenario: Empty state for new users

- **WHEN** no commits exist in the database
- **THEN** all heatmap cells display the base color (no activity)
- **AND** the total contribution count shows "0 contributions in the last year"

#### Scenario: Partial year data

- **WHEN** commits exist for only some days in the past year
- **THEN** days with commits display appropriate color intensity
- **AND** days without commits display the base color
- **AND** the total reflects actual commit count

### Requirement: Color Intensity Mapping

The system SHALL use a 5-level color scale to represent commit frequency, consistent with the Catppuccin theme.

#### Scenario: Zero commits

- **WHEN** a day has 0 commits
- **THEN** the cell displays `bg-surface0/60` (base color)

#### Scenario: Low activity (1-2 commits)

- **WHEN** a day has 1-2 commits
- **THEN** the cell displays `bg-green/20` (light green)

#### Scenario: Medium activity (3-5 commits)

- **WHEN** a day has 3-5 commits
- **THEN** the cell displays `bg-green/40` (medium green)

#### Scenario: High activity (6-9 commits)

- **WHEN** a day has 6-9 commits
- **THEN** the cell displays `bg-green/60` (strong green)

#### Scenario: Very high activity (10+ commits)

- **WHEN** a day has 10 or more commits
- **THEN** the cell displays `bg-green/80` (intense green)

### Requirement: Interactive Tooltips

The system SHALL display a tooltip on hover showing the exact date and commit count for each day.

#### Scenario: Hover on active day

- **WHEN** user hovers over a cell with commits
- **THEN** a tooltip appears showing "X contributions on [Month Day, Year]"
- **AND** the tooltip uses the shadcn/ui Tooltip component
- **AND** the tooltip appears above the cell with a small delay (200ms)

#### Scenario: Hover on inactive day

- **WHEN** user hovers over a cell with 0 commits
- **THEN** a tooltip appears showing "No contributions on [Month Day, Year]"

#### Scenario: Tooltip positioning

- **WHEN** hovering near screen edges
- **THEN** the tooltip automatically adjusts position to remain visible

### Requirement: Month Labels

The system SHALL display month labels above the heatmap grid for orientation.

#### Scenario: Display month markers

- **WHEN** the heatmap renders
- **THEN** month labels (Jan, Feb, Mar, etc.) appear above the grid
- **AND** each label aligns with the first week of that month
- **AND** only months with visible weeks in the grid are labeled

### Requirement: Day Labels

The system SHALL display day-of-week labels on the left side of the heatmap grid.

#### Scenario: Display weekday labels

- **WHEN** the heatmap renders
- **THEN** labels for Mon, Wed, Fri appear on the left
- **AND** labels align with their corresponding rows
- **AND** labels use muted text color for visual hierarchy

### Requirement: Contribution Summary

The system SHALL display the total contribution count for the displayed time period.

#### Scenario: Show total contributions

- **WHEN** the heatmap renders
- **THEN** text displays "X contributions in the last year" above the grid
- **AND** the count reflects the sum of all commits in the 365-day period
- **AND** the text uses the existing typography styles

### Requirement: Data Aggregation

The system SHALL aggregate commit data from all repositories by date for heatmap display.

#### Scenario: Fetch aggregated data

- **WHEN** the dashboard requests heatmap data
- **THEN** the API endpoint `/api/contributions/heatmap` returns an array of objects
- **AND** each object contains `{ date: string, count: number }`
- **AND** dates are in ISO 8601 format (YYYY-MM-DD)
- **AND** only dates with commits are included (sparse array)

#### Scenario: Handle multiple commits per day

- **WHEN** multiple commits exist on the same date across different repositories
- **THEN** the count reflects the total number of commits for that date
- **AND** commits are grouped by calendar date in the user's timezone

#### Scenario: Date range filtering

- **WHEN** querying contribution data
- **THEN** the API only returns commits from the past 365 days
- **AND** the calculation uses the current date as the end point

### Requirement: Performance Optimization

The system SHALL efficiently query and cache contribution data to ensure fast dashboard load times.

#### Scenario: Database query optimization

- **WHEN** fetching contribution data
- **THEN** the query uses the existing `committedAt` index on the Commit table
- **AND** the query groups commits by date in a single database operation
- **AND** the query completes in under 100ms for typical datasets (< 10,000 commits)

#### Scenario: Client-side caching

- **WHEN** contribution data is fetched
- **THEN** React Query caches the result for 5 minutes
- **AND** subsequent dashboard visits within the cache window use cached data
- **AND** the cache key includes the date to invalidate daily

### Requirement: Responsive Layout

The system SHALL adapt the heatmap display for different screen sizes while maintaining readability.

#### Scenario: Desktop display

- **WHEN** viewing on desktop (≥1024px width)
- **THEN** the full 53-week grid is visible
- **AND** each cell is 12px × 12px with 2px gaps
- **AND** the heatmap spans the full dashboard width

#### Scenario: Tablet display

- **WHEN** viewing on tablet (768px-1023px width)
- **THEN** the grid scales proportionally to fit the container
- **AND** cell size reduces to maintain full grid visibility
- **AND** tooltips remain functional

#### Scenario: Mobile display

- **WHEN** viewing on mobile (< 768px width)
- **THEN** the heatmap displays the most recent 26 weeks (6 months)
- **AND** horizontal scrolling is enabled for the full year view
- **AND** cell size is at least 10px × 10px for touch targets

### Requirement: Loading State

The system SHALL display a loading skeleton while fetching contribution data.

#### Scenario: Initial load

- **WHEN** the dashboard is loading
- **THEN** a skeleton placeholder appears in the heatmap position
- **AND** the skeleton mimics the grid structure with pulsing animation
- **AND** the skeleton uses the existing SkeletonGrid pattern

### Requirement: Error Handling

The system SHALL gracefully handle errors when contribution data cannot be loaded.

#### Scenario: API failure

- **WHEN** the contribution API endpoint fails
- **THEN** an error message displays: "Unable to load contribution data"
- **AND** a retry button is provided
- **AND** the rest of the dashboard remains functional

#### Scenario: Empty response

- **WHEN** the API returns an empty array
- **THEN** the heatmap displays with all cells in base color
- **AND** the total shows "0 contributions in the last year"
- **AND** no error message is shown (valid empty state)
