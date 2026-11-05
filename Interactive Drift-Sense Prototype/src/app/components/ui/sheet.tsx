"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*                              Style definitions                             */
/* -------------------------------------------------------------------------- */

type SheetSide = "top" | "right" | "bottom" | "left";
type SheetSize = "sm" | "md" | "lg" | "full";

/** Width limits for left/right sheets. "md" matches the original. */
const horizontalSizes: Record<SheetSize, string> = {
  sm: "w-3/4 sm:max-w-xs",
  md: "w-3/4 sm:max-w-sm",
  lg: "w-5/6 sm:max-w-lg",
  full: "w-full sm:max-w-none",
};

/** Height limits for top/bottom sheets, so long content scrolls inside. */
const verticalSizes: Record<SheetSize, string> = {
  sm: "max-h-[40vh]",
  md: "max-h-[85vh]",
  lg: "max-h-[95vh]",
  full: "h-full max-h-none",
};

const sideStyles: Record<SheetSide, string> = {
  right:
    "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full border-l",
  left: "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full border-r",
  top: "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
  bottom:
    "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
};

/** Draggable strip along the inner edge of the sheet. */
const handlePosition: Record<SheetSide, string> = {
  bottom: "inset-x-0 top-0 h-4",
  top: "inset-x-0 bottom-0 h-4",
  right: "inset-y-0 left-0 w-4",
  left: "inset-y-0 right-0 w-4",
};

/* -------------------------------------------------------------------------- */
/*                                Basic parts                                 */
/* -------------------------------------------------------------------------- */

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                               Swipe-to-close                               */
/* -------------------------------------------------------------------------- */

interface SwipeHandleProps {
  side: SheetSide;
  contentRef: React.RefObject<HTMLDivElement | null>;
  onDismiss: () => void;
}

/**
 * A grab strip: drag it away from the screen edge to dismiss the sheet.
 * Past ~30% of the sheet's size (max 150px) on release it closes; otherwise
 * it springs back.
 */
function SwipeHandle({ side, contentRef, onDismiss }: SwipeHandleProps) {
  const startRef = React.useRef<number | null>(null);

  const horizontal = side === "left" || side === "right";
  // +1 when dismissing means moving right/down, -1 means left/up.
  const dir = side === "right" || side === "bottom" ? 1 : -1;

  const coord = (e: React.PointerEvent) => (horizontal ? e.clientX : e.clientY);
  const translate = (px: number) =>
    horizontal ? `translateX(${px}px)` : `translateY(${px}px)`;
  const travel = (e: React.PointerEvent) =>
    Math.max(0, (coord(e) - (startRef.current ?? 0)) * dir);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = contentRef.current;
    if (!el) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = coord(e);
    el.style.transition = "none";
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = contentRef.current;
    if (startRef.current === null || !el) return;
    el.style.transform = translate(travel(e) * dir);
  };

  const finish = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const el = contentRef.current;
    if (startRef.current === null || !el) return;

    const distance = travel(e);
    startRef.current = null;
    const size = horizontal ? el.offsetWidth : el.offsetHeight;

    if (!cancelled && distance > Math.min(size * 0.3, 150)) {
      el.style.transition = "transform 150ms ease-out";
      el.style.transform = translate(size * dir);
      window.setTimeout(() => {
        // Hide before Radix plays its exit animation, so the sheet doesn't
        // flash back on screen.
        el.style.opacity = "0";
        onDismiss();
      }, 150);
    } else {
      el.style.transition = "transform 200ms ease-out";
      el.style.transform = "";
      window.setTimeout(() => {
        el.style.transition = "";
      }, 200);
    }
  };

  return (
    <div
      aria-hidden
      data-slot="sheet-handle"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => finish(e, false)}
      onPointerCancel={(e) => finish(e, true)}
      className={cn(
        "absolute z-10 flex cursor-grab touch-none items-center justify-center active:cursor-grabbing",
        handlePosition[side],
      )}
    >
      <span
        className={cn(
          "bg-muted-foreground/30 rounded-full",
          horizontal ? "h-12 w-1" : "h-1 w-12",
        )}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Content                                  */
/* -------------------------------------------------------------------------- */

interface SheetContentProps
  extends React.ComponentProps<typeof SheetPrimitive.Content> {
  /** Which edge the sheet slides from. Default: "right". */
  side?: SheetSide;
  /** Width (left/right) or max height (top/bottom). Default: "md". */
  size?: SheetSize;
  /** Show the X button in the corner. Default: true. */
  showCloseButton?: boolean;
  /** Show the dimmed backdrop. Default: true. */
  overlay?: boolean;
  overlayClassName?: string;
  /**
   * When false, clicking outside and pressing Escape no longer close the
   * sheet (useful for unsaved forms). The close button still works.
   */
  dismissible?: boolean;
  /**
   * Show a grab handle and let users drag the sheet away to close it.
   * Default: true for bottom sheets, false otherwise.
   */
  swipeToClose?: boolean;
}

function SheetContent({
  className,
  children,
  side = "right",
  size = "md",
  showCloseButton = true,
  overlay = true,
  overlayClassName,
  dismissible = true,
  swipeToClose,
  onInteractOutside,
  onEscapeKeyDown,
  ref,
  ...props
}: SheetContentProps) {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const closeRef = React.useRef<HTMLButtonElement | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  const swipeEnabled = swipeToClose ?? side === "bottom";
  const horizontal = side === "left" || side === "right";

  return (
    <SheetPortal>
      {overlay && <SheetOverlay className={overlayClassName} />}
      <SheetPrimitive.Content
        ref={setRefs}
        data-slot="sheet-content"
        onInteractOutside={(event) => {
          if (!dismissible) event.preventDefault();
          onInteractOutside?.(event);
        }}
        onEscapeKeyDown={(event) => {
          if (!dismissible) event.preventDefault();
          onEscapeKeyDown?.(event);
        }}
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 motion-reduce:animate-none",
          sideStyles[side],
          horizontal ? horizontalSizes[size] : verticalSizes[size],
          className,
        )}
        {...props}
      >
        {children}

        {swipeEnabled && (
          <SwipeHandle
            side={side}
            contentRef={contentRef}
            onDismiss={() => closeRef.current?.click()}
          />
        )}

        {/* Always rendered so swipe-to-close can trigger it; hidden when the
            visible X is turned off. */}
        <SheetPrimitive.Close
          ref={closeRef}
          hidden={!showCloseButton}
          tabIndex={showCloseButton ? undefined : -1}
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none motion-reduce:transition-none"
        >
          <XIcon aria-hidden className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

/* -------------------------------------------------------------------------- */
/*                         Header, body, footer, text                         */
/* -------------------------------------------------------------------------- */

interface SheetSectionProps extends React.ComponentProps<"div"> {
  /** Draw a divider between this section and the body. */
  bordered?: boolean;
}

function SheetHeader({ className, bordered = false, ...props }: SheetSectionProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col gap-1.5 p-4",
        bordered && "border-b",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The scrolling middle of the sheet. Put long content here so the header and
 * footer stay in place.
 */
function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn("min-h-0 flex-1 overflow-y-auto px-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, bordered = false, ...props }: SheetSectionProps) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col gap-2 p-4",
        bordered && "border-t",
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
export type { SheetContentProps, SheetSectionProps, SheetSide, SheetSize };
