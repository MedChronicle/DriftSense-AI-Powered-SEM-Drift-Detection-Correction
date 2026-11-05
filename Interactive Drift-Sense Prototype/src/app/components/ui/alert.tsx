import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  XIcon,
} from "lucide-react";

import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 *:data-[slot=alert-description]:text-emerald-600/90 dark:*:data-[slot=alert-description]:text-emerald-400/90",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 *:data-[slot=alert-description]:text-amber-600/90 dark:*:data-[slot=alert-description]:text-amber-400/90",
        info:
          "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 *:data-[slot=alert-description]:text-sky-600/90 dark:*:data-[slot=alert-description]:text-sky-400/90",
        // matches the cyan glass panels used across DRIFT-SENSE
        glass:
          "border-cyan-400/25 bg-[rgba(0,200,255,0.06)] text-cyan-100 backdrop-blur-md *:data-[slot=alert-description]:text-cyan-100/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

const DEFAULT_ICONS: Partial<Record<AlertVariant, React.ElementType>> = {
  destructive: AlertCircleIcon,
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
};

// Urgent states interrupt screen readers (role="alert"); informational ones are polite (role="status").
const URGENT: AlertVariant[] = ["destructive", "warning"];

interface AlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {
  /**
   * Leading icon. Omit for the variant's default icon (none for "default"/"glass"),
   * pass `false` to hide it, or pass your own <svg>/lucide icon.
   */
  icon?: React.ReactNode | false;
  /** Shows a close button; the alert hides itself and calls onDismiss. */
  dismissible?: boolean;
  onDismiss?: () => void;
}

function Alert({
  className,
  variant,
  icon,
  dismissible = false,
  onDismiss,
  children,
  role,
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;

  const v: AlertVariant = variant ?? "default";
  const Default = DEFAULT_ICONS[v];
  const iconNode =
    icon === false ? null : icon ?? (Default ? <Default aria-hidden /> : null);

  return (
    <div
      data-slot="alert"
      data-variant={v}
      role={role ?? (URGENT.includes(v) ? "alert" : "status")}
      className={cn(alertVariants({ variant }), dismissible && "pr-10", className)}
      {...props}
    >
      {iconNode}
      {children}
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="absolute top-2.5 right-2.5 rounded-sm p-0.5 opacity-60 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
