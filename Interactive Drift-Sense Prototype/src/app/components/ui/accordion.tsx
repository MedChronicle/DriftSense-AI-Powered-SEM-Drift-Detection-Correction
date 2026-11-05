"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

type AccordionVariant = "default" | "card" | "glass";

const VariantContext = React.createContext<AccordionVariant>("default");

const ITEM_STYLES: Record<AccordionVariant, string> = {
  default: "border-b last:border-b-0",
  card: "mb-2 rounded-lg border bg-card px-4 last:mb-0",
  // matches the cyan glass panels used across DRIFT-SENSE
  glass:
    "mb-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 backdrop-blur-md transition-colors last:mb-0 data-[state=open]:border-cyan-400/30 data-[state=open]:bg-cyan-400/[0.06]",
};

/** Same API as before, plus an optional `variant` ("default" | "card" | "glass"). */
function Accordion({
  variant = "default",
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root> & { variant?: AccordionVariant }) {
  return (
    <VariantContext.Provider value={variant}>
      <AccordionPrimitive.Root data-slot="accordion" {...props} />
    </VariantContext.Provider>
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const variant = React.useContext(VariantContext);
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(ITEM_STYLES[variant], className)}
      {...props}
    />
  );
}

interface AccordionTriggerProps
  extends React.ComponentProps<typeof AccordionPrimitive.Trigger> {
  /** Leading icon, e.g. <Cpu size={14} />. */
  icon?: React.ReactNode;
  /** Small trailing label, e.g. a count or status ("3 runs"). */
  badge?: React.ReactNode;
  /** Hide the chevron if you supply your own affordance. */
  hideChevron?: boolean;
}

function AccordionTrigger({
  className,
  children,
  icon,
  badge,
  hideChevron = false,
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        <span className="flex flex-1 items-start gap-2.5">
          {icon && <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>}
          <span className="flex-1">{children}</span>
          {badge && (
            <span className="shrink-0 rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-normal text-muted-foreground">
              {badge}
            </span>
          )}
        </span>
        {!hideChevron && (
          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 motion-reduce:transition-none" />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
