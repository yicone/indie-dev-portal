"use client";

import { useTheme } from "next-themes";
import { ArrowUpDown, Moon, RefreshCw, Search, Sun } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type SortOption = "lastOpened" | "name" | "commitFrequency";

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedLanguage: string;
  onLanguageChange: (value: string) => void;
  languages: string[];
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  selectedLanguage,
  onLanguageChange,
  languages,
  sortBy,
  onSortChange,
  onRefresh,
  isRefreshing = false,
}: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mauve text-background shadow-glow">
            <span className="text-lg font-semibold">DP</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dev Portal</h1>
            <p className="text-sm text-muted-foreground">
              Monitor your repositories, commits, and workflows at a glance.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:max-w-3xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="h-11 rounded-xl border-border bg-card/80 pl-10"
              />
            </div>

            <Select value={selectedLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger className="h-11 w-full rounded-xl border-border bg-card/80 md:w-[180px]">
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
              <SelectTrigger className="h-11 w-full rounded-xl border-border bg-card/80 md:w-[200px]">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    {sortBy === "lastOpened" && "Last opened"}
                    {sortBy === "name" && "Name"}
                    {sortBy === "commitFrequency" && "Commit frequency"}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="lastOpened">Last opened</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="commitFrequency">Commit frequency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full border-border bg-card/80"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh repositories"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full border-border bg-card/80"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
