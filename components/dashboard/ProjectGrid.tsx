'use client';

import { ArrowLeft, ArrowRight, ListFilter } from 'lucide-react';

import type { Repo } from '@/types/git';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/dashboard/ProjectCard';

type ProjectGridProps = {
  repos: Repo[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function ProjectGrid({
  repos,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: ProjectGridProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surface0/50 text-foreground">
            <ListFilter className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Project overview</p>
            <p className="text-xs text-muted-foreground">
              Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of{' '}
              <strong>{totalItems}</strong> repositories.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full border border-transparent px-3 text-muted-foreground"
            onClick={() => !isFirstPage && onPageChange(currentPage - 1)}
            disabled={isFirstPage}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full border border-transparent px-3 text-muted-foreground"
            onClick={() => !isLastPage && onPageChange(currentPage + 1)}
            disabled={isLastPage}
          >
            Next <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {repos.map((repo) => (
          <ProjectCard key={repo.id} repo={repo} />
        ))}
      </div>
    </section>
  );
}
