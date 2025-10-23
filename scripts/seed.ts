import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

type RepoSeed = {
  name: string;
  slug: string;
  description?: string;
  repoPath: string;
  primaryLanguage: string;
  frameworks: string[];
  stars?: number;
};

type CommitSeed = {
  repoSlug: string;
  hash: string;
  message: string;
  author: string;
  committedAt: string;
};

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, "../data");

async function loadJson<T>(fileName: string): Promise<T> {
  const content = await readFile(path.join(dataDir, fileName), "utf-8");
  return JSON.parse(content) as T;
}

async function main() {
  const repos = await loadJson<RepoSeed[]>("repos.json");
  const commits = await loadJson<CommitSeed[]>("commits.json");

  await prisma.commit.deleteMany();
  await prisma.repo.deleteMany();

  for (const repo of repos) {
    const createdRepo = await prisma.repo.create({
      data: {
        name: repo.name,
        slug: repo.slug,
        description: repo.description,
        repoPath: repo.repoPath,
        primaryLanguage: repo.primaryLanguage,
        frameworks: repo.frameworks,
        stars: repo.stars ?? 0,
      },
    });

    const repoCommits = commits.filter((commit) => commit.repoSlug === repo.slug);

    if (repoCommits.length > 0) {
      await prisma.commit.createMany({
        data: repoCommits.map((commit) => ({
          repoId: createdRepo.id,
          hash: commit.hash,
          message: commit.message,
          author: commit.author,
          committedAt: new Date(commit.committedAt),
        })),
      });
    }
  }
}

main()
  .then(() => {
    console.log("Database seeded successfully");
  })
  .catch((error) => {
    console.error("Failed seeding database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
