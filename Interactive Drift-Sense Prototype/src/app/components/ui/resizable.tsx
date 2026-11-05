"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*                              Style definitions                             */
/* -------------------------------------------------------------------------- */

type HandleHitArea = "sm" | "md" | "lg";

/** Invisible area around the 1px line that can be grabbed. */
const hitAreaStyles: Record<HandleHitArea, string> = {
  sm: "after:w-1 data-[panel-group-direction=vertical]:after:h-1",
  md: "after:w-2 data-[panel-group-direction=vertical]:after:h-2",
  lg: "after:w-3 data-[panel-group-direction=vertical]:after:h-3",
};

/* -------------------------------------------------------------------------- */
/*                                 Panel group                                */
/* -------------------------------------------------------------------------- */

/**
 * Pass `autoSaveId="my-layout"` to remember panel sizes across page loads
 * (stored in localStorage by react-resizable-panels).
 */
function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Panel                                   */
/* -------------------------------------------------------------------------- */

function ResizablePanel({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn("min-w-0", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Handle                                   */
/* -------------------------------------------------------------------------- */

interface ResizableHandleProps
  extends React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> {
  /** Show a grip icon in the middle of the handle. */
  withHandle?: boolean;
  /** Size of the grabbable area around the line. Default: "md". */
  hitArea?: HandleHitArea;
  /**
   * Panel to collapse/expand when the handle is double-clicked.
   * The panel must be `collapsible`.
   */
  collapsePanelRef?: React.RefObject<ResizablePrimitive.ImperativePanelHandle | null>;
}

function ResizableHandle({
  withHandle,
  hitArea = "md",
  collapsePanelRef,
  className,
  onDoubleClick,
  ...props
}: ResizableHandleProps) {
  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onDoubleClick?.(event);
    if (event.defaultPrevented) return;

    const panel = collapsePanelRef?.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  };

  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      onDoubleClick={handleDoubleClick}
      className={cn(
        // Line
        "group bg-border relative flex w-px items-center justify-center transition-colors motion-reduce:transition-none",
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        // Hover / drag feedback (set by react-resizable-panels)
        "data-[resize-handle-state=hover]:bg-primary/50 data-[resize-handle-state=drag]:bg-primary",
        // Keyboard focus
        "focus-visible:ring-ring focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden",
        // Expanded hit area
        "after:absolute after:inset-y-0 after:left-1/2 after:-translate-x-1/2",
        "data-[panel-group-direction=vertical]:after:inset-x-0 data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2",
        hitAreaStyles[hitArea],
        // Rotate the grip for vertical groups
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div
          className={cn(
            "bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border transition-colors motion-reduce:transition-none",
            "group-data-[resize-handle-state=drag]:bg-primary",
          )}
        >
          <GripVerticalIcon aria-hidden className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

/* -------------------------------------------------------------------------- */
/*                         Collapsible panel helper hook                      */
/* -------------------------------------------------------------------------- */

/**
 * Wires up everything needed for a collapsible panel with a toggle button
 * and a double-click-to-collapse handle.
 *
 *   const sidebar = useCollapsiblePanel();
 *   <ResizablePanel {...sidebar.panelProps} defaultSize={25} collapsedSize={4} />
 *   <ResizableHandle collapsePanelRef={sidebar.ref} />
 *   <button onClick={sidebar.toggle}>{sidebar.collapsed ? "Open" : "Close"}</button>
 */
function useCollapsiblePanel() {
  const ref = React.useRef<ResizablePrimitive.ImperativePanelHandle>(null);
  const [collapsed, setCollapsed] = React.useState(false);

  const toggle = React.useCallback(() => {
    const panel = ref.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);

  const panelProps = React.useMemo(
    () => ({
      ref,
      collapsible: true as const,
      onCollapse: () => setCollapsed(true),
      onExpand: () => setCollapsed(false),
    }),
    [],
  );

  return { ref, collapsed, toggle, panelProps };
}

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  useCollapsiblePanel,
};
export type { ResizableHandleProps, HandleHitArea };
