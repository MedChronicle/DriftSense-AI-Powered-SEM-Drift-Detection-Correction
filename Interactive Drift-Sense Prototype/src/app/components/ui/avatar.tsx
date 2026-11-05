"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const avatarVariants = cva("relative flex shrink-0 rounded-full", {
  variants: {
    size: {
      xs: "size-6 text-[10px]",
      sm: "size-8 text-xs",
      md: "size-10 text-sm", // original default
      lg: "size-12 text-base",
      xl: "size-16 text-lg",
    },
  },
  defaultVariants: { size: "md" },
});

type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>;
type AvatarStatus = "online" | "away" | "busy" | "offline";

const STATUS_COLORS: Record<AvatarStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  busy: "bg-red-500",
  offline: "bg-zinc-400",
};

const STATUS_DOT_SIZE: Record<AvatarSize, string> = {
  xs: "size-1.5",
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
  xl: "size-3.5",
};

interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  /** Small presence dot in the bottom-right corner. */
  status?: AvatarStatus;
}

/** Same API as before; adds `size` and `status`. Defaults still render the original 40px circle. */
function Avatar({ className, size, status, children, ...props }: AvatarProps) {
  const s: AvatarSize = size ?? "md";
  // The clipping lives on an inner Root so the status dot can overhang the circle's edge.
  return (
    <span className={cn(avatarVariants({ size }), className)} data-slot="avatar-wrapper">
      <AvatarPrimitive.Root
        data-slot="avatar"
        className="relative flex size-full overflow-hidden rounded-full"
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>
      {status && (
        <span
          role="status"
          aria-label={status}
          data-slot="avatar-status"
          className={cn(
            "absolute right-0 bottom-0 rounded-full ring-2 ring-background",
            STATUS_DOT_SIZE[s],
            STATUS_COLORS[status],
          )}
        />
      )}
    </span>
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

/** "Arpit Saharan" → "AS", "madonna" → "M", "" → "?" */
export function getInitials(name?: string, max = 2): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts.slice(0, max).map((p) => p[0]!.toUpperCase()).join("");
}

/** Stable hue from a string so the same person always gets the same color. */
function hueFor(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

interface AvatarFallbackProps extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  /** Derives initials from this name and, with `colorize`, a stable background color. */
  name?: string;
  colorize?: boolean;
}

function AvatarFallback({
  className,
  name,
  colorize = false,
  children,
  style,
  delayMs = 150, // avoids a flash of initials when the image loads quickly
  ...props
}: AvatarFallbackProps) {
  const colored =
    colorize && name
      ? { background: `hsl(${hueFor(name)} 55% 35%)`, color: "white", ...style }
      : style;
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      delayMs={delayMs}
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full font-medium select-none",
        className,
      )}
      style={colored}
      {...props}
    >
      {children ?? (name ? getInitials(name) : null)}
    </AvatarPrimitive.Fallback>
  );
}

/** Overlapping stack with a "+N" overflow chip. Children should be <Avatar />s. */
function AvatarGroup({
  max = 4,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { max?: number }) {
  const items = React.Children.toArray(children);
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <div
      data-slot="avatar-group"
      role="group"
      className={cn("flex items-center -space-x-2 [&>*]:ring-2 [&>*]:ring-background", className)}
      {...props}
    >
      {shown}
      {extra > 0 && (
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
          +{extra}
        </span>
      )}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, avatarVariants };
