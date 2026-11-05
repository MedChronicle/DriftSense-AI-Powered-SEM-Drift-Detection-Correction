"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";

import { cn } from "./utils";

type RadioGroupSize = "sm" | "md" | "lg";

const ITEM_SIZE: Record<RadioGroupSize, string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

const DOT_SIZE: Record<RadioGroupSize, string> = {
  sm: "size-1.5",
  md: "size-2",
  lg: "size-2.5",
};

type RadioGroupStyleContextValue = {
  size: RadioGroupSize;
  invalid: boolean;
};

const RadioGroupStyleContext = React.createContext<RadioGroupStyleContextValue>({
  size: "md",
  invalid: false,
});

type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
  /** Item size (default "md", same as the original size-4) */
  size?: RadioGroupSize;
  /** Marks the group invalid (aria-invalid plus destructive styling) */
  invalid?: boolean;
};

function RadioGroup({
  className,
  size = "md",
  invalid = false,
  orientation,
  ...props
}: RadioGroupProps) {
  const styleValue = React.useMemo(() => ({ size, invalid }), [size, invalid]);

  return (
    <RadioGroupStyleContext.Provider value={styleValue}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        orientation={orientation}
        aria-invalid={invalid || undefined}
        className={cn(
          orientation === "horizontal" ? "flex flex-wrap gap-4" : "grid gap-3",
          className,
        )}
        {...props}
      />
    </RadioGroupStyleContext.Provider>
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  const { size, invalid } = React.useContext(RadioGroupStyleContext);

  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      aria-invalid={invalid || props["aria-invalid"]}
      className={cn(
        "border-input text-primary bg-input-background data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex aspect-square shrink-0 items-center justify-center rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50",
        ITEM_SIZE[size],
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <CircleIcon aria-hidden="true" className={cn("fill-primary", DOT_SIZE[size])} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

type RadioGroupFieldProps = React.ComponentProps<
  typeof RadioGroupPrimitive.Item
> & {
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Class for the outer wrapper */
  wrapperClassName?: string;
};

/** Radio item with a clickable label and description */
function RadioGroupField({
  label,
  description,
  id,
  disabled,
  wrapperClassName,
  ...props
}: RadioGroupFieldProps) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const descriptionId = description ? `${fieldId}-description` : undefined;

  return (
    <div
      data-slot="radio-group-field"
      className={cn("flex items-start gap-3", wrapperClassName)}
    >
      <RadioGroupItem
        id={fieldId}
        disabled={disabled}
        aria-describedby={descriptionId}
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
          <p
            id={descriptionId}
            className={cn("text-muted-foreground text-sm", disabled && "opacity-50")}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/** Card-style option: the whole card is the click target */
function RadioGroupCard({
  label,
  description,
  id,
  disabled,
  wrapperClassName,
  ...props
}: RadioGroupFieldProps) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const descriptionId = description ? `${fieldId}-description` : undefined;

  return (
    <label
      htmlFor={fieldId}
      data-slot="radio-group-card"
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors motion-reduce:transition-none",
        "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/50",
        "has-[:focus-visible]:ring-ring/50 has-[:focus-visible]:ring-[3px]",
        "has-[button:disabled]:cursor-not-allowed has-[button:disabled]:opacity-50",
        wrapperClassName,
      )}
    >
      <RadioGroupItem
        id={fieldId}
        disabled={disabled}
        aria-describedby={descriptionId}
        className="mt-0.5"
        {...props}
      />
      <span className="grid gap-1 leading-none select-none">
        <span className="text-sm font-medium">{label}</span>
        {description && (
          <span id={descriptionId} className="text-muted-foreground text-sm">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

type RadioGroupOption = {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
};

/** Renders options from an array. Put it inside <RadioGroup />. */
function RadioGroupOptions({
  options,
  variant = "default",
}: {
  options: RadioGroupOption[];
  /** "card" renders each option as a selectable card */
  variant?: "default" | "card";
}) {
  const Option = variant === "card" ? RadioGroupCard : RadioGroupField;

  return (
    <>
      {options.map((option) => (
        <Option
          key={option.value}
          value={option.value}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
        />
      ))}
    </>
  );
}

/** Value state helper. Spread `groupProps` on <RadioGroup />. */
function useRadioGroup(initialValue: string = "") {
  const [value, setValue] = React.useState(initialValue);
  const reset = React.useCallback(() => setValue(initialValue), [initialValue]);

  return {
    value,
    setValue,
    reset,
    groupProps: { value, onValueChange: setValue },
  };
}

export {
  RadioGroup,
  RadioGroupItem,
  RadioGroupField,
  RadioGroupCard,
  RadioGroupOptions,
  useRadioGroup,
};
export type {
  RadioGroupProps,
  RadioGroupSize,
  RadioGroupFieldProps,
  RadioGroupOption,
};
