import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 [a&]:hover:bg-emerald-500/25",
        warning:
          "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 [a&]:hover:bg-amber-500/25",
        info:
          "border-sky-500/30 bg-sky-500/15 text-sky-600 dark:text-sky-400 [a&]:hover:bg-sky-500/25",
        // matches the cyan glass look used across DRIFT-SENSE
        glass:
          "border-cyan-400/30 bg-cyan-400/10 text-cyan-200 backdrop-blur-sm [a&]:hover:bg-cyan-400/20",
      },
      size: {
        sm: "px-1.5 py-0 text-[10px]",
        md: "px-2 py-0.5 text-xs", // original size
        lg: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  /** Leading status dot that inherits the badge's text color. */
  dot?: boolean;
  /** Make the dot pulse, e.g. for a live/processing state. */
  pulse?: boolean;
  /** Shows an × button and calls this when it is clicked. */
  onRemove?: () => void;
}

/** Same API as before; `variant="default"` and size "md" render exactly the original badge. */
function Badge({
  className,
  variant,
  size,
  asChild = false,
  dot = false,
  pulse = false,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  const classes = cn(badgeVariants({ variant, size }), className);

  // Slot needs exactly one child, so the extras (dot, remove button) only apply to the plain <span>.
  if (asChild) {
    return (
      <Slot data-slot="badge" className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <span data-slot="badge" className={classes} {...props}>
      {dot && (
        <span aria-hidden className="relative flex size-1.5">
          {pulse && (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none" />
          )}
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-0.5 rounded-sm opacity-60 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
        >
          <XIcon />
        </button>
      )}
    </span>
  );
}

export { Badge, badgeVariants };
