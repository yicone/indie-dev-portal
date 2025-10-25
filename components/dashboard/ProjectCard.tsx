'use client';

import {
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Edit3,
  ExternalLink,
  FolderOpen,
  GitBranch,
  GitCommit,
  GitCompare,
  Moon,
  StickyNote,
  Sun,
  XCircle
} from 'lucide-react';

import type { Repo } from '@/types/git';
import { cn, formatDateTime, formatRelativeTime } from '@/lib/utils';
import { getTechIcon } from '@/components/icon-map';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type CIStatusStyle = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
};

const CI_STATUS_META: Record<Repo['ciStatus'], CIStatusStyle> = {
  passing: {
    label: 'Passing',
    icon: CheckCircle2,
    className: 'border-green/40 bg-green/15 text-green'
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'border-yellow/40 bg-yellow/15 text-yellow'
  },
  failing: {
    label: 'Failing',
    icon: XCircle,
    className: 'border-red/40 bg-red/15 text-red'
  },
  none: {
    label: 'No CI',
    icon: CheckCircle2,
    className: 'border-border/60 bg-surface0/80 text-muted-foreground'
  }
};

const LANGUAGE_BADGE_MAP: Record<string, string> = {
  javascript: 'border-yellow/40 bg-yellow/15 text-yellow',
  typescript: 'border-blue/40 bg-blue/15 text-blue',
  python: 'border-green/40 bg-green/15 text-green',
  go: 'border-sky/40 bg-sky/15 text-sky',
  rust: 'border-peach/40 bg-peach/15 text-peach'
};

type ProjectCardProps = {
  repo: Repo;
};

export function ProjectCard({ repo }: ProjectCardProps) {
  const status = CI_STATUS_META[repo.ciStatus] ?? CI_STATUS_META.none;
  const StatusIcon = status.icon;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border border-border/70 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-[6px] hover:border-mauve/60 hover:shadow-xl hover:shadow-mauve/20">
      <div className="pointer-events-none absolute right-0 top-0 h-[3px] w-0 bg-gradient-to-r from-mauve via-lavender to-blue transition-all duration-500 group-hover:w-full" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center justify-center rounded-xl text-background shadow-[0_12px_28px_-16px_rgba(137,180,250,0.35)]">
                  <Code2 className="h-5 w-5 stroke-primary" />
                </span>
                <h2
                  className="truncate text-lg font-semibold text-foreground"
                  title={repo.name}
                >
                  {repo.name}
                </h2>
                <Badge className={cn('gap-1.5', status.className)}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
                <div className="hidden shrink-0 items-center ml-auto gap-2 text-xs text-muted-foreground/80 opacity-0 transition-opacity duration-300 sm:flex group-hover:opacity-100">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {repo.lastOpenedAt
                      ? formatDateTime(repo.lastOpenedAt)
                      : 'Never'}
                  </span>
                </div>
              </div>
              <p
                className="mt-1 truncate text-sm text-muted-foreground text-wrap"
                title={repo.description ?? 'No description provided.'}
              >
                {repo.description ?? 'No description provided.'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    'border text-foreground',
                    LANGUAGE_BADGE_MAP[repo.primaryLanguage.toLowerCase()] ??
                      'border-border/50 bg-surface0/60'
                  )}
                  variant="default"
                >
                  {repo.primaryLanguage}
                </Badge>
                {repo.frameworks.map((framework) => {
                  const Icon = getTechIcon(framework as never);
                  return (
                    <Badge
                      key={framework}
                      variant="outline"
                      className="gap-1 border-overlay0/60 bg-surface0/60 text-foreground"
                    >
                      {Icon ? (
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : null}
                      {framework}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator className="bg-border/60" />

      <CardContent className="flex flex-1 flex-col gap-4 pt-4">
        <section>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <GitCommit className="h-4 w-4" /> Recent commits
          </div>
          <ul className="flex flex-col gap-2">
            {repo.commits.slice(0, 5).map((commit) => (
              <li
                key={commit.id}
                className="group/commit flex items-start gap-2.5 rounded-xl border border-border/40 bg-background/45 p-3 transition-colors hover:border-mauve/50 hover:bg-background/55"
              >
                <div className="mt-1 flex h-2 w-2 flex-shrink-0 items-center justify-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-green" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium text-foreground"
                    title={commit.message}
                  >
                    {commit.message}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border/40 bg-surface1/40 px-2 py-0.5 font-mono uppercase tracking-wide text-muted-foreground">
                      {commit.hash.slice(0, 7)}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" /> {commit.repoSlug}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{' '}
                      {formatRelativeTime(commit.committedAt)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {repo.notes ? (
          <section className="rounded-2xl border border-yellow/40 bg-yellow/12 p-4 text-sm text-foreground transition-colors hover:border-yellow/50 hover:bg-yellow/15">
            <div className="mb-2 flex items-center gap-2 font-semibold text-yellow">
              <StickyNote className="h-4 w-4" /> Notes
            </div>
            <p className="line-clamp-3 leading-relaxed text-muted-foreground">
              {repo.notes}
            </p>
          </section>
        ) : null}

        <footer className="mt-auto flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 rounded-full border-overlay0/60 bg-surface0/55 transition-colors hover:border-mauve hover:bg-mauve hover:text-background"
          >
            <ExternalLink className="h-3.5 w-3.5" /> VS Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 rounded-full border-overlay0/60 bg-surface0/55 transition-colors hover:border-blue hover:bg-blue hover:text-background"
          >
            <FolderOpen className="h-3.5 w-3.5" /> Folder
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-overlay0/60 bg-surface0/55 transition-colors hover:border-green hover:bg-green hover:text-background"
          >
            <GitCompare className="h-3.5 w-3.5" /> Diff
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-overlay0/60 bg-surface0/55 transition-colors hover:border-yellow hover:bg-yellow hover:text-background"
          >
            <Edit3 className="h-3.5 w-3.5" /> Notes
          </Button>
        </footer>
      </CardContent>
    </Card>
  );
}
