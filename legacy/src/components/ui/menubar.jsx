"use client"

import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

function MenubarMenu({
  ...props
}) {
  return <MenubarPrimitive.Menu {...props} />;
}

function MenubarGroup({
  ...props
}) {
  return <MenubarPrimitive.Group {...props} />;
}

function MenubarPortal({
  ...props
}) {
  return <MenubarPrimitive.Portal {...props} />;
}

function MenubarRadioGroup({
  ...props
}) {
  return <MenubarPrimitive.RadioGroup {...props} />;
}

function MenubarSub({
  ...props
}) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

const Menubar = React.forwardRef(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-9 items-center space-x-[var(--spacing-xs)] rounded-md border border-[var(--color-border-default)] bg-[var(--color-background-primary)] p-[var(--spacing-xs)] shadow-sm",
      className
    )}
    {...props} />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[var(--font-size-sm)] font-medium outline-none focus:bg-[var(--color-background-secondary)] focus:text-[var(--color-foreground-primary)] data-[state=open]:bg-[var(--color-background-secondary)] data-[state=open]:text-[var(--color-foreground-primary)]",
      className
    )}
    {...props} />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] outline-none focus:bg-[var(--color-background-secondary)] focus:text-[var(--color-foreground-primary)] data-[state=open]:bg-[var(--color-background-secondary)] data-[state=open]:text-[var(--color-foreground-primary)]",
      inset && "pl-[var(--spacing-lg)]",
      className
    )}
    {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" aria-hidden="true" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border border-[var(--color-border-default)] bg-[var(--color-background-primary)] p-[var(--spacing-xs)] text-[var(--color-foreground-primary)] shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props} />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef((
  { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
  ref
) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-md border border-[var(--color-border-default)] bg-[var(--color-background-primary)] p-[var(--spacing-xs)] text-[var(--color-foreground-primary)] shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props} />
  </MenubarPrimitive.Portal>
))
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] outline-none focus:bg-[var(--color-background-secondary)] focus:text-[var(--color-foreground-primary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-[var(--spacing-lg)]",
      className
    )}
    {...props} />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-[var(--spacing-sm)] pl-[var(--spacing-lg)] pr-[var(--spacing-sm)] text-[var(--font-size-sm)] outline-none focus:bg-[var(--color-background-secondary)] focus:text-[var(--color-foreground-primary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-[var(--spacing-sm)] pl-[var(--spacing-lg)] pr-[var(--spacing-sm)] text-[var(--font-size-sm)] outline-none focus:bg-[var(--color-background-secondary)] focus:text-[var(--color-foreground-primary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
     {...props}>
     <span className="absolute left-[var(--spacing-sm)] flex h-3.5 w-3.5 items-center justify-center">
       <MenubarPrimitive.ItemIndicator>
         <Circle className="h-4 w-4 fill-current" />
       </MenubarPrimitive.ItemIndicator>
     </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
     ref={ref}
     className={cn("px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)]", inset && "pl-[var(--spacing-lg)]", className)}
     {...props} />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
     ref={ref}
     className={cn("-mx-[var(--spacing-xs)] my-[var(--spacing-xs)] h-px bg-[var(--color-border-default)]", className)}
     {...props} />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}) => {
  return (
    (<span
       className={cn("ml-auto text-[var(--font-size-xs)] tracking-widest text-[var(--color-foreground-muted)]", className)}
       {...props} />)
  );
}
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}