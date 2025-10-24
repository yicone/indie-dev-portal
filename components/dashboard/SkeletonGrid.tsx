"use client";

import { Skeleton } from "@/components/ui/skeleton";

const CARD_HEIGHT = 420;

export function SkeletonGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-[420px] rounded-2xl" />
      ))}
    </div>
  );
}
