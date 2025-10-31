import { Router } from 'express';
import { getContributionHeatmap, getTotalContributions } from './services/contributionService';

export const contributionsRouter = Router();

/**
 * GET /contributions/heatmap
 * Returns aggregated commit data for the past 365 days
 */
contributionsRouter.get('/heatmap', async (_req, res) => {
  try {
    const contributions = await getContributionHeatmap();
    const total = await getTotalContributions();

    res.json({
      data: contributions,
      total,
      period: '365 days',
    });
  } catch (error) {
    console.error('Error fetching contribution heatmap:', error);
    res.status(500).json({
      error: 'Failed to fetch contribution data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
