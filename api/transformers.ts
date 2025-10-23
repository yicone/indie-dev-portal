import type { Commit, Repo } from "@prisma/client";

export type CommitResponse = {
  id: number;
  hash: string;
  message: string;
  author: string;
  committedAt: string;
  repoSlug: string;
};

export type RepoResponse = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  repoPath: string;
  primaryLanguage: string;
  frameworks: string[];
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
  frameworks:
    typeof repo.frameworks === "string"
      ? (JSON.parse(repo.frameworks) as string[])
      : [],
  stars: repo.stars,
  updatedAt: repo.updatedAt.toISOString(),
  createdAt: repo.createdAt.toISOString(),
  commits: (repo.commits ?? []).map((commit) => transformCommit(commit, repo.slug)),
});
