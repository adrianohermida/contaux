"use client";
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    (<Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--color-background-primary)] group-[.toaster]:text-[var(--color-foreground-primary)] group-[.toaster]:border-[var(--color-border-default)] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[var(--color-foreground-muted)]",
          actionButton:
            "group-[.toast]:bg-[var(--color-interactive-default)] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-[var(--color-background-secondary)] group-[.toast]:text-[var(--color-foreground-muted)]",
        },
      }}
      {...props} />)
  );
}

export { Toaster }