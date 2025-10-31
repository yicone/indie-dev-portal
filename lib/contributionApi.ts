import type { HeatmapData } from '@/types/heatmap';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

/**
 * Fetches contribution heatmap data from the API
 */
export async function fetchContributions(): Promise<HeatmapData> {
  const response = await fetch(`${API_BASE_URL}/contributions/heatmap`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch contributions: ${response.statusText}`);
  }

  return response.json() as Promise<HeatmapData>;
}
