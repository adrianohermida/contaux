import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-[var(--color-border-default)] bg-[var(--color-background-primary)] text-[var(--color-foreground-primary)] px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[var(--font-size-base)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:border-[var(--color-border-focus)] disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-[var(--color-foreground-disabled)]",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }