import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ContributionDay {
  date: string; // ISO 8601 format (YYYY-MM-DD)
  count: number;
}

/**
 * Fetches aggregated commit contributions for the past 365 days.
 * Returns a sparse array of dates with commit counts.
 */
export async function getContributionHeatmap(): Promise<ContributionDay[]> {
  // Calculate date range (365 days ago to today)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365);

  // Query commits within date range, grouped by date
  const commits = await prisma.commit.findMany({
    where: {
      committedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      committedAt: true,
    },
    orderBy: {
      committedAt: 'asc',
    },
  });

  // Aggregate commits by calendar date
  const contributionMap = new Map<string, number>();

  for (const commit of commits) {
    // Extract date in YYYY-MM-DD format (local timezone)
    const dateKey = commit.committedAt.toISOString().split('T')[0];
    contributionMap.set(dateKey, (contributionMap.get(dateKey) || 0) + 1);
  }

  // Convert map to array of ContributionDay objects
  const contributions: ContributionDay[] = Array.from(contributionMap.entries()).map(
    ([date, count]) => ({
      date,
      count,
    })
  );

  return contributions;
}

/**
 * Gets the total contribution count for the past 365 days.
 */
export async function getTotalContributions(): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365);

  const count = await prisma.commit.count({
    where: {
      committedAt: {
        gte: startDate,
      },
    },
  });

  return count;
}
