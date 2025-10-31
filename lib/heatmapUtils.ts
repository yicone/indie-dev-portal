import type { ContributionDay, HeatmapCell, ContributionLevel } from '@/types/heatmap';

/**
 * Generates a 365-day date range ending today
 */
export function generateDateRange(): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }

  return dates;
}

/**
 * Maps commit count to color intensity level (0-4)
 */
export function getContributionLevel(count: number): ContributionLevel {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

/**
 * Returns Tailwind CSS class for contribution intensity
 */
export function getIntensityClass(level: ContributionLevel): string {
  const classes = [
    'bg-surface0/60', // 0: no activity
    'bg-green/20', // 1: low (1-2 commits)
    'bg-green/40', // 2: medium (3-5 commits)
    'bg-green/60', // 3: high (6-9 commits)
    'bg-green/80', // 4: very high (10+ commits)
  ];

  return classes[level] || classes[0];
}

/**
 * Converts contribution data array to a map for quick lookup
 */
export function createContributionMap(data: ContributionDay[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const item of data) {
    map.set(item.date, item.count);
  }

  return map;
}

/**
 * Generates heatmap cells with contribution data
 */
export function generateHeatmapCells(data: ContributionDay[]): HeatmapCell[] {
  const dates = generateDateRange();
  const contributionMap = createContributionMap(data);

  return dates.map((date) => {
    const dateKey = date.toISOString().split('T')[0];
    const count = contributionMap.get(dateKey) || 0;
    const intensity = getContributionLevel(count);

    return {
      date,
      count,
      intensity,
    };
  });
}

/**
 * Organizes cells into weeks (7 days each)
 */
export function organizeIntoWeeks(cells: HeatmapCell[]): HeatmapCell[][] {
  const weeks: HeatmapCell[][] = [];

  // Create a copy to avoid mutating the original array
  const paddedCells = [...cells];

  // Pad the beginning to start on Sunday
  const firstDate = paddedCells[0]?.date;
  if (firstDate) {
    const dayOfWeek = firstDate.getDay(); // 0 = Sunday
    const paddingDays = dayOfWeek;

    // Add empty cells for padding at the beginning
    const startPadding: HeatmapCell[] = [];
    for (let i = 0; i < paddingDays; i++) {
      const paddingDate = new Date(firstDate);
      paddingDate.setDate(paddingDate.getDate() - (paddingDays - i));
      startPadding.push({
        date: paddingDate,
        count: 0,
        intensity: 0,
      });
    }
    paddedCells.unshift(...startPadding);
  }

  // Pad the end to complete the last week
  const lastDate = paddedCells[paddedCells.length - 1]?.date;
  if (lastDate) {
    const dayOfWeek = lastDate.getDay(); // 0 = Sunday
    const paddingDays = 6 - dayOfWeek; // Days needed to reach Saturday

    // Add empty cells for padding at the end
    for (let i = 1; i <= paddingDays; i++) {
      const paddingDate = new Date(lastDate);
      paddingDate.setDate(paddingDate.getDate() + i);
      paddedCells.push({
        date: paddingDate,
        count: 0,
        intensity: 0,
      });
    }
  }

  // Group into weeks
  for (let i = 0; i < paddedCells.length; i += 7) {
    weeks.push(paddedCells.slice(i, i + 7));
  }

  return weeks;
}

/**
 * Generates month labels with positions (GitHub-style)
 * Shows a month label on the week that contains the 1st day of that month
 */
export function getMonthLabels(cells: HeatmapCell[]): Array<{ label: string; weekIndex: number }> {
  const labels: Array<{ label: string; weekIndex: number }> = [];
  const weeks = organizeIntoWeeks(cells);
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  weeks.forEach((week, weekIndex) => {
    // Check if this week contains the 1st day of any month
    for (const cell of week) {
      if (cell.date.getDate() === 1) {
        const month = cell.date.getMonth();
        labels.push({
          label: monthNames[month],
          weekIndex,
        });
        break; // Only one label per week
      }
    }
  });

  return labels;
}

/**
 * Formats date for tooltip display
 */
export function formatTooltipDate(date: Date): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * Formats contribution count for tooltip
 */
export function formatContributionText(count: number): string {
  if (count === 0) return 'No contributions';
  if (count === 1) return '1 contribution';
  return `${count} contributions`;
}
