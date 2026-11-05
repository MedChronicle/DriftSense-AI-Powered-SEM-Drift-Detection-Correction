import * as React from "react";

export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;
const MOBILE_BREAKPOINT = BREAKPOINTS.md;

/** Subscribe to any CSS media query. SSR-safe, no flash-of-wrong-value, no tearing. */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = React.useCallback(
    (notify: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    [query],
  );
  const getSnapshot = () => window.matchMedia(query).matches;
  return React.useSyncExternalStore(subscribe, getSnapshot, () => serverFallback);
}

/** Same name and boolean return as before, so existing callers keep working. */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}

/** Honors the OS "reduce motion" setting, useful for the heavy animations in DRIFT-SENSE. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Current breakpoint name: "base" | "sm" | "md" | "lg" | "xl". */
export function useBreakpoint(): "base" | keyof typeof BREAKPOINTS {
  const sm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
  const md = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const lg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const xl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
  return xl ? "xl" : lg ? "lg" : md ? "md" : sm ? "sm" : "base";
}
