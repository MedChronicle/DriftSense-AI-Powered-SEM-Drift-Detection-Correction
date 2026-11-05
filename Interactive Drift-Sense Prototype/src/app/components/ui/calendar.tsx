"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

// Defined once at module level. The original created new component functions on every
// render, which made React unmount/remount the nav icons each time the calendar updated.
const IconLeft = ({ className, ...props }: React.ComponentProps<typeof ChevronLeft>) => (
  <ChevronLeft className={cn("size-4", className)} {...props} />
);
const IconRight = ({ className, ...props }: React.ComponentProps<typeof ChevronRight>) => (
  <ChevronRight className={cn("size-4", className)} {...props} />
);

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /** "glass" matches the cyan glass look used across DRIFT-SENSE. */
  variant?: "default" | "glass";
};

/**
 * Written for react-day-picker v8 (classNames like `caption`, `nav_button`, `IconLeft`).
 * v9 renamed these; if you upgrade the library this file needs migrating.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  variant = "default",
  ...props
}: CalendarProps) {
  const glass = variant === "glass";
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", glass && "rounded-xl border border-cyan-400/20 bg-[rgba(3,8,22,0.9)] text-cyan-50 backdrop-blur-md", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        // used when captionLayout="dropdown" / "dropdown-buttons" (month/year pickers)
        caption_dropdowns: "flex items-center justify-center gap-1",
        dropdown:
          "absolute inset-0 z-10 w-full cursor-pointer appearance-none opacity-0",
        dropdown_month: "relative inline-flex items-center",
        dropdown_year: "relative inline-flex items-center",
        dropdown_icon: "ml-1 size-3.5 opacity-60",
        vhidden: "hidden",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          glass && "border-cyan-400/30 text-cyan-200",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected: glass
          ? "bg-cyan-400/25 text-cyan-50 hover:bg-cyan-400/30 hover:text-cyan-50 focus:bg-cyan-400/30 focus:text-cyan-50"
          : "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        // ring keeps "today" visible even when it is also selected
        day_today: "bg-accent text-accent-foreground ring-1 ring-inset ring-ring/40",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50 line-through decoration-1",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{ IconLeft, IconRight }}
      {...props}
    />
  );
}

export { Calendar };
