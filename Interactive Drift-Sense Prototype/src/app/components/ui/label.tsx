"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "./utils";

type LabelSize = "sm" | "md" | "lg";

const LABEL_SIZE: Record<LabelSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & {
  /** Shows an asterisk after the label (visual only) */
  required?: boolean;
  /** Shows a muted "(optional)" suffix */
  optional?: boolean;
  /** Helper text shown under the label */
  description?: React.ReactNode;
  /** Dims the label. Use when the input isn't a preceding sibling. */
  disabled?: boolean;
  /** Text size (default "md") */
  size?: LabelSize;
};

function Label({
  className,
  required = false,
  optional = false,
  description,
  disabled = false,
  size = "md",
  children,
  ...props
}: LabelProps) {
  const label = (
    <LabelPrimitive.Root
      data-slot="label"
      data-disabled={disabled || undefined}
      className={cn(
        "flex items-center gap-2 leading-snug font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        LABEL_SIZE[size],
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span
          aria-hidden="true"
          data-slot="label-required-mark"
          className="text-destructive -ml-1"
        >
          *
        </span>
      )}
      {optional && !required && (
        <span
          data-slot="label-optional"
          className="text-muted-foreground -ml-1 font-normal"
        >
          (optional)
        </span>
      )}
    </LabelPrimitive.Root>
  );

  if (!description) return label;

  return (
    <div data-slot="label-wrapper" className="grid gap-1">
      {label}
      <p
        data-slot="label-description"
        className={cn(
          "text-muted-foreground text-sm font-normal",
          disabled && "opacity-50",
        )}
      >
        {description}
      </p>
    </div>
  );
}

/** Muted inline hint, e.g. a limit or unit. Put it inside a Label. */
function LabelHint({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="label-hint"
      className={cn("text-muted-foreground ml-auto text-xs font-normal", className)}
      {...props}
    />
  );
}

export { Label, LabelHint };
export type { LabelProps, LabelSize };
