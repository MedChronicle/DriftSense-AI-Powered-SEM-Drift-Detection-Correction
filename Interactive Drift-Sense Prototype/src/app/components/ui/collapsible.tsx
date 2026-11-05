"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

type CollapsibleContentProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleContent
> & {
  /** Animate height on open/close (default true) */
  animated?: boolean;
};

function CollapsibleContent({
  className,
  animated = true,
  ...props
}: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        animated &&
          "overflow-hidden data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

/** Chevron that rotates when the nearest trigger is open. Put it inside a CollapsibleTrigger. */
function CollapsibleChevron({
  className,
  ...props
}: React.ComponentProps<typeof ChevronDownIcon>) {
  return (
    <ChevronDownIcon
      data-slot="collapsible-chevron"
      aria-hidden="true"
      className={cn(
        "size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
        "group-data-[state=open]/collapsible-trigger:rotate-180",
        className,
      )}
      {...props}
    />
  );
}

type CollapsibleSectionProps = Omit<
  React.ComponentProps<typeof CollapsiblePrimitive.Root>,
  "title"
> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional badge or count shown before the chevron */
  badge?: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
};

/** Header + body in one component */
function CollapsibleSection({
  title,
  description,
  badge,
  className,
  triggerClassName,
  contentClassName,
  children,
  ...props
}: CollapsibleSectionProps) {
  return (
    <Collapsible
      data-slot="collapsible-section"
      className={cn("rounded-lg border", className)}
      {...props}
    >
      <CollapsibleTrigger
        className={cn(
          "group/collapsible-trigger flex w-full items-center justify-between gap-3 rounded-lg p-4 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          triggerClassName,
        )}
      >
        <span className="grid gap-1">
          <span className="text-sm font-medium">{title}</span>
          {description && (
            <span className="text-muted-foreground text-sm font-normal">
              {description}
            </span>
          )}
        </span>
        <span className="flex items-center gap-2">
          {badge}
          <CollapsibleChevron />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={cn("px-4 pb-4 text-sm", contentClassName)}>
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Expand/collapse-all helper for a list of collapsibles.
 * Use `isOpen(id)` and `setOpen(id, open)` on each item.
 */
function useCollapsibleGroup(allIds: string[], initialOpen: string[] = []) {
  const [open, setOpenIds] = React.useState<string[]>(initialOpen);

  const isOpen = React.useCallback((id: string) => open.includes(id), [open]);

  const setOpen = React.useCallback((id: string, next: boolean) => {
    setOpenIds((prev) =>
      next ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((i) => i !== id),
    );
  }, []);

  const expandAll = React.useCallback(() => setOpenIds([...allIds]), [allIds]);
  const collapseAll = React.useCallback(() => setOpenIds([]), []);

  const allOpen = allIds.length > 0 && allIds.every((id) => open.includes(id));

  return { open, isOpen, setOpen, expandAll, collapseAll, allOpen };
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleChevron,
  CollapsibleSection,
  useCollapsibleGroup,
};
export type { CollapsibleContentProps, CollapsibleSectionProps };
