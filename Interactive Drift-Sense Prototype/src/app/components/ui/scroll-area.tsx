"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type ScrollOrientation = "vertical" | "horizontal" | "both";
type ScrollBarSize = "sm" | "md" | "lg";

const verticalBarSize: Record<ScrollBarSize, string> = {
  sm: "w-1.5",
  md: "w-2.5",
  lg: "w-3.5",
};

const horizontalBarSize: Record<ScrollBarSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

/* -------------------------------------------------------------------------- */
/*                         Scroll position tracking hook                      */
/* -------------------------------------------------------------------------- */

interface ScrollEdges {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

const NO_EDGES: ScrollEdges = { top: false, bottom: false, left: false, right: false };

interface UseScrollEdgesOptions {
  enabled: boolean;
  orientation: ScrollOrientation;
  onReachEnd?: () => void;
  threshold: number;
}

/**
 * Tracks whether more content exists past each edge (for fade overlays) and
 * calls `onReachEnd` once each time the user scrolls near the end.
 */
function useScrollEdges(
  ref: React.RefObject<HTMLDivElement | null>,
  { enabled, orientation, onReachEnd, threshold }: UseScrollEdgesOptions,
) {
  const [edges, setEdges] = React.useState<ScrollEdges>(NO_EDGES);

  // Keep the latest callback without re-subscribing listeners.
  const onReachEndRef = React.useRef(onReachEnd);
  React.useEffect(() => {
    onReachEndRef.current = onReachEnd;
  });

  const firedRef = React.useRef(false);

  const update = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const next: ScrollEdges = {
      top: el.scrollTop > 1,
      bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    };

    setEdges((prev) =>
      prev.top === next.top &&
      prev.bottom === next.bottom &&
      prev.left === next.left &&
      prev.right === next.right
        ? prev
        : next,
    );

    if (onReachEndRef.current) {
      const distance =
        orientation === "horizontal"
          ? el.scrollWidth - el.scrollLeft - el.clientWidth
          : el.scrollHeight - el.scrollTop - el.clientHeight;

      if (distance <= threshold) {
        if (!firedRef.current) {
          firedRef.current = true;
          onReachEndRef.current();
        }
      } else {
        firedRef.current = false;
      }
    }
  }, [ref, orientation, threshold]);

  React.useLayoutEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    update();
    el.addEventListener("scroll", update, { passive: true });

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);
    if (el.firstElementChild) resizeObserver.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", update);
      resizeObserver.disconnect();
    };
  }, [enabled, ref, update]);

  return edges;
}

/* -------------------------------------------------------------------------- */
/*                                 Scroll area                                */
/* -------------------------------------------------------------------------- */

interface ScrollAreaProps
  extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  /** Which scrollbars to render. Default: "vertical". */
  orientation?: ScrollOrientation;
  /** Thickness of the scrollbars. Default: "md". */
  scrollbarSize?: ScrollBarSize;
  /** Fade the edges where content continues past the visible area. */
  fade?: boolean;
  /** Height/width of the fade in px. Default: 24. */
  fadeSize?: number;
  /** Make the viewport keyboard-focusable so arrow keys can scroll it. */
  focusable?: boolean;
  /** Ref to the scrollable viewport element (for scrollTo, etc.). */
  viewportRef?: React.Ref<HTMLDivElement>;
  /** Classes for the viewport element. */
  viewportClassName?: string;
  /** Called once when scrolled within `reachEndThreshold` px of the end. */
  onReachEnd?: () => void;
  /** Distance from the end, in px, that counts as "reached". Default: 50. */
  reachEndThreshold?: number;
}

function ScrollArea({
  className,
  children,
  orientation = "vertical",
  scrollbarSize = "md",
  fade = false,
  fadeSize = 24,
  focusable = false,
  viewportRef,
  viewportClassName,
  onReachEnd,
  reachEndThreshold = 50,
  ...props
}: ScrollAreaProps) {
  const innerRef = React.useRef<HTMLDivElement | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof viewportRef === "function") viewportRef(node);
      else if (viewportRef)
        (viewportRef as React.RefObject<HTMLDivElement | null>).current = node;
    },
    [viewportRef],
  );

  const edges = useScrollEdges(innerRef, {
    enabled: fade || Boolean(onReachEnd),
    orientation,
    onReachEnd,
    threshold: reachEndThreshold,
  });

  const showVertical = orientation === "vertical" || orientation === "both";
  const showHorizontal = orientation === "horizontal" || orientation === "both";

  const fadeBase =
    "pointer-events-none absolute z-10 transition-opacity duration-150 motion-reduce:transition-none";
  const fadeColor = "var(--scroll-fade-color, var(--background))";

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={setRefs}
        data-slot="scroll-area-viewport"
        tabIndex={focusable ? 0 : undefined}
        className={cn(
          "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
          // Radix wraps children in a `display: table` div, which stops
          // text from truncating/wrapping. Force block for vertical-only areas.
          orientation === "vertical" && "[&>div]:!block",
          viewportClassName,
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      {fade && showVertical && (
        <>
          <div
            aria-hidden
            data-slot="scroll-area-fade-top"
            className={cn(fadeBase, "inset-x-0 top-0", edges.top ? "opacity-100" : "opacity-0")}
            style={{
              height: fadeSize,
              background: `linear-gradient(to bottom, ${fadeColor}, transparent)`,
            }}
          />
          <div
            aria-hidden
            data-slot="scroll-area-fade-bottom"
            className={cn(fadeBase, "inset-x-0 bottom-0", edges.bottom ? "opacity-100" : "opacity-0")}
            style={{
              height: fadeSize,
              background: `linear-gradient(to top, ${fadeColor}, transparent)`,
            }}
          />
        </>
      )}

      {fade && showHorizontal && (
        <>
          <div
            aria-hidden
            data-slot="scroll-area-fade-left"
            className={cn(fadeBase, "inset-y-0 left-0", edges.left ? "opacity-100" : "opacity-0")}
            style={{
              width: fadeSize,
              background: `linear-gradient(to right, ${fadeColor}, transparent)`,
            }}
          />
          <div
            aria-hidden
            data-slot="scroll-area-fade-right"
            className={cn(fadeBase, "inset-y-0 right-0", edges.right ? "opacity-100" : "opacity-0")}
            style={{
              width: fadeSize,
              background: `linear-gradient(to left, ${fadeColor}, transparent)`,
            }}
          />
        </>
      )}

      {showVertical && <ScrollBar orientation="vertical" size={scrollbarSize} />}
      {showHorizontal && <ScrollBar orientation="horizontal" size={scrollbarSize} />}
      {orientation === "both" && <ScrollAreaPrimitive.Corner />}
    </ScrollAreaPrimitive.Root>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Scrollbar                                 */
/* -------------------------------------------------------------------------- */

interface ScrollBarProps
  extends React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
  size?: ScrollBarSize;
}

function ScrollBar({
  className,
  orientation = "vertical",
  size = "md",
  ...props
}: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          cn("h-full border-l border-l-transparent", verticalBarSize[size]),
        orientation === "horizontal" &&
          cn("flex-col border-t border-t-transparent", horizontalBarSize[size]),
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border hover:bg-muted-foreground/40 active:bg-muted-foreground/60 relative flex-1 rounded-full transition-colors motion-reduce:transition-none"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
export type { ScrollAreaProps, ScrollBarProps, ScrollOrientation, ScrollBarSize };
