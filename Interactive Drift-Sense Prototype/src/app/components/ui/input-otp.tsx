"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "./utils";

type InputOTPSize = "sm" | "md" | "lg";

const SLOT_SIZE: Record<InputOTPSize, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-lg",
};

type InputOTPStyleContextValue = {
  size: InputOTPSize;
  mask: boolean;
  invalid: boolean;
};

const InputOTPStyleContext = React.createContext<InputOTPStyleContextValue>({
  size: "md",
  mask: false,
  invalid: false,
});

type InputOTPProps = React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
  /** Slot size (default "md") */
  size?: InputOTPSize;
  /** Show a dot instead of the typed character */
  mask?: boolean;
  /** Marks the field invalid (aria-invalid plus destructive styling) */
  invalid?: boolean;
};

function InputOTP({
  className,
  containerClassName,
  size = "md",
  mask = false,
  invalid = false,
  autoComplete = "one-time-code",
  ...props
}: InputOTPProps) {
  const styleValue = React.useMemo(
    () => ({ size, mask, invalid }),
    [size, mask, invalid],
  );

  return (
    <InputOTPStyleContext.Provider value={styleValue}>
      <OTPInput
        data-slot="input-otp"
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        containerClassName={cn(
          "flex items-center gap-2 has-disabled:opacity-50",
          containerClassName,
        )}
        className={cn("disabled:cursor-not-allowed", className)}
        {...props}
      />
    </InputOTPStyleContext.Provider>
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { size, mask, invalid } = React.useContext(InputOTPStyleContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      aria-invalid={invalid || undefined}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex items-center justify-center border-y border-r bg-input-background transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        SLOT_SIZE[size],
        className,
      )}
      {...props}
    >
      {char ? (mask ? "•" : char) : null}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000 motion-reduce:animate-none" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon aria-hidden="true" />
    </div>
  );
}

type InputOTPSlotsProps = {
  /** Total number of slots. Should match `maxLength` on <InputOTP />. */
  count: number;
  /** Slots per group (default: all in one group) */
  groupSize?: number;
  /** Render a separator between groups (default true) */
  separator?: boolean;
};

/** Renders `count` slots, split into groups with separators between them */
function InputOTPSlots({
  count,
  groupSize,
  separator = true,
}: InputOTPSlotsProps) {
  const size = Math.max(1, groupSize ?? count);
  const groups = Math.ceil(count / size);

  return (
    <>
      {Array.from({ length: groups }, (_, g) => {
        const start = g * size;
        const end = Math.min(start + size, count);
        return (
          <React.Fragment key={g}>
            {separator && g > 0 && <InputOTPSeparator />}
            <InputOTPGroup>
              {Array.from({ length: end - start }, (_, i) => (
                <InputOTPSlot key={start + i} index={start + i} />
              ))}
            </InputOTPGroup>
          </React.Fragment>
        );
      })}
    </>
  );
}

/**
 * Countdown for "Resend code" buttons.
 * Call `start()` after sending a code; `canResend` is true when it reaches 0.
 */
function useOTPResend(seconds: number = 30) {
  const [remaining, setRemaining] = React.useState(0);

  React.useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);

  const start = React.useCallback(() => setRemaining(seconds), [seconds]);
  const reset = React.useCallback(() => setRemaining(0), []);

  return { remaining, canResend: remaining === 0, start, reset };
}

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSlots,
  InputOTPSeparator,
  useOTPResend,
};
export type { InputOTPProps, InputOTPSize, InputOTPSlotsProps };
