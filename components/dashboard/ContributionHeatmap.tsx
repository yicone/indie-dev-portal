'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitCommit } from 'lucide-react';

import { fetchContributions } from '@/lib/contributionApi';
import {
  generateHeatmapCells,
  organizeIntoWeeks,
  getMonthLabels,
  getIntensityClass,
  formatTooltipDate,
  formatContributionText,
} from '@/lib/heatmapUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export function ContributionHeatmap() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['contributions', new Date().toISOString().split('T')[0]], // Cache key includes date
    queryFn: fetchContributions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Ref for mobile scroll container (must be before any conditional returns)
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to right (most recent) on mobile
  useEffect(() => {
    if (mobileScrollRef.current && data) {
      mobileScrollRef.current.scrollLeft = mobileScrollRef.current.scrollWidth;
    }
  }, [data]);

  if (isLoading) {
    return <HeatmapSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/95 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">Unable to load contribution data</p>
          <p className="text-xs text-muted-foreground/70">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="rounded-full"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const cells = generateHeatmapCells(data?.data || []);
  const allWeeks = organizeIntoWeeks(cells);
  const monthLabels = getMonthLabels(cells);
  const total = data?.total || 0;

  // Show recent 26 weeks on mobile, all 53 weeks on desktop
  const weeks = allWeeks.slice(-26); // Last 26 weeks for mobile
  const displayWeeks = allWeeks; // All weeks for desktop

  return (
    <div className="rounded-2xl border border-border/70 bg-card/95 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <GitCommit className="h-5 w-5 text-mauve" />
          <h2 className="text-lg font-semibold leading-6 text-foreground">Contribution Activity</h2>
        </div>
        <p className="text-sm leading-5 text-muted-foreground">
          {total} {total === 1 ? 'contribution' : 'contributions'} in the last year
        </p>
      </div>

      {/* Heatmap Grid - Desktop (hidden on mobile) */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Month Labels */}
          <div className="relative mb-2 ml-11 h-4 leading-4">
            {monthLabels.map((month) => (
              <span
                key={`${month.label}-${month.weekIndex}`}
                className="absolute text-xs text-muted-foreground"
                style={{
                  left: `calc(${(month.weekIndex / displayWeeks.length) * 100}% + 1px)`,
                }}
              >
                {month.label}
              </span>
            ))}
          </div>

          {/* Grid Container */}
          <div className="flex gap-3">
            {/* Day Labels */}
            <div className="relative flex w-8 flex-shrink-0 text-xs leading-3 text-muted-foreground">
              <div className="absolute left-0 top-0 flex h-full flex-col gap-[2px]">
                <span className="flex-1 w-8 items-center opacity-0">Sun</span>
                <span className="flex-1 w-8 items-center justify-end pr-1">Mon</span>
                <span className="flex-1 w-8 items-center opacity-0">Tue</span>
                <span className="flex-1 w-8 items-center justify-end pr-1">Wed</span>
                <span className="flex-1 w-8 items-center opacity-0">Thu</span>
                <span className="flex-1 w-8 items-center justify-end pr-1">Fri</span>
                <span className="flex-1 w-8 items-center opacity-0">Sat</span>
              </div>
            </div>

            {/* Heatmap Cells */}
            <TooltipProvider delayDuration={200}>
              <div className="flex flex-1 gap-[2px]">
                {displayWeeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-1 flex-col gap-[2px]">
                    {week.map((cell, dayIndex) => {
                      const intensityClass = getIntensityClass(cell.intensity);
                      const tooltipDate = formatTooltipDate(cell.date);
                      const tooltipText = formatContributionText(cell.count);

                      return (
                        <Tooltip key={`${weekIndex}-${dayIndex}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={`aspect-square w-full min-w-[10px] rounded-[2px] transition-all duration-200 hover:ring-2 hover:ring-mauve/50 hover:ring-offset-1 hover:ring-offset-background ${intensityClass}`}
                              role="gridcell"
                              aria-label={`${tooltipText} on ${tooltipDate}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <p className="font-medium">{tooltipText}</p>
                            <p className="text-muted-foreground">{tooltipDate}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-end gap-2 text-xs leading-3 text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="h-3 w-3 rounded-[2px] bg-surface0/60" />
              <div className="h-3 w-3 rounded-[2px] bg-green/20" />
              <div className="h-3 w-3 rounded-[2px] bg-green/40" />
              <div className="h-3 w-3 rounded-[2px] bg-green/60" />
              <div className="h-3 w-3 rounded-[2px] bg-green/80" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid - Mobile (26 weeks with scroll) */}
      <div className="md:hidden">
        <div ref={mobileScrollRef} className="overflow-x-auto overflow-y-hidden">
          <div className="relative min-w-[400px]">
            {/* Grid Container */}
            <div className="flex gap-3">
              {/* Day Labels */}
              <div className="relative flex w-8 flex-shrink-0 text-xs leading-3 text-muted-foreground">
                <div className="absolute left-0 top-0 flex h-full flex-col gap-[2px]">
                  <span className="flex-1 w-8 items-center opacity-0">Sun</span>
                  <span className="flex-1 w-8 items-center justify-end pr-1">Mon</span>
                  <span className="flex-1 w-8 items-center opacity-0">Tue</span>
                  <span className="flex-1 w-8 items-center justify-end pr-1">Wed</span>
                  <span className="flex-1 w-8 items-center opacity-0">Thu</span>
                  <span className="flex-1 w-8 items-center justify-end pr-1">Fri</span>
                  <span className="flex-1 w-8 items-center opacity-0">Sat</span>
                </div>
              </div>

              {/* Heatmap Cells */}
              <TooltipProvider delayDuration={200}>
                <div className="flex flex-1 gap-[2px]">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-1 flex-col gap-[2px]">
                      {week.map((cell, dayIndex) => {
                        const intensityClass = getIntensityClass(cell.intensity);
                        const tooltipDate = formatTooltipDate(cell.date);
                        const tooltipText = formatContributionText(cell.count);

                        return (
                          <Tooltip key={`${weekIndex}-${dayIndex}`}>
                            <TooltipTrigger asChild>
                              <div
                                className={`aspect-square w-full min-w-[10px] rounded-[2px] transition-all duration-200 hover:ring-2 hover:ring-mauve/50 hover:ring-offset-1 hover:ring-offset-background ${intensityClass}`}
                                role="gridcell"
                                aria-label={`${tooltipText} on ${tooltipDate}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <p className="font-medium">{tooltipText}</p>
                              <p className="text-muted-foreground">{tooltipDate}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-end gap-2 text-xs leading-3 text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded-[2px] bg-surface0/60" />
                <div className="h-3 w-3 rounded-[2px] bg-green/20" />
                <div className="h-3 w-3 rounded-[2px] bg-green/40" />
                <div className="h-3 w-3 rounded-[2px] bg-green/60" />
                <div className="h-3 w-3 rounded-[2px] bg-green/80" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeatmapSkeleton() {
  // Generate skeleton month labels using same logic as actual component
  // Simulate 365 days starting from today
  const today = new Date();
  const skeletonCells: { date: Date; weekIndex: number }[] = [];

  // Generate 53 weeks of cells
  for (let week = 0; week < 53; week++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (364 - (week * 7 + day)));
      skeletonCells.push({ date, weekIndex: week });
    }
  }

  // Find weeks that contain the 1st of each month
  const monthLabels: Array<{ weekIndex: number }> = [];
  const seenWeeks = new Set<number>();

  skeletonCells.forEach(({ date, weekIndex }) => {
    if (date.getDate() === 1 && !seenWeeks.has(weekIndex)) {
      monthLabels.push({ weekIndex });
      seenWeeks.add(weekIndex);
    }
  });

  return (
    <div className="rounded-2xl border border-border/70 bg-card/95 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-pulse rounded bg-surface0" />
          <div className="h-6 w-44 animate-pulse rounded bg-surface0" />
        </div>
        <div className="h-5 w-60 animate-pulse rounded bg-surface0" />
      </div>

      {/* Grid */}
      <div className="overflow-x-auto md:overflow-x-visible">
        <div className="relative min-w-[640px] md:min-w-0">
          {/* Month Labels Skeleton */}
          <div className="relative mb-2 ml-11 h-4 leading-4">
            {monthLabels.map((month, i) => (
              <div
                key={i}
                className="absolute h-3 w-6 animate-pulse rounded bg-surface0/50"
                style={{
                  left: `calc(${(month.weekIndex / 53) * 100}% + 1px)`,
                }}
              />
            ))}
          </div>

          {/* Grid Container */}
          <div className="flex gap-3">
            {/* Day Labels Skeleton */}
            <div className="relative flex w-8 flex-shrink-0 text-xs leading-3">
              <div className="absolute left-0 top-0 flex h-full flex-col gap-[2px]">
                <div className="flex-1 w-7 items-center opacity-0" />
                <div className="flex-1 w-7 animate-pulse items-center rounded bg-surface0" />
                <div className="flex-1 w-7 items-center opacity-0" />
                <div className="flex-1 w-7 animate-pulse items-center rounded bg-surface0" />
                <div className="flex-1 w-7 items-center opacity-0" />
                <div className="flex-1 w-7 animate-pulse items-center rounded bg-surface0" />
                <div className="flex-1 w-7 items-center opacity-0" />
              </div>
            </div>

            {/* Heatmap Cells Skeleton */}
            <div className="flex flex-1 gap-[2px]">
              {Array.from({ length: 53 }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-1 flex-col gap-[2px]">
                  {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="aspect-square w-full min-w-[10px] animate-pulse rounded-[2px] bg-surface0/60"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend Skeleton */}
          <div className="mt-4 flex items-center justify-end gap-2 text-xs leading-3">
            <div className="h-3 w-8 animate-pulse rounded bg-surface0" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 w-3 animate-pulse rounded-[2px] bg-surface0/60" />
              ))}
            </div>
            <div className="h-3 w-9 animate-pulse rounded bg-surface0" />
          </div>
        </div>
      </div>
    </div>
  );
}
