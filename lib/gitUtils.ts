import { z } from "zod";

import type { Commit, Repo } from "@/types/git";

const commitSchema = z.object({
  id: z.number(),
  hash: z.string(),
  message: z.string(),
  author: z.string(),
  committedAt: z.string(),
  repoSlug: z.string(),
});

const repoSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  repoPath: z.string(),
  primaryLanguage: z.string(),
  frameworks: z.array(z.string()),
  stars: z.number(),
  updatedAt: z.string(),
  createdAt: z.string(),
  commits: z.array(commitSchema),
});

const reposResponseSchema = z.object({
  data: z.array(repoSchema),
});

const commitsResponseSchema = z.object({
  data: z.array(commitSchema),
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchRepos(): Promise<Repo[]> {
  const payload = await fetchJson<unknown>(`${API_BASE_URL}/repos`);
  const parsed = reposResponseSchema.parse(payload);
  return parsed.data;
}

export async function fetchCommits(repoSlug: string, limit = 5): Promise<Commit[]> {
  const params = new URLSearchParams({ repoSlug, limit: String(limit) });
  const payload = await fetchJson<unknown>(`${API_BASE_URL}/commits?${params.toString()}`);
  const parsed = commitsResponseSchema.parse(payload);
  return parsed.data;
}
