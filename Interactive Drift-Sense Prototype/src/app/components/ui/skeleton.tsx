"use client";

/**
 * The "shimmer" animation needs this keyframe in your global CSS:
 *
 *   @keyframes shimmer {
 *     100% { transform: translateX(100%); }
 *   }
 *
 * The default "pulse" animation needs nothing extra.
 */

import * as React from "react";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*                              Style definitions                             */
/* -------------------------------------------------------------------------- */

type SkeletonAnimation = "pulse" | "shimmer" | "none";
type SkeletonShape = "rectangle" | "circle" | "text";
type SkeletonAvatarSize = "sm" | "md" | "lg";

const animationStyles: Record<SkeletonAnimation, string> = {
  pulse: "animate-pulse motion-reduce:animate-none",
  shimmer: cn(
    "relative overflow-hidden",
    "[--skeleton-shine:rgb(255_255_255/0.5)] dark:[--skeleton-shine:rgb(255_255_255/0.08)]",
    "before:absolute before:inset-0 before:-translate-x-full",
    "before:bg-[linear-gradient(90deg,transparent,var(--skeleton-shine),transparent)]",
    "before:animate-[shimmer_1.6s_ease-in-out_infinite] motion-reduce:before:animate-none",
  ),
  none: "",
};

const shapeStyles: Record<SkeletonShape, string> = {
  rectangle: "rounded-md",
  circle: "aspect-square rounded-full",
  text: "h-4 rounded",
};

const avatarSizes: Record<SkeletonAvatarSize, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-14",
};

/* -------------------------------------------------------------------------- */
/*                                  Skeleton                                  */
/* -------------------------------------------------------------------------- */

interface SkeletonProps extends React.ComponentProps<"div"> {
  /** How the placeholder animates. Default: "pulse". */
  animation?: SkeletonAnimation;
  /** Preset shape. "text" is a one-line bar, "circle" is square + round. */
  shape?: SkeletonShape;
  /**
   * When false, renders `children` as-is instead of the placeholder, so you
   * can write `<Skeleton loading={isLoading}>{content}</Skeleton>`.
   */
  loading?: boolean;
}

/**
 * Pass `children` to size the placeholder to real content: the content is
 * kept in the layout but hidden, so there is no layout shift when it loads.
 */
function Skeleton({
  className,
  animation = "pulse",
  shape = "rectangle",
  loading = true,
  children,
  ...props
}: SkeletonProps) {
  if (!loading) return <>{children}</>;

  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "bg-accent",
        shapeStyles[shape],
        animationStyles[animation],
        children && "[&>*]:invisible",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Skeleton group                              */
/* -------------------------------------------------------------------------- */

interface SkeletonGroupProps extends React.ComponentProps<"div"> {
  /** Text announced to screen readers. Default: "Loading…". */
  label?: string;
  /**
   * Wait this many ms before showing the placeholders, so fast loads never
   * flash a skeleton. Space is reserved meanwhile, so nothing shifts.
   */
  delay?: number;
}

/** Wrap placeholders in this so assistive tech hears one "Loading" message. */
function SkeletonGroup({
  className,
  label = "Loading…",
  delay = 0,
  children,
  ...props
}: SkeletonGroupProps) {
  const [visible, setVisible] = React.useState(delay <= 0);

  React.useEffect(() => {
    if (delay <= 0) {
      setVisible(true);
      return;
    }
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      data-slot="skeleton-group"
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "transition-opacity duration-150 motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Presets                                  */
/* -------------------------------------------------------------------------- */

interface PresetProps extends SkeletonGroupProps {
  animation?: SkeletonAnimation;
}

interface SkeletonTextProps extends PresetProps {
  /** Number of lines. Default: 3. */
  lines?: number;
  /** Width of the last line when there is more than one. Default: "60%". */
  lastLineWidth?: string;
}

/** A paragraph of text lines. */
function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  animation,
  className,
  ...props
}: SkeletonTextProps) {
  return (
    <SkeletonGroup className={cn("grid gap-2", className)} {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          shape="text"
          animation={animation}
          style={{ width: lines > 1 && i === lines - 1 ? lastLineWidth : "100%" }}
        />
      ))}
    </SkeletonGroup>
  );
}

interface SkeletonAvatarProps extends Omit<SkeletonProps, "shape" | "children"> {
  size?: SkeletonAvatarSize;
}

/** A round avatar placeholder. */
function SkeletonAvatar({ size = "md", className, ...props }: SkeletonAvatarProps) {
  return (
    <Skeleton
      shape="circle"
      className={cn("shrink-0", avatarSizes[size], className)}
      {...props}
    />
  );
}

interface SkeletonCardProps extends PresetProps {
  /** Show an image area at the top. Default: true. */
  media?: boolean;
}

/** A card with an optional image, a title and two lines of text. */
function SkeletonCard({
  media = true,
  animation,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <SkeletonGroup
      className={cn("grid gap-4 rounded-xl border p-4", className)}
      {...props}
    >
      {media && <Skeleton animation={animation} className="aspect-video w-full" />}
      <div className="grid gap-2">
        <Skeleton shape="text" animation={animation} className="h-5 w-2/3" />
        <Skeleton shape="text" animation={animation} className="w-full" />
        <Skeleton shape="text" animation={animation} className="w-4/5" />
      </div>
    </SkeletonGroup>
  );
}

interface SkeletonListProps extends PresetProps {
  /** Number of rows. Default: 3. */
  items?: number;
  avatarSize?: SkeletonAvatarSize;
}

/** Rows of avatar + two text lines, like a user or message list. */
function SkeletonList({
  items = 3,
  avatarSize = "md",
  animation,
  className,
  ...props
}: SkeletonListProps) {
  return (
    <SkeletonGroup className={cn("grid gap-4", className)} {...props}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonAvatar size={avatarSize} animation={animation} />
          <div className="grid flex-1 gap-2">
            <Skeleton shape="text" animation={animation} className="w-1/3" />
            <Skeleton shape="text" animation={animation} className="w-2/3" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

export {
  Skeleton,
  SkeletonGroup,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonList,
};
export type {
  SkeletonProps,
  SkeletonGroupProps,
  SkeletonTextProps,
  SkeletonAvatarProps,
  SkeletonCardProps,
  SkeletonListProps,
  SkeletonAnimation,
  SkeletonShape,
};
