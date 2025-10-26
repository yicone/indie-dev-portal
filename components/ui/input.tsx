import * as React from 'react';

import { cn } from '@/lib/utils';

type InputProps = React.ComponentPropsWithoutRef<'input'>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-11 w-full min-w-0 rounded-full border border-input bg-input-background px-4 text-base text-foreground transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
          'file:bg-transparent file:text-sm file:font-medium',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
