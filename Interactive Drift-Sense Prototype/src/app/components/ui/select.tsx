"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
} from "lucide-react";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*                         Form-field context (SelectField)                   */
/* -------------------------------------------------------------------------- */

interface SelectFieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

const SelectFieldContext = React.createContext<SelectFieldContextValue | null>(null);

/* -------------------------------------------------------------------------- */
/*                                    Root                                    */
/* -------------------------------------------------------------------------- */

function Select({
  required,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const field = React.useContext(SelectFieldContext);

  return (
    <SelectPrimitive.Root
      data-slot="select"
      required={required ?? field?.required}
      {...props}
    />
  );
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

/* -------------------------------------------------------------------------- */
/*                                   Trigger                                  */
/* -------------------------------------------------------------------------- */

interface SelectTriggerProps
  extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
  size?: "sm" | "default" | "lg";
  /** Shows a spinner instead of the chevron and blocks interaction. */
  loading?: boolean;
  /** Icon shown before the selected value. */
  leadingIcon?: React.ReactNode;
}

function SelectTrigger({
  className,
  size = "default",
  loading = false,
  leadingIcon,
  children,
  id,
  disabled,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: SelectTriggerProps) {
  const field = React.useContext(SelectFieldContext);

  const describedBy =
    [ariaDescribedBy, field?.describedBy].filter(Boolean).join(" ") || undefined;

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      id={id ?? field?.id}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-describedby={describedBy}
      aria-invalid={ariaInvalid ?? (field?.invalid || undefined)}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 bg-input-background flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] motion-reduce:transition-none",
        loading
          ? "cursor-progress"
          : "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[size=default]:h-9 data-[size=lg]:h-11 data-[size=lg]:text-base data-[size=sm]:h-8",
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {leadingIcon}
      {children}
      <SelectPrimitive.Icon asChild>
        {loading ? (
          <Loader2Icon
            aria-hidden
            className="size-4 animate-spin opacity-50 motion-reduce:animate-none"
          />
        ) : (
          <ChevronDownIcon aria-hidden className="size-4 opacity-50" />
        )}
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Content                                  */
/* -------------------------------------------------------------------------- */

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md motion-reduce:animate-none",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Item                                    */
/* -------------------------------------------------------------------------- */

interface SelectItemProps
  extends React.ComponentProps<typeof SelectPrimitive.Item> {
  /** Secondary text under the label. Not shown in the trigger. */
  description?: React.ReactNode;
  /** Icon before the label. Also shown in the trigger when selected. */
  icon?: React.ReactNode;
}

function SelectItem({
  className,
  children,
  description,
  icon,
  ...props
}: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="absolute top-1/2 right-2 flex size-3.5 -translate-y-1/2 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon aria-hidden className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        {/* Only the ItemText content is mirrored into the trigger. */}
        <SelectPrimitive.ItemText>
          <span className="flex items-center gap-2">
            {icon}
            {children}
          </span>
        </SelectPrimitive.ItemText>
        {description && (
          <span className="text-muted-foreground text-xs">{description}</span>
        )}
      </span>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon aria-hidden className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon aria-hidden className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

/* -------------------------------------------------------------------------- */
/*                   Data-driven options (SelectOptions)                      */
/* -------------------------------------------------------------------------- */

interface SelectOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Options sharing a group name are rendered under one label. */
  group?: string;
}

interface SelectOptionsProps {
  options: SelectOption[];
  /** Shown when `options` is empty. */
  emptyMessage?: React.ReactNode;
}

function renderOption(option: SelectOption) {
  return (
    <SelectItem
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      icon={option.icon}
      description={option.description}
    >
      {option.label}
    </SelectItem>
  );
}

/**
 * Renders items (and grouped sections with labels and separators) from an
 * array, so you don't have to hand-write every <SelectItem>.
 */
function SelectOptions({
  options,
  emptyMessage = "No options available",
}: SelectOptionsProps) {
  if (options.length === 0) {
    return (
      <div className="text-muted-foreground px-2 py-6 text-center text-sm">
        {emptyMessage}
      </div>
    );
  }

  const ungrouped: SelectOption[] = [];
  const groups = new Map<string, SelectOption[]>();

  for (const option of options) {
    if (!option.group) {
      ungrouped.push(option);
      continue;
    }
    const list = groups.get(option.group);
    if (list) list.push(option);
    else groups.set(option.group, [option]);
  }

  return (
    <>
      {ungrouped.map(renderOption)}
      {Array.from(groups, ([name, items], index) => (
        <React.Fragment key={name}>
          {(ungrouped.length > 0 || index > 0) && <SelectSeparator />}
          <SelectGroup>
            <SelectLabel>{name}</SelectLabel>
            {items.map(renderOption)}
          </SelectGroup>
        </React.Fragment>
      ))}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                         Labeled field (SelectField)                        */
/* -------------------------------------------------------------------------- */

interface SelectFieldProps {
  label?: React.ReactNode;
  /** Helper text. Hidden while an error is shown. */
  description?: React.ReactNode;
  /** Error message. Marks the trigger as invalid. */
  error?: React.ReactNode;
  required?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wraps a <Select> with a label, helper text and error message, and wires up
 * id, aria-describedby, aria-invalid and `required` automatically.
 */
function SelectField({
  label,
  description,
  error,
  required = false,
  id: idProp,
  className,
  children,
}: SelectFieldProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const value = React.useMemo<SelectFieldContextValue>(
    () => ({
      id,
      describedBy: error ? errorId : description ? descriptionId : undefined,
      invalid: Boolean(error),
      required,
    }),
    [id, error, errorId, description, descriptionId, required],
  );

  return (
    <div data-slot="select-field" className={cn("grid gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm leading-none font-medium">
          {label}
          {required && (
            <span aria-hidden className="text-destructive ml-0.5">
              *
            </span>
          )}
        </label>
      )}
      <SelectFieldContext.Provider value={value}>
        {children}
      </SelectFieldContext.Provider>
      {error ? (
        <p id={errorId} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : description ? (
        <p id={descriptionId} className="text-muted-foreground text-sm">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export {
  Select,
  SelectContent,
  SelectField,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectOptions,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
export type {
  SelectFieldProps,
  SelectItemProps,
  SelectOption,
  SelectOptionsProps,
  SelectTriggerProps,
};
