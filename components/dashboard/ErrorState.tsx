"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  message?: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-red/40 bg-red/10 px-10 py-16 text-center shadow-sm">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-red/60 bg-red/20 text-red shadow-inner">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Failed to load repositories
        </h2>
        <p className="text-sm text-muted-foreground">
          {message ?? "An error occurred while fetching your projects. Please try again."}
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="rounded-full px-5"
        onClick={onRetry}
      >
        <RefreshCcw className="mr-2 h-4 w-4" /> Retry
      </Button>
    </section>
  );
}
