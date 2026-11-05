"use client";

import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

import { cn } from "./utils";

const PRESETS = {
  square: 1,
  video: 16 / 9,
  wide: 21 / 9,
  standard: 4 / 3,
  portrait: 3 / 4,
} as const;

type RatioInput = number | `${number}/${number}` | `${number}:${number}` | keyof typeof PRESETS;

/** Accepts 1.5, "16/9", "4:3" or a preset name ("video", "square", ...). Falls back to 1. */
export function parseRatio(input: RatioInput): number {
  if (typeof input === "number") return input > 0 && Number.isFinite(input) ? input : 1;
  if (input in PRESETS) return PRESETS[input as keyof typeof PRESETS];
  const [w, h] = input.split(/[/:]/).map(Number);
  return w > 0 && h > 0 ? w / h : 1;
}

type AspectRatioProps = Omit<React.ComponentProps<typeof AspectRatioPrimitive.Root>, "ratio"> & {
  ratio?: RatioInput;
  /** Rounds corners and clips children to them. */
  rounded?: boolean;
};

/** Same component as before; `ratio` now also accepts strings and presets. */
function AspectRatio({ ratio = 1, rounded = false, className, ...props }: AspectRatioProps) {
  return (
    <AspectRatioPrimitive.Root
      data-slot="aspect-ratio"
      ratio={parseRatio(ratio)}
      className={cn(rounded && "overflow-hidden rounded-lg", className)}
      {...props}
    />
  );
}

type AspectRatioImageProps = Omit<React.ComponentProps<"img">, "ref"> & {
  ratio?: RatioInput;
  rounded?: boolean;
  fit?: "cover" | "contain";
  /** Rendered if the image fails to load. */
  fallback?: React.ReactNode;
  wrapperClassName?: string;
};

/** Image in a fixed ratio box with a loading shimmer, fade-in and error fallback. */
function AspectRatioImage({
  ratio = "standard",
  rounded = true,
  fit = "cover",
  fallback,
  wrapperClassName,
  className,
  onLoad,
  onError,
  alt = "",
  ...props
}: AspectRatioImageProps) {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");

  // reset when the source changes (e.g. a new upload)
  React.useEffect(() => setStatus("loading"), [props.src]);

  return (
    <AspectRatio ratio={ratio} rounded={rounded} className={cn("bg-muted/40", wrapperClassName)}>
      {status === "loading" && (
        <div aria-hidden className="absolute inset-0 animate-pulse bg-muted/60 motion-reduce:animate-none" />
      )}
      {status === "error" ? (
        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
          {fallback ?? "Image unavailable"}
        </div>
      ) : (
        <img
          alt={alt}
          decoding="async"
          draggable={false}
          className={cn(
            "size-full transition-opacity duration-300 motion-reduce:transition-none",
            fit === "cover" ? "object-cover" : "object-contain",
            status === "loaded" ? "opacity-100" : "opacity-0",
            className,
          )}
          onLoad={(e) => { setStatus("loaded"); onLoad?.(e); }}
          onError={(e) => { setStatus("error"); onError?.(e); }}
          {...props}
        />
      )}
    </AspectRatio>
  );
}

export { AspectRatio, AspectRatioImage };
