"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "./utils";
import { toggleVariants } from "./toggle";

type ToggleGroupOrientation = "horizontal" | "vertical";

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> & {
  orientation: ToggleGroupOrientation;
  attached: boolean;
};

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
  orientation: "horizontal",
  attached: true,
});

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    /** Layout direction (default "horizontal") */
    orientation?: ToggleGroupOrientation;
    /** Join the items into one control (default true). False gives separated buttons. */
    attached?: boolean;
    /** Stretch to the width of the container */
    fullWidth?: boolean;
  };

function ToggleGroup({
  className,
  variant,
  size,
  orientation = "horizontal",
  attached = true,
  fullWidth = false,
  children,
  ...props
}: ToggleGroupProps) {
  const contextValue = React.useMemo(
    () => ({ variant, size, orientation, attached }),
    [variant, size, orientation, attached],
  );

  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      orientation={orientation}
      className={cn(
        "group/toggle-group flex items-center rounded-md",
        orientation === "vertical" ? "flex-col items-stretch" : "flex-row",
        fullWidth ? "w-full" : "w-fit",
        attached ? "data-[variant=outline]:shadow-xs" : "gap-1",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={contextValue}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

// Full class strings so Tailwind can see them
const ITEM_SHAPE = {
  separate: "rounded-md",
  horizontal:
    "rounded-none first:rounded-l-md last:rounded-r-md data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
  vertical:
    "rounded-none first:rounded-t-md last:rounded-b-md data-[variant=outline]:border-t-0 data-[variant=outline]:first:border-t",
} as const;

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);
  // The item's own props win; the group's values are the fallback
  const resolvedVariant = variant ?? context.variant;
  const resolvedSize = size ?? context.size;

  const shape = !context.attached
    ? ITEM_SHAPE.separate
    : context.orientation === "vertical"
      ? ITEM_SHAPE.vertical
      : ITEM_SHAPE.horizontal;

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        "min-w-0 shrink-0 shadow-none focus:z-10 focus-visible:z-10",
        context.orientation === "horizontal" && "flex-1",
        shape,
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

type ToggleGroupOption = {
  value: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Required for icon-only options (no label) */
  ariaLabel?: string;
};

/** Renders items from an array of options. Put it inside <ToggleGroup />. */
function ToggleGroupOptions({
  options,
  itemClassName,
}: {
  options: ToggleGroupOption[];
  itemClassName?: string;
}) {
  return (
    <>
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          aria-label={option.ariaLabel}
          className={itemClassName}
        >
          {option.icon && <span aria-hidden="true">{option.icon}</span>}
          {option.label}
        </ToggleGroupItem>
      ))}
    </>
  );
}

/**
 * State for a single-select group. With `required`, clicking the active item
 * doesn't deselect it. Spread `groupProps` on <ToggleGroup />.
 */
function useToggleGroupSingle(
  initialValue: string = "",
  { required = false }: { required?: boolean } = {},
) {
  const [value, setValue] = React.useState(initialValue);

  const onValueChange = React.useCallback(
    (next: string) => {
      if (required && next === "") return;
      setValue(next);
    },
    [required],
  );

  return {
    value,
    setValue,
    groupProps: { type: "single" as const, value, onValueChange },
  };
}

export {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupOptions,
  useToggleGroupSingle,
};
export type { ToggleGroupProps, ToggleGroupOption, ToggleGroupOrientation };
