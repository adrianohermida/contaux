import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const ContextMenu = ContextMenuPrimitive.Root

const ContextMenuTrigger = ContextMenuPrimitive.Trigger

const ContextMenuGroup = ContextMenuPrimitive.Group

const ContextMenuPortal = ContextMenuPrimitive.Portal

const ContextMenuSub = ContextMenuPrimitive.Sub

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
     ref={ref}
     className={cn(
       "flex cursor-default select-none items-center rounded-sm px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] outline-none focus:bg-[var(--color-background-secondary)] focus:text-[var(--color-foreground-primary)] data-[state=open]:bg-[var(--color-background-secondary)] data-[state=open]:text-[var(--color-foreground-primary)]",
       inset && "pl-[var(--spacing-lg)]",
       className
     )}
    {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" aria-hidden="true" />
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

const ContextMenuSubContent = React.forwardRef(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
     ref={ref}
     className={cn(
       "z-50 min-w-[8rem] overflow-hidden rounded-md border border-[var(--color-border-default)] bg-[var(--color-background-primary)] p-[var(--spacing-xs)] text-[var(--color-foreground-primary)] shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
       className
     )}
    {...props} />
))
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName

const ContextMenuContent = React.forwardRef(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
       ref={ref}
       className={cn(
         "z-50 min-w-[8rem] overflow-hidden rounded-md border border-[var(--color-border-default)] bg-[var(--color-background-primary)] p-[var(--spacing-xs)] text-[var(--color-foreground-primary)] shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
         className
       )}
       {...props} />
  </ContextMenuPrimitive.Portal>
))
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

const ContextMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
     ref={ref}
     className={cn(
       "relative flex cursor-default select-none items-center rounded-sm px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] outline-none focus:bg-[var(--color-background-secondary)] focus:text-[var(--color-foreground-primary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
       inset && "pl-[var(--spacing-lg)]",
       className
     )}
    {...props} />
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

const ContextMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
     ref={ref}
     className={cn(
       "relative flex cursor-default select-none items-center rounded-sm py-[var(--spacing-sm)] pl-[var(--spacing-lg)] pr-[var(--spacing-sm)] text-[var(--font-size-sm)] outline-none focus:bg-[var(--color-background-secondary)] focus:text-[var(--color-foreground-primary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
       className
     )}
    checked={checked}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" aria-hidden="true" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName

const ContextMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
     ref={ref}
     className={cn(
       "relative flex cursor-default select-none items-center rounded-sm py-[var(--spacing-sm)] pl-[var(--spacing-lg)] pr-[var(--spacing-sm)] text-[var(--font-size-sm)] outline-none focus:bg-[var(--color-background-secondary)] focus:text-[var(--color-foreground-primary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
       className
     )}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" aria-hidden="true" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

const ContextMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
     ref={ref}
     className={cn(
       "px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)]",
       inset && "pl-[var(--spacing-lg)]",
       className
     )}
    {...props} />
))
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

const ContextMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
     ref={ref}
     className={cn("-mx-[var(--spacing-xs)] my-[var(--spacing-xs)] h-px bg-[var(--color-border-default)]", className)}
     {...props} />
))
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

const ContextMenuShortcut = ({
  className,
  ...props
}) => {
  return (
    (<span
       className={cn("ml-auto text-[var(--font-size-xs)] tracking-widest text-[var(--color-foreground-muted)]", className)}
       {...props} />)
  );
}
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}