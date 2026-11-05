"use client";

import * as React from "react";

import { cn } from "./utils";

type TextareaSize = "sm" | "md" | "lg";
type TextareaResize = "none" | "vertical" | "horizontal" | "both";

const TEXTAREA_SIZE: Record<TextareaSize, string> = {
  sm: "min-h-12 px-2.5 py-1.5 text-sm",
  md: "min-h-16 px-3 py-2 text-base md:text-sm",
  lg: "min-h-24 px-4 py-3 text-base",
};

const TEXTAREA_RESIZE: Record<TextareaResize, string> = {
  none: "resize-none",
  vertical: "resize-y",
  horizontal: "resize-x",
  both: "resize",
};

type TextareaProps = React.ComponentProps<"textarea"> & {
  /** Control size (default "md") */
  textareaSize?: TextareaSize;
  /** Sets aria-invalid and the destructive styling */
  invalid?: boolean;
  /** User resize handle (default "none", same as the original) */
  resize?: TextareaResize;
  /** Caps auto-growth at this many rows, then scrolls */
  maxRows?: number;
};

function Textarea({
  className,
  textareaSize = "md",
  invalid,
  resize = "none",
  maxRows,
  style,
  ...props
}: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      aria-invalid={invalid || props["aria-invalid"]}
      style={
        maxRows
          ? { maxHeight: `calc(${maxRows} * 1lh + 1rem)`, ...style }
          : style
      }
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 field-sizing-content block w-full rounded-md border bg-input-background transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        TEXTAREA_SIZE[textareaSize],
        TEXTAREA_RESIZE[resize],
        maxRows && "overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

type TextareaFieldProps = TextareaProps & {
  /** Show "n / maxLength". Needs maxLength. (default true) */
  showCount?: boolean;
  wrapperClassName?: string;
};

/** Textarea with a character counter. Works controlled or uncontrolled. */
const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField(
    {
      showCount = true,
      wrapperClassName,
      maxLength,
      value,
      defaultValue,
      onChange,
      invalid,
      ...props
    },
    ref,
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(
      String(defaultValue ?? ""),
    );
    const length = String(isControlled ? value : internal).length;
    const over = maxLength !== undefined && length > maxLength;

    return (
      <div data-slot="textarea-field" className={cn("grid gap-1.5", wrapperClassName)}>
        <Textarea
          ref={ref as never}
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          invalid={invalid || over}
          onChange={(event) => {
            if (!isControlled) setInternal(event.target.value);
            onChange?.(event);
          }}
          {...props}
        />
        {showCount && maxLength !== undefined && (
          <span
            aria-live="polite"
            className={cn(
              "text-muted-foreground justify-self-end text-xs tabular-nums",
              over && "text-destructive",
            )}
          >
            {length} / {maxLength}
          </span>
        )}
      </div>
    );
  },
);

/**
 * Fallback for browsers without `field-sizing: content`.
 * Attach `ref` to the textarea; it grows with its content. No-op where supported.
 */
function useAutoResize(value?: string) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const resize = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof CSS !== "undefined" && CSS.supports("field-sizing", "content")) {
      return;
    }
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  React.useLayoutEffect(resize, [resize, value]);

  return { ref, resize, onInput: resize };
}

export { Textarea, TextareaField, useAutoResize };
export type {
  TextareaProps,
  TextareaFieldProps,
  TextareaSize,
  TextareaResize,
};
