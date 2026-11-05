"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "./utils";

type CheckboxSize = "sm" | "md" | "lg";

const ROOT_SIZE: Record<CheckboxSize, string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

const ICON_SIZE: Record<CheckboxSize, string> = {
  sm: "size-2.5",
  md: "size-3.5",
  lg: "size-4",
};

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  size?: CheckboxSize;
};

function Checkbox({ className, size = "md", ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground dark:data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        ROOT_SIZE[size],
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon
          className={cn(
            "hidden group-data-[state=checked]:block",
            ICON_SIZE[size],
          )}
        />
        <MinusIcon
          className={cn(
            "hidden group-data-[state=indeterminate]:block",
            ICON_SIZE[size],
          )}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

type CheckboxFieldProps = CheckboxProps & {
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  /** Class for the outer wrapper */
  wrapperClassName?: string;
};

/** Checkbox with label, description and error wired up for accessibility */
function CheckboxField({
  label,
  description,
  error,
  id,
  wrapperClassName,
  disabled,
  ...props
}: CheckboxFieldProps) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      data-slot="checkbox-field"
      className={cn("flex items-start gap-3", wrapperClassName)}
    >
      <Checkbox
        id={fieldId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="mt-0.5"
        {...props}
      />
      <div className="grid gap-1 leading-none">
        <label
          htmlFor={fieldId}
          className={cn(
            "cursor-pointer text-sm font-medium select-none",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="text-muted-foreground text-sm">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Drives a "select all" checkbox from a list of child values.
 * Spread `parentProps` on the parent Checkbox and use `isSelected` / `toggle` on children.
 */
function useIndeterminateGroup(allValues: string[], initial: string[] = []) {
  const [selected, setSelected] = React.useState<string[]>(initial);

  const allSelected = allValues.length > 0 && allValues.every((v) => selected.includes(v));
  const someSelected = selected.length > 0 && !allSelected;

  const toggle = React.useCallback((value: string, checked: boolean) => {
    setSelected((prev) =>
      checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((v) => v !== value),
    );
  }, []);

  const isSelected = React.useCallback((v: string) => selected.includes(v), [selected]);

  const toggleAll = React.useCallback(
    (checked: boolean) => setSelected(checked ? [...allValues] : []),
    [allValues],
  );

  const parentProps = {
    checked: (allSelected ? true : someSelected ? "indeterminate" : false) as
      | boolean
      | "indeterminate",
    onCheckedChange: (c: boolean | "indeterminate") => toggleAll(c === true),
  };

  return { selected, isSelected, toggle, toggleAll, parentProps };
}

export { Checkbox, CheckboxField, useIndeterminateGroup };
export type { CheckboxProps, CheckboxFieldProps, CheckboxSize };
