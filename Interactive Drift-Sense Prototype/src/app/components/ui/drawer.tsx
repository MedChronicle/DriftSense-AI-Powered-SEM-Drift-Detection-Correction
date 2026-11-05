"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { Loader2Icon } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

type DrawerSize = "sm" | "md" | "lg" | "full";

// Width for left/right drawers. "md" matches the original sizing.
const DRAWER_SIZE: Record<DrawerSize, string> = {
  sm: "data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-xs data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:sm:max-w-xs",
  md: "data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-sm data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:sm:max-w-sm",
  lg: "data-[vaul-drawer-direction=right]:w-11/12 data-[vaul-drawer-direction=right]:sm:max-w-xl data-[vaul-drawer-direction=left]:w-11/12 data-[vaul-drawer-direction=left]:sm:max-w-xl",
  full: "data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-none data-[vaul-drawer-direction=left]:w-full data-[vaul-drawer-direction=left]:sm:max-w-none",
};

type DrawerContentProps = React.ComponentProps<
  typeof DrawerPrimitive.Content
> & {
  /** Width of left/right drawers (default "md") */
  size?: DrawerSize;
  /** Show the drag handle on bottom drawers (default true) */
  showHandle?: boolean;
};

function DrawerContent({
  className,
  children,
  size = "md",
  showHandle = true,
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80dvh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80dvh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:border-l",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:border-r",
          DRAWER_SIZE[size],
          className,
        )}
        {...props}
      >
        {showHandle && (
          <div
            aria-hidden="true"
            className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
          />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

/** Scrollable middle section. Keeps header and footer in place on long content. */
function DrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-body"
      className={cn("min-h-0 flex-1 overflow-y-auto px-4", className)}
      {...props}
    />
  );
}

function DrawerFooter({
  className,
  sticky = false,
  ...props
}: React.ComponentProps<"div"> & {
  /** Pin to the bottom while content scrolls */
  sticky?: boolean;
}) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "mt-auto flex flex-col gap-2 p-4",
        sticky && "bg-background sticky bottom-0 border-t",
        className,
      )}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

type ConfirmDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  /** Use the destructive button style */
  destructive?: boolean;
  /** May be async. The drawer closes when it resolves and stays open if it throws. */
  onConfirm: () => void | Promise<void>;
  onError?: (error: unknown) => void;
  /** Drawer edge (default "bottom") */
  direction?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
};

/** Confirm/cancel drawer that handles async actions and pending state */
function ConfirmDrawer({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onError,
  direction = "bottom",
  children,
}: ConfirmDrawerProps) {
  const [pending, setPending] = React.useState(false);

  const handleOpenChange = (next: boolean) => {
    if (pending) return; // don't close mid-action
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      onError?.(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      direction={direction}
      dismissible={!pending}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        {children && <DrawerBody>{children}</DrawerBody>}
        <DrawerFooter>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={pending}
            aria-busy={pending || undefined}
            onClick={handleConfirm}
          >
            {pending && (
              <Loader2Icon
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
              />
            )}
            {confirmLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => handleOpenChange(false)}
          >
            {cancelLabel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/** Open state helper. Spread `drawerProps` on <Drawer />. */
function useDrawer(initialOpen: boolean = false) {
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
    drawerProps: { open, onOpenChange: setOpen },
  };
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  ConfirmDrawer,
  useDrawer,
};
export type { DrawerContentProps, DrawerSize, ConfirmDrawerProps };
