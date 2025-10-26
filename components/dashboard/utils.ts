import type { Commit } from '@/types/git';

export function calculateCommitFrequency(commits: Commit[]): number {
  if (commits.length === 0) return 0;

  const timestamps = commits
    .map((commit) => new Date(commit.committedAt).getTime())
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => a - b);

  if (timestamps.length <= 1) {
    return commits.length;
  }

  const earliest = timestamps[0];
  const latest = timestamps[timestamps.length - 1];
  const daysBetween = Math.max(1, (latest - earliest) / (1000 * 60 * 60 * 24));

  return commits.length / daysBetween;
}

export function parseLastOpened(value: string | null | undefined): number {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
