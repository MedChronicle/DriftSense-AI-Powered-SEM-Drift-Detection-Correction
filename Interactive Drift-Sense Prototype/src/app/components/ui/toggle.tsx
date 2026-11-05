"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2Icon } from "lucide-react";

import { cn } from "./utils";

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] motion-reduce:transition-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        solid:
          "bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90 data-[state=on]:hover:text-primary-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ToggleProps = React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    /** Icon shown when off (and when on, unless `pressedIcon` is set) */
    icon?: React.ReactNode;
    /** Icon shown when on */
    pressedIcon?: React.ReactNode;
    /** Shows a spinner and blocks toggling */
    loading?: boolean;
  };

function Toggle({
  className,
  variant,
  size,
  icon,
  pressedIcon,
  loading = false,
  disabled,
  children,
  ...props
}: ToggleProps) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    >
      {loading ? (
        <Loader2Icon
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      ) : icon ? (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex",
              pressedIcon && "group-data-[state=on]/toggle:hidden",
            )}
          >
            {icon}
          </span>
          {pressedIcon && (
            <span
              aria-hidden="true"
              className="hidden group-data-[state=on]/toggle:inline-flex"
            >
              {pressedIcon}
            </span>
          )}
        </>
      ) : null}
      {children}
    </TogglePrimitive.Root>
  );
}

type ToggleLabelledProps = Omit<ToggleProps, "children"> & {
  label: React.ReactNode;
  /** Hide the text below this breakpoint, keeping only the icon (default: never hide) */
  collapseBelow?: "sm" | "md" | "lg";
};

const COLLAPSE: Record<NonNullable<ToggleLabelledProps["collapseBelow"]>, string> = {
  sm: "hidden sm:inline",
  md: "hidden md:inline",
  lg: "hidden lg:inline",
};

/** Icon plus text. Use `collapseBelow` for toolbars that shrink to icons on mobile. */
function ToggleLabelled({
  label,
  collapseBelow,
  "aria-label": ariaLabel,
  ...props
}: ToggleLabelledProps) {
  return (
    <Toggle
      aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
      {...props}
    >
      <span className={collapseBelow ? COLLAPSE[collapseBelow] : undefined}>
        {label}
      </span>
    </Toggle>
  );
}

/** Pressed-state helper. Spread `toggleProps` on <Toggle />. */
function useToggle(initialPressed: boolean = false) {
  const [pressed, setPressed] = React.useState(initialPressed);
  const toggle = React.useCallback(() => setPressed((p) => !p), []);
  const reset = React.useCallback(
    () => setPressed(initialPressed),
    [initialPressed],
  );

  return {
    pressed,
    setPressed,
    toggle,
    reset,
    toggleProps: { pressed, onPressedChange: setPressed },
  };
}

export { Toggle, ToggleLabelled, useToggle, toggleVariants };
export type { ToggleProps, ToggleLabelledProps };
