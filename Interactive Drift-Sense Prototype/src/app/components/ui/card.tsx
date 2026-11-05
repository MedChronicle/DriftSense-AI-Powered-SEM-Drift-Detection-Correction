import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-md",
        outline: "bg-transparent",
        // matches the cyan glass panels used across DRIFT-SENSE
        glass:
          "border-white/10 bg-white/[0.06] text-white shadow-[0_4px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl",
      },
      interactive: {
        true: "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        false: "",
      },
    },
    defaultVariants: { variant: "default", interactive: false },
  },
);

interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  /** Render as the child element (e.g. an <a> or router Link) instead of a div. */
  asChild?: boolean;
}

/** Defaults render the original card. `interactive` adds hover lift + keyboard focus ring. */
function Card({
  className,
  variant,
  interactive,
  asChild = false,
  ...props
}: CardProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="card"
      className={cn(cardVariants({ variant, interactive }), className)}
      // a clickable card must be reachable by keyboard
      tabIndex={interactive && !asChild && props.tabIndex === undefined ? 0 : props.tabIndex}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

// The original typed these as div props while rendering <h4>/<p>, which mistyped refs and handlers.
function CardTitle({
  className,
  as: Heading = "h4",
  ...props
}: React.ComponentProps<"h4"> & {
  /** Pick the heading level that fits your page outline. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) {
  return (
    <Heading
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
};
