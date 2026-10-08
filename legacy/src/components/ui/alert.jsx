
import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-[var(--spacing-md)] py-[var(--spacing-md)] text-[var(--font-size-sm)] [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-[var(--spacing-md)] [&>svg]:top-[var(--spacing-md)] [&>svg]:text-[var(--color-foreground-primary)] [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-background-secondary)] text-[var(--color-foreground-primary)] border-[var(--color-border-default)]",
        destructive:
          "border-[var(--color-error)] text-[var(--color-error)] [&>svg]:text-[var(--color-error)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-[var(--spacing-xs)] font-semibold leading-none tracking-tight text-[var(--color-foreground-primary)]", className)}
    {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)] [&_p]:leading-relaxed", className)}
    {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
