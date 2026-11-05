"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "./utils";

function HoverCard({
  openDelay = 200,
  closeDelay = 150,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return (
    <HoverCardPrimitive.Root
      data-slot="hover-card"
      openDelay={openDelay}
      closeDelay={closeDelay}
      {...props}
    />
  );
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

type HoverCardSize = "sm" | "md" | "lg" | "auto";

const HOVER_CARD_SIZE: Record<HoverCardSize, string> = {
  sm: "w-48",
  md: "w-64",
  lg: "w-96",
  auto: "w-auto max-w-sm",
};

type HoverCardContentProps = React.ComponentProps<
  typeof HoverCardPrimitive.Content
> & {
  /** Card width (default "md", same as the original w-64) */
  size?: HoverCardSize;
  /** Show an arrow pointing at the trigger */
  showArrow?: boolean;
};

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  size = "md",
  showArrow = false,
  children,
  ...props
}: HoverCardContentProps) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 motion-reduce:animate-none z-50 max-h-(--radix-hover-card-content-available-height) origin-(--radix-hover-card-content-transform-origin) overflow-y-auto rounded-md border p-4 shadow-md outline-hidden",
          HOVER_CARD_SIZE[size],
          className,
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <HoverCardPrimitive.Arrow
            data-slot="hover-card-arrow"
            className="fill-popover stroke-border"
          />
        )}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  );
}

type HoverCardUserProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Avatar element, e.g. <Avatar /> */
  avatar?: React.ReactNode;
  name: React.ReactNode;
  handle?: React.ReactNode;
  bio?: React.ReactNode;
  /** Extra row, e.g. join date or follower count */
  meta?: React.ReactNode;
};

/** Profile preview layout. Put it inside HoverCardContent. */
function HoverCardUser({
  avatar,
  name,
  handle,
  bio,
  meta,
  className,
  ...props
}: HoverCardUserProps) {
  return (
    <div
      data-slot="hover-card-user"
      className={cn("flex gap-4", className)}
      {...props}
    >
      {avatar}
      <div className="grid gap-1">
        <div className="text-sm font-semibold">{name}</div>
        {handle && <div className="text-muted-foreground text-sm">{handle}</div>}
        {bio && <p className="text-sm">{bio}</p>}
        {meta && <div className="text-muted-foreground pt-1 text-xs">{meta}</div>}
      </div>
    </div>
  );
}

/** Loading placeholder for cards that fetch data on open */
function HoverCardSkeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hover-card-skeleton"
      aria-busy="true"
      className={cn("flex gap-4", className)}
      {...props}
    >
      <div className="bg-muted size-10 shrink-0 animate-pulse rounded-full motion-reduce:animate-none" />
      <div className="grid flex-1 gap-2">
        <div className="bg-muted h-4 w-2/3 animate-pulse rounded motion-reduce:animate-none" />
        <div className="bg-muted h-3 w-full animate-pulse rounded motion-reduce:animate-none" />
        <div className="bg-muted h-3 w-4/5 animate-pulse rounded motion-reduce:animate-none" />
      </div>
    </div>
  );
}

/** Open state helper. Spread `hoverCardProps` on <HoverCard />. */
function useHoverCard(initialOpen: boolean = false) {
  const [open, setOpen] = React.useState(initialOpen);

  const show = React.useCallback(() => setOpen(true), []);
  const hide = React.useCallback(() => setOpen(false), []);
  const toggle = React.useCallback(() => setOpen((o) => !o), []);

  return {
    open,
    setOpen,
    show,
    hide,
    toggle,
    hoverCardProps: { open, onOpenChange: setOpen },
  };
}

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardUser,
  HoverCardSkeleton,
  useHoverCard,
};
export type { HoverCardContentProps, HoverCardSize, HoverCardUserProps };
