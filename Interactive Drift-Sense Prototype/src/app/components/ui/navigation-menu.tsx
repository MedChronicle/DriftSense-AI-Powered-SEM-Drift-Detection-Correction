"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex w-max items-center justify-center rounded-md bg-background font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 data-[active]:bg-accent/50 data-[active]:text-accent-foreground focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:outline-1",
  {
    variants: {
      size: {
        sm: "h-8 px-3 py-1.5 text-sm",
        md: "h-9 px-4 py-2 text-sm",
        lg: "h-10 px-5 py-2 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type NavigationMenuTriggerSize = VariantProps<
  typeof navigationMenuTriggerStyle
>["size"];

type NavigationMenuTriggerProps = React.ComponentProps<
  typeof NavigationMenuPrimitive.Trigger
> & {
  /** Trigger height and padding (default "md", same as the original) */
  size?: NavigationMenuTriggerSize;
  /** Show the rotating chevron (default true) */
  showChevron?: boolean;
};

function NavigationMenuTrigger({
  className,
  children,
  size,
  showChevron = true,
  ...props
}: NavigationMenuTriggerProps) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle({ size }), className)}
      {...props}
    >
      {children}
      {showChevron && (
        <ChevronDownIcon
          className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      )}
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 motion-reduce:animate-none top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  wrapperClassName,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport> & {
  /** Class for the outer positioning div */
  wrapperClassName?: string;
}) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center",
        wrapperClassName,
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 motion-reduce:animate-none relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active]:focus:bg-accent data-[active]:hover:bg-accent data-[active]:bg-accent/50 data-[active]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all motion-reduce:transition-none outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in motion-reduce:animate-none top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

type NavigationMenuColumns = 1 | 2 | 3;

const GRID_COLUMNS: Record<NavigationMenuColumns, string> = {
  1: "md:w-[300px]",
  2: "md:w-[500px] md:grid-cols-2",
  3: "md:w-[700px] md:grid-cols-3",
};

/** Column layout for dropdown panels. Put NavigationMenuListItem inside. */
function NavigationMenuGrid({
  className,
  columns = 1,
  ...props
}: React.ComponentProps<"ul"> & { columns?: NavigationMenuColumns }) {
  return (
    <ul
      data-slot="navigation-menu-grid"
      className={cn("grid gap-1 p-2", GRID_COLUMNS[columns], className)}
      {...props}
    />
  );
}

type NavigationMenuListItemProps = React.ComponentProps<
  typeof NavigationMenuPrimitive.Link
> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
};

/** Rich link (icon, title, description) for dropdown panels */
function NavigationMenuListItem({
  title,
  description,
  icon,
  className,
  children,
  ...props
}: NavigationMenuListItemProps) {
  return (
    <li data-slot="navigation-menu-list-item">
      <NavigationMenuLink
        className={cn("flex-row items-start gap-3", className)}
        {...props}
      >
        {icon && (
          <span aria-hidden="true" className="text-muted-foreground mt-0.5">
            {icon}
          </span>
        )}
        <span
