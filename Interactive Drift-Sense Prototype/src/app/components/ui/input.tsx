"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon, Loader2Icon, XIcon } from "lucide-react";

import { cn } from "./utils";

type InputSize = "sm" | "md" | "lg";

const INPUT_SIZE: Record<InputSize, string> = {
  sm: "h-8 px-2.5 py-1 text-sm",
  md: "h-9 px-3 py-1 text-base md:text-sm",
  lg: "h-11 px-4 py-2 text-base",
};

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  /** Control size (default "md"). Named inputSize because `size` is a native attribute. */
  inputSize?: InputSize;
  /** Sets aria-invalid and the destructive styling */
  invalid?: boolean;
};

function Input({
  className,
  type,
  inputSize = "md",
  invalid,
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      aria-invalid={invalid || props["aria-invalid"]}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
        INPUT_SIZE[inputSize],
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

type InputGroupProps = InputProps & {
  /** Leading icon or text (not clickable) */
  start?: React.ReactNode;
  /** Trailing content. May include buttons. */
  end?: React.ReactNode;
  /** Shows a spinner before the end slot */
  loading?: boolean;
  /** Class for the outer wrapper */
  wrapperClassName?: string;
};

/** Input with start/end adornments and a loading spinner */
function InputGroup({
  start,
  end,
  loading = false,
  wrapperClassName,
  className,
  ...props
}: InputGroupProps) {
  const hasEnd = !!end || loading;

  return (
    <div
      data-slot="input-group"
      className={cn("relative flex w-full items-center", wrapperClassName)}
    >
      {start && (
        <span
          data-slot="input-group-start"
          className="text-muted-foreground pointer-events-none absolute left-3 flex items-center [&_svg]:size-4"
        >
          {start}
        </span>
      )}
      <Input
        aria-busy={loading || undefined}
        className={cn(start && "pl-9", hasEnd && "pr-9", className)}
        {...props}
      />
      {hasEnd && (
        <span
          data-slot="input-group-end"
          className="text-muted-foreground absolute right-2 flex items-center gap-1 [&_svg]:size-4"
        >
          {loading && (
            <Loader2Icon
              aria-hidden="true"
              className="animate-spin motion-reduce:animate-none"
            />
          )}
          {end}
        </span>
      )}
    </div>
  );
}

const ICON_BUTTON =
  "hover:text-foreground focus-visible:ring-ring/50 rounded-sm p-1 outline-none focus-visible:ring-[3px] disabled:pointer-events-none";

/** Password field with a show/hide toggle */
function PasswordInput({
  disabled,
  ...props
}: Omit<InputGroupProps, "type" | "end">) {
  const [visible, setVisible] = React.useState(false);

  return (
    <InputGroup
      type={visible ? "text" : "password"}
      disabled={disabled}
      end={
        <button
          type="button"
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className={ICON_BUTTON}
        >
          {visible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
        </button>
      }
      {...props}
    />
  );
}

type ClearableInputProps = Omit<InputGroupProps, "value" | "end"> & {
  value: string;
  onClear: () => void;
};

/** Controlled input with a clear button. Escape also clears. */
function ClearableInput({
  value,
  onClear,
  onKeyDown,
  disabled,
  readOnly,
  className,
  ...props
}: ClearableInputProps) {
  const showClear = value.length > 0 && !disabled && !readOnly;

  return (
    <InputGroup
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === "Escape" && showClear) {
          event.preventDefault();
          onClear();
        }
      }}
      className={cn(
        "[&::-webkit-search-cancel-button]:appearance-none",
        className,
      )}
      end={
        showClear ? (
          <button
            type="button"
            aria-label="Clear"
            onClick={onClear}
            className={ICON_BUTTON}
          >
            <XIcon aria-hidden="true" />
          </button>
        ) : null
      }
      {...props}
    />
  );
}

export { Input, InputGroup, PasswordInput, ClearableInput };
export type { InputProps, InputGroupProps, ClearableInputProps, InputSize };
