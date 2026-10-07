import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-[var(--color-border-default)] bg-[var(--color-background-primary)] text-[var(--color-foreground-primary)] px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-base)] shadow-sm placeholder:text-[var(--color-foreground-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }