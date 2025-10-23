import { Router } from "express";
import { prisma } from "../lib/prisma";
import { transformCommit } from "./transformers";

export const commitsRouter = Router();

commitsRouter.get("/", async (req, res) => {
  const { repoSlug, limit = "5" } = req.query;

  if (typeof repoSlug !== "string") {
    return res.status(400).json({ error: "repoSlug query parameter is required" });
  }

  const take = Number(limit);

  try {
    const repo = await prisma.repo.findUnique({
      where: { slug: repoSlug },
      select: { id: true },
    });

    if (!repo) {
      return res.status(404).json({ error: "Repository not found" });
    }

    const commits = await prisma.commit.findMany({
      where: { repoId: repo.id },
      orderBy: { committedAt: "desc" },
      take: Number.isNaN(take) ? 5 : take,
    });

    res.json({
      data: commits.map((commit) => transformCommit(commit, repoSlug)),
    });
  } catch (error) {
    console.error(`Failed to fetch commits for repo ${repoSlug}`, error);
    res.status(500).json({ error: "Failed to fetch commits" });
  }
});
