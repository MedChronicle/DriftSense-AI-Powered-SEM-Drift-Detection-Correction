import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names; later Tailwind classes win. (Signature unchanged for shadcn/ui.) */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** "+3.2" / "-1.0" — explicit sign for drift values. */
export const formatSigned = (v: number, digits = 1): string =>
  `${v > 0 ? "+" : ""}${v.toFixed(digits)}`;

/** Confidence → color tone, replacing separate confColor/confRgb helpers. */
export function confidenceTone(c: number) {
  if (c >= 85) return { hex: "#10b981", rgb: "16,185,129", label: "HIGH" as const };
  if (c >= 60) return { hex: "#f59e0b", rgb: "245,158,11", label: "MEDIUM" as const };
  return { hex: "#ef4444", rgb: "239,68,68", label: "LOW" as const };
}

/** Trailing-edge debounce with a cancel handle. */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: A) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => t && clearTimeout(t);
  return debounced;
}

/** Quote-safe CSV from an array of flat records. */
export function toCSV<T extends Record<string, string | number | boolean>>(rows: T[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
}

/** Trigger a browser download for any text content. */
export function downloadText(filename: string, text: string, mime = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
