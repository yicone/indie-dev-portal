import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { transformRepo } from './transformers';

export const reposRouter = Router();

reposRouter.get('/', async (_req, res) => {
  try {
    const repos = await prisma.repo.findMany({
      include: {
        commits: {
          orderBy: { committedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      data: repos.map(transformRepo),
    });
  } catch (error) {
    console.error('Failed to fetch repos', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

reposRouter.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const repo = await prisma.repo.findUnique({
      where: { slug },
      include: {
        commits: {
          orderBy: { committedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    res.json({ data: transformRepo(repo) });
  } catch (error) {
    console.error(`Failed to fetch repo ${slug}`, error);
    res.status(500).json({ error: 'Failed to fetch repository' });
  }
});

reposRouter.patch('/:slug/notes', async (req, res) => {
  const { slug } = req.params;
  const { notes } = req.body;

  if (typeof notes !== 'string') {
    return res.status(400).json({ error: 'Notes must be a string' });
  }

  try {
    const repo = await prisma.repo.update({
      where: { slug },
      data: { notes: notes.trim() || null },
      include: {
        commits: {
          orderBy: { committedAt: 'desc' },
          take: 5,
        },
      },
    });

    res.json({ data: transformRepo(repo) });
  } catch (error) {
    console.error(`Failed to update notes for repo ${slug}`, error);
    res.status(500).json({ error: 'Failed to update notes' });
  }
});
