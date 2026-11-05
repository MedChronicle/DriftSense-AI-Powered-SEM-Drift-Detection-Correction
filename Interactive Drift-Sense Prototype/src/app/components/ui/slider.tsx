"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*                              Style definitions                             */
/* -------------------------------------------------------------------------- */

type SliderSize = "sm" | "md" | "lg";
type SliderVariant = "default" | "success" | "destructive";

const trackSize: Record<SliderSize, string> = {
  sm: "data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1",
  md: "data-[orientation=horizontal]:h-4 data-[orientation=vertical]:w-1.5",
  lg: "data-[orientation=horizontal]:h-5 data-[orientation=vertical]:w-2.5",
};

const thumbSize: Record<SliderSize, string> = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
};

/** Thumb width in px, used to line marks up with the thumb's travel range. */
const thumbPx: Record<SliderSize, number> = { sm: 12, md: 16, lg: 20 };

const rangeColor: Record<SliderVariant, string> = {
  default: "bg-primary",
  success: "bg-emerald-500",
  destructive: "bg-destructive",
};

const thumbBorder: Record<SliderVariant, string> = {
  default: "border-primary",
  success: "border-emerald-500",
  destructive: "border-destructive",
};

/* -------------------------------------------------------------------------- */
/*                                   Slider                                   */
/* -------------------------------------------------------------------------- */

interface SliderMark {
  value: number;
  /** Text under the tick. Defaults to `formatValue(value)`. */
  label?: React.ReactNode;
}

interface SliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  /** Track and thumb size. "md" matches the original look. */
  size?: SliderSize;
  /** Color of the filled range. */
  variant?: SliderVariant;
  /** Show the value in a tooltip above the thumb on hover, focus and drag. */
  showValue?: boolean;
  /** Formats values for the tooltip, marks and screen readers. */
  formatValue?: (value: number) => string;
  /** Tick marks with labels under the track (horizontal sliders only). */
  marks?: Array<number | SliderMark>;
  /** Accessible names per thumb. Defaults to Minimum/Maximum for ranges. */
  thumbLabels?: string[];
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  size = "md",
  variant = "default",
  showValue = false,
  formatValue = String,
  marks,
  thumbLabels,
  onValueChange,
  orientation = "horizontal",
  ...props
}: SliderProps) {
  // Track the current values ourselves (when uncontrolled) so the tooltip and
  // thumb count stay in sync. Radix renders one thumb per value.
  const [internalValues, setInternalValues] = React.useState<number[]>(() =>
    Array.isArray(defaultValue) ? defaultValue : [min],
  );
  const values = Array.isArray(value) ? value : internalValues;

  const handleValueChange = React.useCallback(
    (next: number[]) => {
      if (!Array.isArray(value)) setInternalValues(next);
      onValueChange?.(next);
    },
    [value, onValueChange],
  );

  const labels =
    thumbLabels ?? (values.length === 2 ? ["Minimum", "Maximum"] : undefined);

  const markItems: SliderMark[] | undefined = marks?.map((mark) =>
    typeof mark === "number" ? { value: mark } : mark,
  );
  const showMarks = Boolean(markItems?.length) && orientation === "horizontal";

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      orientation={orientation}
      onValueChange={handleValueChange}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        showValue && orientation === "horizontal" && "mt-8",
        showMarks && "mb-8",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
          trackSize[size],
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            rangeColor[variant],
          )}
        />
      </SliderPrimitive.Track>

      {values.map((current, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={labels?.[index]}
          aria-valuetext={formatValue(current)}
          className={cn(
            "group bg-background ring-ring/50 relative block shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] motion-reduce:transition-none",
            "hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
            thumbSize[size],
            thumbBorder[variant],
          )}
        >
          {showValue && (
            <span
              aria-hidden
              data-slot="slider-tooltip"
              className={cn(
                "bg-foreground text-background pointer-events-none absolute rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap tabular-nums opacity-0 shadow-md transition-opacity motion-reduce:transition-none",
                "group-hover:opacity-100 group-focus:opacity-100",
                // Horizontal: above the thumb. Vertical: to the right.
                "group-data-[orientation=horizontal]:bottom-full group-data-[orientation=horizontal]:left-1/2 group-data-[orientation=horizontal]:mb-2 group-data-[orientation=horizontal]:-translate-x-1/2",
                "group-data-[orientation=vertical]:top-1/2 group-data-[orientation=vertical]:left-full group-data-[orientation=vertical]:ml-2 group-data-[orientation=vertical]:-translate-y-1/2",
              )}
            >
              {formatValue(current)}
            </span>
          )}
        </SliderPrimitive.Thumb>
      ))}

      {showMarks && markItems && (
        <div
          aria-hidden
          data-slot="slider-marks"
          className="pointer-events-none absolute inset-x-0 top-full mt-1 h-6"
        >
          {markItems.map((mark) => {
            const pct = max === min ? 0 : ((mark.value - min) / (max - min)) * 100;
            // Same math Radix uses so ticks sit under the thumb's centre.
            const offset = (0.5 - pct / 100) * thumbPx[size];

            return (
              <span
                key={mark.value}
                className="text-muted-foreground absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1 text-xs"
                style={{ left: `calc(${pct}% + ${offset}px)` }}
              >
                <span className="bg-border h-1.5 w-px" />
                <span className="tabular-nums">
                  {mark.label ?? formatValue(mark.value)}
                </span>
              </span>
            );
          })}
        </div>
      )}
    </SliderPrimitive.Root>
  );
}

export { Slider };
export type { SliderProps, SliderMark, SliderSize, SliderVariant };
