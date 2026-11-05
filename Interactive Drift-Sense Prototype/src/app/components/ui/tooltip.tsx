"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "./utils";

type TooltipVariant = "default" | "glass";

const VARIANTS: Record<TooltipVariant, { content: string; arrow: string }> = {
  default: {
    content: "bg-primary text-primary-foreground",
    arrow: "bg-primary fill-primary",
  },
  // matches the cyan glass look used across DRIFT-SENSE
  glass: {
    content:
      "border border-cyan-400/25 bg-[rgba(3,8,22,0.92)] text-cyan-50 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md",
    arrow: "bg-[rgba(3,8,22,0.92)] fill-[rgba(3,8,22,0.92)]",
  },
};

/**
 * Mount ONE provider near the app root so every tooltip shares hover-intent timing.
 * delayDuration 300ms avoids tooltips flashing while the cursor merely passes over.
 * skipDelayDuration lets moving between neighbouring triggers open instantly.
 */
function TooltipProvider({
  delayDuration = 300,
  skipDelayDuration = 150,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    />
  );
}

const HasProviderContext = React.createContext(false);

/** Uses an ancestor TooltipProvider when present; otherwise supplies its own (backwards compatible). */
function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const hasProvider = React.useContext(HasProviderContext);
  const root = <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
  return hasProvider ? root : <TooltipProvider>{root}</TooltipProvider>;
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 6,
  collisionPadding = 8,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & { variant?: TooltipVariant }) {
  const v = VARIANTS[variant];
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          v.content,
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          // respect the OS reduced-motion setting
          "motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={cn(
            v.arrow,
            "z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
          )}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

interface SimpleTooltipProps {
  /** Tooltip text or node. Falsy content renders the child with no tooltip. */
  content: React.ReactNode;
  /** Optional keyboard hint, e.g. "⌘K". */
  shortcut?: string;
  side?: React.ComponentProps<typeof TooltipPrimitive.Content>["side"];
  variant?: TooltipVariant;
  disabled?: boolean;
  children: React.ReactElement;
}

/** One-liner API: <SimpleTooltip content="Zoom in" shortcut="+"><Button/></SimpleTooltip> */
function SimpleTooltip({
  content,
  shortcut,
  side = "top",
  variant = "default",
  disabled,
  children,
}: SimpleTooltipProps) {
  if (disabled || !content) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} variant={variant}>
        <span className="flex items-center gap-2">
          {content}
          {shortcut && (
            <kbd className="rounded border border-current/30 px-1 font-mono text-[10px] opacity-70">
              {shortcut}
            </kbd>
          )}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

/** Wrap the app root with this once; nested Tooltips then share timing. */
function TooltipRoot({
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <HasProviderContext.Provider value>
      <TooltipProvider {...props}>{children}</TooltipProvider>
    </HasProviderContext.Provider>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  SimpleTooltip,
};
