import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[var(--spacing-sm)] whitespace-nowrap rounded-md text-[var(--font-size-sm)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)] text-white shadow transition-colors",
        destructive:
          "bg-[var(--color-error)] text-white shadow-sm hover:opacity-90",
        outline:
          "border border-[var(--color-border-default)] bg-[var(--color-background-primary)] text-[var(--color-foreground-primary)] shadow-sm hover:bg-[var(--color-background-secondary)] hover:border-[var(--color-border-focus)]",
        secondary:
          "bg-[var(--color-background-secondary)] text-[var(--color-foreground-primary)] shadow-sm hover:bg-[var(--color-background-tertiary)]",
        ghost: "hover:bg-[var(--color-background-secondary)] text-[var(--color-foreground-primary)]",
        link: "text-[var(--color-interactive-default)] underline-offset-4 hover:text-[var(--color-interactive-hover)]",
      },
      size: {
        default: "h-9 px-[var(--spacing-md)] py-[var(--spacing-sm)]",
        sm: "h-8 rounded-md px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[var(--font-size-xs)]",
        lg: "h-10 rounded-md px-[var(--spacing-lg)]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }