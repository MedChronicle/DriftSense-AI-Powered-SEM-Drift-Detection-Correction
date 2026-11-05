"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";

type ProgressSize = "sm" | "md" | "lg";
type ProgressVariant = "default" | "success" | "warning" | "destructive";

const TRACK_SIZE: Record<ProgressSize, string> = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const TRACK_COLOR: Record<ProgressVariant, string> = {
  default: "bg-primary/20",
  success: "bg-green-500/20",
  warning: "bg-amber-500/20",
  destructive: "bg-destructive/20",
};

const INDICATOR_COLOR: Record<ProgressVariant, string> = {
  default: "bg-primary",
  success: "bg-green-500",
  warning: "bg-amber-500",
  destructive: "bg-destructive",
};

const STROKE_COLOR: Record<ProgressVariant, string> = {
  default: "stroke-primary",
  success: "stroke-green-500",
  warning: "stroke-amber-500",
  destructive: "stroke-destructive",
};

function toPercent(value: number | null | undefined, max: number) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value ?? 0, 0), safeMax);
  return (clamped / safeMax) * 100;
}

type ProgressProps = Omit<
  React.ComponentProps<typeof ProgressPrimitive.Root>,
  "value" | "max"
> & {
  value?: number | null;
  /** Value that counts as 100% (default 100) */
  max?: number;
  /** Bar thickness (default "md", same as the original h-2) */
  size?: ProgressSize;
  variant?: ProgressVariant;
  /** Unknown duration: shows a sliding bar and no value */
  indeterminate?: boolean;
};

function Progress({
  className,
  value,
  max = 100,
  size = "md",
  variant = "default",
  indeterminate = false,
  ...props
}: ProgressProps) {
  const percent = toPercent(value, max);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={indeterminate ? null : Math.min(Math.max(value ?? 0, 0), max)}
      max={max}
      className={cn(
        "relative w-full overflow-hidden rounded-full",
        TRACK_SIZE[size],
        TRACK_COLOR[variant],
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full",
          INDICATOR_COLOR[variant],
          indeterminate
            ? "w-2/5 animate-[progress-indeterminate_1.4s_ease-in-out_infinite] motion-reduce:animate-none"
            : "w-full flex-1 transition-all motion-reduce:transition-none",
        )}
        style={
          indeterminate
            ? undefined
            : { transform: `translateX(-${100 - percent}%)` }
        }
      />
    </ProgressPrimitive.Root>
  );
}

type ProgressFieldProps = ProgressProps & {
  label: React.ReactNode;
  /** Show the percentage next to the label (default true, hidden when indeterminate) */
  showValue?: boolean;
  /** Custom readout, e.g. (v) => `${v} of 20 files` */
  formatValue?: (percent: number) => React.ReactNode;
  wrapperClassName?: string;
};

/** Progress bar with a label and a percentage readout */
function ProgressField({
  label,
  showValue = true,
  formatValue,
  wrapperClassName,
  value,
  max = 100,
  indeterminate = false,
  ...props
}: ProgressFieldProps) {
  const labelId = React.useId();
  const percent = Math.round(toPercent(value, max));

  return (
    <div data-slot="progress-field" className={cn("grid gap-2", wrapperClassName)}>
      <div className="flex items-center justify-between text-sm">
        <span id={labelId} className="font-medium">
          {label}
        </span>
        {showValue && !indeterminate && (
          <span className="text-muted-foreground tabular-nums">
            {formatValue ? formatValue(percent) : `${percent}%`}
          </span>
        )}
      </div>
      <Progress
        aria-labelledby={labelId}
        value={value}
        max={max}
        indeterminate={indeterminate}
        {...props}
      />
    </div>
  );
}

type ProgressCircleProps = Omit<React.ComponentProps<"div">, "children"> & {
  value?: number | null;
  max?: number;
  /** Diameter in px (default 64) */
  size?: number;
  /** Ring thickness in px (default 6) */
  strokeWidth?: number;
  variant?: ProgressVariant;
  indeterminate?: boolean;
  /** Content in the center, e.g. the percentage */
  children?: React.ReactNode;
};

/** Circular progress. Accessible label via aria-label or aria-labelledby. */
function ProgressCircle({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  variant = "default",
  indeterminate = false,
  className,
  children,
  ...props
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = toPercent(value, max);
  const offset = circumference * (1 - (indeterminate ? 0.25 : percent / 100));

  return (
    <div
      role="progressbar"
      data-slot="progress-circle"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : Math.round((percent / 100) * max)}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className={cn(
          "-rotate-90",
          indeterminate &&
            "animate-spin [animation-duration:1.2s] motion-reduce:animate-none",
        )}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] motion-reduce:transition-none",
            STROKE_COLOR[variant],
          )}
        />
      </svg>
      {children && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium tabular-nums">
          {children}
        </span>
      )}
    </div>
  );
}

export { Progress, ProgressField, ProgressCircle };
export type {
  ProgressProps,
  ProgressFieldProps,
  ProgressCircleProps,
  ProgressSize,
  ProgressVariant,
};
