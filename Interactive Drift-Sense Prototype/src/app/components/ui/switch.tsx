"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Loader2 } from "lucide-react";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*                              Style definitions                             */
/* -------------------------------------------------------------------------- */

type SwitchSize = "sm" | "md" | "lg";
type SwitchVariant = "default" | "success" | "destructive";

const trackSize: Record<SwitchSize, string> = {
  sm: "h-4 w-7",
  md: "h-[1.15rem] w-8",
  lg: "h-6 w-11",
};

const thumbSize: Record<SwitchSize, string> = {
  sm: "size-3 data-[state=checked]:translate-x-[14px]",
  md: "size-4 data-[state=checked]:translate-x-[14px]",
  lg: "size-5 data-[state=checked]:translate-x-[22px]",
};

const iconSize: Record<SwitchSize, string> = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
};

const checkedColor: Record<SwitchVariant, string> = {
  default: "data-[state=checked]:bg-primary",
  success: "data-[state=checked]:bg-emerald-500",
  destructive: "data-[state=checked]:bg-destructive",
};

/* -------------------------------------------------------------------------- */
/*                                   Switch                                   */
/* -------------------------------------------------------------------------- */

interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  /** Track and thumb size. */
  size?: SwitchSize;
  /** Color used when the switch is on. */
  variant?: SwitchVariant;
  /** Show a spinner in the thumb and block interaction (e.g. while saving). */
  loading?: boolean;
  /** Icon shown inside the thumb when on. */
  checkedIcon?: React.ReactNode;
  /** Icon shown inside the thumb when off. */
  uncheckedIcon?: React.ReactNode;
  /** Label text. Renders a clickable <label> wired to the switch. */
  label?: React.ReactNode;
  /** Helper text under the label, linked via aria-describedby. */
  description?: React.ReactNode;
  /** Put the label before or after the switch. Default: "end". */
  labelPosition?: "start" | "end";
  /** Classes for the wrapper that holds the label and description. */
  wrapperClassName?: string;
}

function Switch({
  className,
  size = "md",
  variant = "default",
  loading = false,
  checkedIcon,
  uncheckedIcon,
  label,
  description,
  labelPosition = "end",
  wrapperClassName,
  id: idProp,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SwitchProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const isDisabled = disabled || loading;

  const control = (
    <SwitchPrimitive.Root
      id={id}
      data-slot="switch"
      data-loading={loading ? "" : undefined}
      aria-busy={loading || undefined}
      aria-describedby={
        [ariaDescribedBy, descriptionId].filter(Boolean).join(" ") || undefined
      }
      disabled={isDisabled}
      className={cn(
        "peer data-[state=unchecked]:bg-switch-background dark:data-[state=unchecked]:bg-input/80",
        "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex shrink-0 items-center rounded-full border border-transparent outline-none focus-visible:ring-[3px]",
        "transition-all motion-reduce:transition-none",
        loading
          ? "cursor-progress"
          : "disabled:cursor-not-allowed disabled:opacity-50",
        trackSize[size],
        checkedColor[variant],
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "group bg-card pointer-events-none flex items-center justify-center rounded-full ring-0",
          "dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-card-foreground",
          "transition-transform motion-reduce:transition-none data-[state=unchecked]:translate-x-0",
          thumbSize[size],
        )}
      >
        {loading ? (
          <Loader2
            aria-hidden
            className={cn(
              "text-muted-foreground animate-spin motion-reduce:animate-none",
              iconSize[size],
            )}
          />
        ) : (
          <>
            {checkedIcon && (
              <span
                aria-hidden
                className={cn(
                  "text-primary hidden group-data-[state=checked]:flex [&_svg]:size-full",
                  iconSize[size],
                )}
              >
                {checkedIcon}
              </span>
            )}
            {uncheckedIcon && (
              <span
                aria-hidden
                className={cn(
                  "text-muted-foreground hidden group-data-[state=unchecked]:flex [&_svg]:size-full",
                  iconSize[size],
                )}
              >
                {uncheckedIcon}
              </span>
            )}
          </>
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );

  if (!label && !description) return control;

  return (
    <div
      data-slot="switch-field"
      data-disabled={isDisabled ? "" : undefined}
      className={cn(
        "group flex items-start gap-3",
        labelPosition === "start" && "flex-row-reverse justify-between",
        wrapperClassName,
      )}
    >
      <div className="mt-0.5">{control}</div>
      <div className="grid gap-0.5 group-data-[disabled]:opacity-50">
        {label && (
          <label
            htmlFor={id}
            className="cursor-pointer text-sm leading-none font-medium group-data-[disabled]:cursor-not-allowed"
          >
            {label}
          </label>
        )}
        {description && (
          <p id={descriptionId} className="text-muted-foreground text-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export { Switch };
export type { SwitchProps, SwitchSize, SwitchVariant };
