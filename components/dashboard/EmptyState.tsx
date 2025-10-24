"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  onReset: () => void;
};

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border/60 bg-card/70 px-10 py-16 text-center shadow-sm">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border/60 bg-surface0/50 text-mauve shadow-inner">
        <AlertCircle className="h-7 w-7" />
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">No projects match these filters</h2>
        <p className="text-sm text-muted-foreground">
          Adjust your search terms or filters to discover more repositories.
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="rounded-full px-5"
        onClick={onReset}
      >
        <RefreshCcw className="mr-2 h-4 w-4" /> Reset filters
      </Button>
    </section>
  );
}
