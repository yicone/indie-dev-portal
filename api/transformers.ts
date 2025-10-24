import type { Commit, Repo } from "@prisma/client";

export type CommitResponse = {
  id: number;
  hash: string;
  message: string;
  author: string;
  committedAt: string;
  repoSlug: string;
};

type CIStatusValue = "passing" | "failing" | "pending" | "none";

export type RepoResponse = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  repoPath: string;
  primaryLanguage: string;
  frameworks: string[];
  ciStatus: CIStatusValue;
  lastOpenedAt: string | null;
  notes: string | null;
  stars: number;
  updatedAt: string;
  createdAt: string;
  commits: CommitResponse[];
};

export const transformCommit = (
  commit: Commit,
  repoSlug: string,
): CommitResponse => ({
  id: commit.id,
  hash: commit.hash,
  message: commit.message,
  author: commit.author,
  committedAt: commit.committedAt.toISOString(),
  repoSlug,
});

export const transformRepo = (
  repo: Repo & { commits?: Commit[] },
): RepoResponse => ({
  id: repo.id,
  name: repo.name,
  slug: repo.slug,
  description: repo.description ?? null,
  repoPath: repo.repoPath,
  primaryLanguage: repo.primaryLanguage,
  frameworks: parseFrameworks((repo as RepoWithMeta).frameworks ?? repo.frameworks),
  ciStatus: (repo as RepoWithMeta).ciStatus ?? "pending",
  lastOpenedAt: parseDate((repo as RepoWithMeta).lastOpenedAt ?? null),
  notes: (repo as RepoWithMeta).notes ?? null,
  stars: repo.stars,
  updatedAt: repo.updatedAt.toISOString(),
  createdAt: repo.createdAt.toISOString(),
  commits: (repo.commits ?? []).map((commit) => transformCommit(commit, repo.slug)),
});

type RepoWithMeta = Repo & {
  frameworks?: string | string[] | null;
  lastOpenedAt?: Date | string | null;
  notes?: string | null;
  ciStatus?: CIStatusValue | null;
};

function parseFrameworks(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch (error) {
      console.warn("Failed to parse frameworks JSON", error);
      return [];
    }
  }

  return [];
}

function parseDate(value: Date | string | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
