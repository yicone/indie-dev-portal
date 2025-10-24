import * as React from "react";

import { cn } from "@/lib/utils";

type SeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn("shrink-0 rounded-full bg-border/70", className)}
      {...props}
    />
  ),
);
Separator.displayName = "Separator";

export { Separator };
