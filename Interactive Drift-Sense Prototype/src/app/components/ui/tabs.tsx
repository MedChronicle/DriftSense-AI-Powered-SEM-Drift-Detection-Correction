"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type TabsVariant = "pill" | "underline" | "outline";
type TabsSize = "sm" | "md" | "lg";
type TabsOrientation = "horizontal" | "vertical";

interface TabsContextValue {
  variant: TabsVariant;
  size: TabsSize;
  orientation: TabsOrientation;
}

const TabsContext = React.createContext<TabsContextValue>({
  variant: "pill",
  size: "md",
  orientation: "horizontal",
});

const useTabsContext = () => React.useContext(TabsContext);

/* -------------------------------------------------------------------------- */
/*                              Style definitions                             */
/* -------------------------------------------------------------------------- */

const listVariantStyles: Record<TabsVariant, string> = {
  pill: "bg-muted rounded-xl p-[3px]",
  underline: "gap-1 border-border",
  outline: "gap-1",
};

const pillListHeight: Record<TabsSize, string> = {
  sm: "h-8",
  md: "h-9",
  lg: "h-11",
};

const triggerVariantStyles: Record<TabsVariant, string> = {
  pill: "rounded-lg flex-1",
  underline: "rounded-md",
  outline:
    "rounded-lg border border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:shadow-sm",
};

const triggerSizeStyles: Record<TabsSize, string> = {
  sm: "px-2 text-xs",
  md: "px-3 text-sm",
  lg: "px-4 text-base",
};

const triggerHeight: Record<TabsSize, string> = {
  sm: "h-7",
  md: "h-8",
  lg: "h-10",
};

/* -------------------------------------------------------------------------- */
/*                       Sliding active-indicator hook                        */
/* -------------------------------------------------------------------------- */

interface IndicatorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

function useActiveIndicator(
  listRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const [rect, setRect] = React.useState<IndicatorRect | null>(null);
  const [ready, setReady] = React.useState(false);

  const update = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!active) {
      setRect(null);
      return;
    }

    const next: IndicatorRect = {
      left: active.offsetLeft,
      top: active.offsetTop,
      width: active.offsetWidth,
      height: active.offsetHeight,
    };

    setRect((prev) =>
      prev &&
      prev.left === next.left &&
      prev.top === next.top &&
      prev.width === next.width &&
      prev.height === next.height
        ? prev
        : next,
    );
  }, [listRef]);

  React.useLayoutEffect(() => {
    if (!enabled) return;
    const list = listRef.current;
    if (!list) return;

    update();
    // Enable transitions only after the first measurement, so the indicator
    // doesn't slide in from (0, 0) on mount.
    const raf = requestAnimationFrame(() => setReady(true));

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(list);
    list.querySelectorAll('[role="tab"]').forEach((el) => resizeObserver.observe(el));

    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(list, {
      attributes: true,
      attributeFilter: ["data-state"],
      childList: true,
      subtree: true,
    });

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [enabled, listRef, update]);

  return { rect, ready };
}

/* -------------------------------------------------------------------------- */
/*                                    Root                                    */
/* -------------------------------------------------------------------------- */

interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
  /** Visual style of the tabs. */
  variant?: TabsVariant;
  /** Size of the triggers. */
  size?: TabsSize;
}

function Tabs({
  className,
  variant = "pill",
  size = "md",
  orientation = "horizontal",
  ...props
}: TabsProps) {
  const value = React.useMemo(
    () => ({ variant, size, orientation }),
    [variant, size, orientation],
  );

  return (
    <TabsContext.Provider value={value}>
      <TabsPrimitive.Root
        data-slot="tabs"
        orientation={orientation}
        className={cn(
          "flex gap-2",
          orientation === "vertical" ? "flex-row" : "flex-col",
          className,
        )}
        {...props}
      />
    </TabsContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    List                                    */
/* -------------------------------------------------------------------------- */

interface TabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {
  /** Animate a sliding indicator behind / under the active tab. Default: true. */
  animated?: boolean;
}

function TabsList({ className, children, animated = true, ref, ...props }: TabsListProps) {
  const { variant, size, orientation } = useTabsContext();
  const innerRef = React.useRef<HTMLDivElement | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  const vertical = orientation === "vertical";
  const showIndicator = animated && variant !== "outline";
  const { rect, ready } = useActiveIndicator(innerRef, showIndicator);

  const indicatorStyle: React.CSSProperties | undefined = rect
    ? variant === "underline"
      ? vertical
        ? { left: rect.left + rect.width - 2, top: rect.top, width: 2, height: rect.height }
        : { left: rect.left, top: rect.top + rect.height - 2, width: rect.width, height: 2 }
      : rect
    : undefined;

  return (
    <TabsPrimitive.List
      ref={setRefs}
      data-slot="tabs-list"
      className={cn(
        "text-muted-foreground relative items-center justify-center",
        "max-w-full overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        vertical ? "flex w-fit flex-col items-stretch" : "inline-flex w-fit",
        variant === "underline" && (vertical ? "border-r" : "border-b"),
        variant === "pill" && !vertical && pillListHeight[size],
        listVariantStyles[variant],
        className,
      )}
      {...props}
    >
      {showIndicator && indicatorStyle && (
        <span
          aria-hidden
          data-slot="tabs-indicator"
          style={indicatorStyle}
          className={cn(
            "pointer-events-none absolute z-0",
            ready && "transition-all duration-200 ease-out motion-reduce:transition-none",
            variant === "pill" && "bg-card rounded-lg shadow-sm",
            variant === "underline" && "bg-primary rounded-full",
          )}
        />
      )}
      {children}
    </TabsPrimitive.List>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Trigger                                  */
/* -------------------------------------------------------------------------- */

interface TabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  /** Leading icon element. */
  icon?: React.ReactNode;
  /** Trailing badge, e.g. a count. */
  badge?: React.ReactNode;
}

function TabsTrigger({ className, children, icon, badge, ...props }: TabsTriggerProps) {
  const { variant, size, orientation } = useTabsContext();

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative z-10 inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap",
        "text-muted-foreground hover:text-foreground data-[state=active]:text-foreground",
        "transition-colors motion-reduce:transition-none",
        "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variant === "pill" && !orientation.startsWith("v") ? "h-full" : triggerHeight[size],
        orientation === "vertical" && "justify-start",
        triggerSizeStyles[size],
        triggerVariantStyles[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      {badge !== undefined && badge !== null && (
        <span
          data-slot="tabs-badge"
          className="bg-primary/10 text-primary ml-0.5 rounded-full px-1.5 py-px text-[10px] leading-4 font-semibold tabular-nums"
        >
          {badge}
        </span>
      )}
    </TabsPrimitive.Trigger>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Content                                  */
/* -------------------------------------------------------------------------- */

interface TabsContentProps extends React.ComponentProps<typeof TabsPrimitive.Content> {
  /** Keep the panel mounted (hidden) when inactive, preserving its state. */
  keepMounted?: boolean;
}

function TabsContent({ className, keepMounted = false, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      forceMount={keepMounted ? true : undefined}
      className={cn(
        "flex-1 outline-none",
        "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1",
        "duration-200 motion-reduce:animate-none",
        keepMounted && "data-[state=inactive]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps, TabsVariant, TabsSize };
