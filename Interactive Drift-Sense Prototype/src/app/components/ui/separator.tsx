"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*                              Style definitions                             */
/* -------------------------------------------------------------------------- */

type SeparatorVariant = "solid" | "dashed" | "dotted" | "fade";
type SeparatorThickness = "sm" | "md" | "lg";
type SeparatorSpacing = "none" | "sm" | "md" | "lg";

/** Thickness for background-based lines (solid and fade). */
const solidThickness: Record<SeparatorThickness, string> = {
  sm: "data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
  md: "data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-0.5",
  lg: "data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1",
};

/** Thickness for border-based lines (dashed and dotted). */
const borderThickness: Record<SeparatorThickness, string> = {
  sm: "data-[orientation=horizontal]:border-t data-[orientation=vertical]:border-l",
  md: "data-[orientation=horizontal]:border-t-2 data-[orientation=vertical]:border-l-2",
  lg: "data-[orientation=horizontal]:border-t-4 data-[orientation=vertical]:border-l-4",
};

const spacingStyles: Record<SeparatorSpacing, string> = {
  none: "",
  sm: "data-[orientation=horizontal]:my-2 data-[orientation=vertical]:mx-2",
  md: "data-[orientation=horizontal]:my-4 data-[orientation=vertical]:mx-4",
  lg: "data-[orientation=horizontal]:my-6 data-[orientation=vertical]:mx-6",
};

const fadeGradient =
  "data-[orientation=horizontal]:bg-[linear-gradient(to_right,transparent,var(--border),transparent)] data-[orientation=vertical]:bg-[linear-gradient(to_bottom,transparent,var(--border),transparent)]";

function getLineStyles(variant: SeparatorVariant, thickness: SeparatorThickness) {
  switch (variant) {
    case "solid":
      return cn("bg-border", solidThickness[thickness]);
    case "fade":
      return cn("bg-transparent", fadeGradient, solidThickness[thickness]);
    case "dashed":
    case "dotted":
      return cn(
        "border-border bg-transparent data-[orientation=horizontal]:h-0 data-[orientation=vertical]:w-0",
        borderThickness[thickness],
        variant === "dashed" ? "border-dashed" : "border-dotted",
      );
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Separator                                 */
/* -------------------------------------------------------------------------- */

interface SeparatorProps
  extends React.ComponentProps<typeof SeparatorPrimitive.Root> {
  /** Line style. "fade" tapers out at both ends. Default: "solid". */
  variant?: SeparatorVariant;
  /** Line thickness. Default: "sm" (1px). */
  thickness?: SeparatorThickness;
  /** Margin around the separator, perpendicular to its direction. */
  spacing?: SeparatorSpacing;
  /** Text shown in the middle of the line, e.g. "or". */
  label?: React.ReactNode;
  /** Where the label sits along the line. Default: "center". */
  labelPosition?: "start" | "center" | "end";
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  variant = "solid",
  thickness = "sm",
  spacing = "none",
  label,
  labelPosition = "center",
  ...props
}: SeparatorProps) {
  const lineStyles = getLineStyles(variant, thickness);

  if (label === undefined || label === null || label === false) {
    return (
      <SeparatorPrimitive.Root
        data-slot="separator-root"
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
          lineStyles,
          spacingStyles[spacing],
          className,
        )}
        {...props}
      />
    );
  }

  // With a label, the text is real content (read by screen readers), and the
  // two lines on either side are purely decorative.
  const horizontal = orientation === "horizontal";
  const shortLine =
    "flex-none data-[orientation=horizontal]:w-6 data-[orientation=vertical]:h-6";
  const longLine = "flex-1";

  const line = (length: string, key: string) => (
    <SeparatorPrimitive.Root
      key={key}
      data-slot="separator-line"
      decorative
      orientation={orientation}
      className={cn(lineStyles, length)}
    />
  );

  return (
    <div
      data-slot="separator-with-label"
      data-orientation={orientation}
      className={cn(
        "flex items-center gap-3",
        horizontal ? "w-full flex-row" : "h-full flex-col",
        spacingStyles[spacing],
        className,
      )}
    >
      {line(labelPosition === "start" ? shortLine : longLine, "before")}
      <span className="text-muted-foreground shrink-0 text-xs">{label}</span>
      {line(labelPosition === "end" ? shortLine : longLine, "after")}
    </div>
  );
}

export { Separator };
export type {
  SeparatorProps,
  SeparatorVariant,
  SeparatorThickness,
  SeparatorSpacing,
};
