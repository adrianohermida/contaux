import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      className={cn("animate-pulse rounded-md bg-[var(--color-background-secondary)] border border-[var(--color-border-default)]", className)}
      {...props} />)
  );
}

export { Skeleton }