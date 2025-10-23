export type Repo = {
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
  commits: Commit[];
};

export type Commit = {
  id: number;
  hash: string;
  message: string;
  author: string;
  committedAt: string;
  repoSlug: string;
};

export type RepoFilters = {
  language?: string;
  frameworks?: string[];
};
