export interface ContributionDay {
  date: string; // ISO 8601 format (YYYY-MM-DD)
  count: number;
}

export interface HeatmapData {
  data: ContributionDay[];
  total: number;
  period: string;
}

export interface HeatmapCell {
  date: Date;
  count: number;
  intensity: number; // 0-4 (5 levels)
}

export enum ContributionLevel {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  VERY_HIGH = 4,
}
