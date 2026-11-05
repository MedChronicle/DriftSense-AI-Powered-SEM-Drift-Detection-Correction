"use client";

import type { CSSProperties, ReactNode } from "react";
import { useTheme } from "next-themes";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, toast, type ExternalToast, type ToasterProps } from "sonner";

/* -------------------------------------------------------------------------- */
/*                                  Defaults                                  */
/* -------------------------------------------------------------------------- */

const defaultIcons: NonNullable<ToasterProps["icons"]> = {
  success: <CircleCheckIcon aria-hidden className="size-4" />,
  info: <InfoIcon aria-hidden className="size-4" />,
  warning: <TriangleAlertIcon aria-hidden className="size-4" />,
  error: <OctagonXIcon aria-hidden className="size-4" />,
  loading: (
    <Loader2Icon
      aria-hidden
      className="size-4 animate-spin motion-reduce:animate-none"
    />
  ),
};

/** Sonner needs `!` here to beat its own injected button styles. */
const defaultClassNames = {
  description: "!text-muted-foreground",
  actionButton: "!bg-primary !text-primary-foreground !font-medium",
  cancelButton: "!bg-muted !text-muted-foreground !font-medium",
  closeButton:
    "!bg-popover !text-popover-foreground !border-border hover:!bg-accent",
};

const defaultStyle = {
  "--normal-bg": "var(--popover)",
  "--normal-text": "var(--popover-foreground)",
  "--normal-border": "var(--border)",
  // Used when `richColors` is enabled.
  "--success-bg": "color-mix(in oklab, var(--popover), oklch(0.72 0.17 150) 12%)",
  "--success-text": "var(--popover-foreground)",
  "--success-border": "color-mix(in oklab, var(--border), oklch(0.72 0.17 150) 40%)",
  "--info-bg": "color-mix(in oklab, var(--popover), oklch(0.7 0.14 240) 12%)",
  "--info-text": "var(--popover-foreground)",
  "--info-border": "color-mix(in oklab, var(--border), oklch(0.7 0.14 240) 40%)",
  "--warning-bg": "color-mix(in oklab, var(--popover), oklch(0.8 0.16 85) 14%)",
  "--warning-text": "var(--popover-foreground)",
  "--warning-border": "color-mix(in oklab, var(--border), oklch(0.8 0.16 85) 45%)",
  "--error-bg": "color-mix(in oklab, var(--popover), var(--destructive) 12%)",
  "--error-text": "var(--popover-foreground)",
  "--error-border": "color-mix(in oklab, var(--border), var(--destructive) 45%)",
} as CSSProperties;

/* -------------------------------------------------------------------------- */
/*                                   Toaster                                  */
/* -------------------------------------------------------------------------- */

/**
 * Mount once near the root of your app. Anything you pass (icons, style,
 * toastOptions, ...) is merged on top of the defaults below.
 */
const Toaster = ({
  icons,
  style,
  toastOptions,
  closeButton = true,
  position = "bottom-right",
  visibleToasts = 4,
  duration = 4000,
  ...props
}: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={position}
      closeButton={closeButton}
      visibleToasts={visibleToasts}
      duration={duration}
      icons={{ ...defaultIcons, ...icons }}
      style={{ ...defaultStyle, ...style }}
      toastOptions={{
        ...toastOptions,
        classNames: { ...defaultClassNames, ...toastOptions?.classNames },
      }}
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/** Turn anything thrown into a readable message. */
function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

/** Show an error toast from a caught value: `catch (e) { toastError(e) }`. */
function toastError(error: unknown, fallback?: string, options?: ExternalToast) {
  return toast.error(getErrorMessage(error, fallback), options);
}

/** Show a toast with an Undo button that stays a bit longer than usual. */
function toastUndo(message: ReactNode, onUndo: () => void, options?: ExternalToast) {
  return toast(message, {
    duration: 6000,
    ...options,
    action: { label: "Undo", onClick: onUndo },
  });
}

export { Toaster, toast, toastError, toastUndo, getErrorMessage };
