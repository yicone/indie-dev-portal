'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchRepos } from '@/lib/gitUtils';
import type { Repo } from '@/types/git';
import { DashboardHeader, type SortOption } from '@/components/dashboard/DashboardHeader';
import { ContributionHeatmap } from '@/components/dashboard/ContributionHeatmap';
import { ProjectGrid } from '@/components/dashboard/ProjectGrid';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { SkeletonGrid } from '@/components/dashboard/SkeletonGrid';
import { calculateCommitFrequency, parseLastOpened } from '@/components/dashboard/utils';

const PAGE_SIZE = 6;

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('lastOpened');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isRefetching, refetch } = useQuery({
    queryKey: ['repos'],
    queryFn: fetchRepos,
    retry: 2,
    staleTime: 30000, // 30 seconds
  });

  const repos = useMemo(() => data ?? [], [data]);

  const languages = useMemo(
    () => [
      'all',
      ...Array.from(new Set(repos.map((repo) => repo.primaryLanguage))).sort((a, b) =>
        a.localeCompare(b)
      ),
    ],
    [repos]
  );

  const filteredRepos = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return repos
      .filter((repo) => {
        const matchesSearch = normalizedQuery
          ? [repo.name, repo.slug, repo.description ?? ''].some((value) =>
              value.toLowerCase().includes(normalizedQuery)
            )
          : true;

        const matchesLanguage =
          selectedLanguage === 'all' || repo.primaryLanguage === selectedLanguage;

        return matchesSearch && matchesLanguage;
      })
      .sort((a, b) => sortRepos(a, b, sortBy));
  }, [repos, searchQuery, selectedLanguage, sortBy]);

  const paginatedRepos = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRepos.slice(start, start + PAGE_SIZE);
  }, [filteredRepos, page]);

  const totalPages = Math.max(1, Math.ceil(filteredRepos.length / PAGE_SIZE));

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    setPage(1);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background pb-16">
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        languages={languages.filter((language) => language !== 'all')}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onRefresh={() => void refetch()}
        isRefreshing={isRefetching}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pt-6">
        {/* Contribution Heatmap */}
        <ContributionHeatmap />

        {/* Project Grid */}
        {isLoading ? (
          <SkeletonGrid />
        ) : isError ? (
          <ErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => void refetch()}
          />
        ) : filteredRepos.length === 0 ? (
          <EmptyState
            onReset={() => {
              setSearchQuery('');
              setSelectedLanguage('all');
              setSortBy('lastOpened');
            }}
          />
        ) : (
          <ProjectGrid
            repos={paginatedRepos}
            currentPage={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalItems={filteredRepos.length}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </main>
  );
}

function sortRepos(a: Repo, b: Repo, sortBy: SortOption) {
  switch (sortBy) {
    case 'name':
      return a.name.localeCompare(b.name);
    case 'commitFrequency':
      return calculateCommitFrequency(b.commits) - calculateCommitFrequency(a.commits);
    case 'lastOpened':
    default:
      return parseLastOpened(b.lastOpenedAt) - parseLastOpened(a.lastOpenedAt);
  }
}
