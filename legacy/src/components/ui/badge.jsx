import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[var(--font-size-xs)] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-interactive-default)] text-white shadow hover:bg-[var(--color-interactive-hover)]",
        secondary:
          "border-transparent bg-[var(--color-background-secondary)] text-[var(--color-foreground-primary)] hover:bg-[var(--color-background-tertiary)]",
        destructive:
          "border-transparent bg-[var(--color-error)] text-white shadow hover:opacity-90",
        outline: "border-[var(--color-border-default)] text-[var(--color-foreground-primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }