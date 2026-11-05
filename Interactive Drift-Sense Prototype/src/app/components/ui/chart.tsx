"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "./utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

/** Returns the CSS variable for a config key, e.g. getChartColor("desktop") */
function getChartColor(key: string) {
  return `var(--color-${sanitizeKey(key)})`;
}

/** Hide/show series from the legend. Pass `hide={isHidden(key)}` to a series. */
function useChartSeriesToggle(initialHidden: string[] = []) {
  const [hidden, setHidden] = React.useState<string[]>(initialHidden);

  const toggle = React.useCallback((key: string) => {
    setHidden((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const isHidden = React.useCallback(
    (key: string) => hidden.includes(key),
    [hidden],
  );

  const reset = React.useCallback(() => setHidden([]), []);

  return { hidden, toggle, isHidden, reset };
}

function ChartContainer({
  id,
  className,
  children,
  config,
  title,
  description,
  loading = false,
  empty = false,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
  /** Accessible chart title */
  title?: string;
  /** Accessible chart description */
  description?: string;
  /** Show a skeleton instead of the chart */
  loading?: boolean;
  /** true shows a default message; pass a node to customize */
  empty?: boolean | React.ReactNode;
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  const baseClassName = cn(
    "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
    className,
  );

  if (loading) {
    return (
      <div
        data-slot="chart"
        data-state="loading"
        aria-busy="true"
        aria-label={title ? `${title} (loading)` : "Loading chart"}
        className={cn("flex aspect-video", className)}
        {...props}
      >
        <div className="bg-muted size-full animate-pulse rounded-lg" />
      </div>
    );
  }

  if (empty) {
    return (
      <div
        data-slot="chart"
        data-state="empty"
        className={cn(
          "text-muted-foreground flex aspect-video items-center justify-center text-sm",
          className,
        )}
        {...props}
      >
        {empty === true ? "No data to display" : empty}
      </div>
    );
  }

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        role="img"
        aria-label={[title, description].filter(Boolean).join(". ") || undefined}
        className={baseClassName}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// Keys and colors end up inside a <style> tag, so keep them to safe characters.
function sanitizeKey(key: string) {
  return key.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function sanitizeColor(color: string | undefined) {
  if (!color) return null;
  return /^[#a-zA-Z0-9(),.%\s/_-]+$/.test(color) ? color : null;
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${safeId}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = sanitizeColor(
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
        itemConfig.color,
    );
    return color ? `  --color-${sanitizeKey(key)}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
  valueFormatter,
  unit,
  showTotal = false,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
    /** Custom value rendering, e.g. (v) => `$${v}` */
    valueFormatter?: (value: number | string, name: string) => React.ReactNode;
    /** Appended after numeric values, e.g. "%" or "ms" */
    unit?: string;
    /** Show a summed total row when there are multiple numeric series */
    showTotal?: boolean;
  }) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  const renderValue = (value: unknown, name: string) => {
    if (valueFormatter && (typeof value === "number" || typeof value === "string")) {
      return valueFormatter(value, name);
    }
    if (typeof value === "number") {
      return `${value.toLocaleString()}${unit ? ` ${unit}` : ""}`;
    }
    return `${value}${unit ? ` ${unit}` : ""}`;
  };

  const numericValues = payload
    .map((p) => p.value)
    .filter((v): v is number => typeof v === "number");
  const total =
    showTotal && numericValues.length > 1
      ? numericValues.reduce((a, b) => a + b, 0)
      : null;

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload?.fill || item.color;
          const hasValue = item.value !== undefined && item.value !== null;

          return (
            <div
              key={`${item.dataKey ?? item.name ?? "item"}-${index}`}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center",
              )}
            >
              {formatter && hasValue && item.name ? (
                formatter(item.value as never, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          },
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center",
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {hasValue && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {renderValue(item.value, String(item.name ?? key))}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
        {total !== null && (
          <div className="border-border/50 mt-0.5 flex items-center justify-between border-t pt-1.5 leading-none">
            <span className="text-muted-foreground">Total</span>
            <span className="text-foreground font-mono font-medium tabular-nums">
              {renderValue(total, "total")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
  hiddenKeys,
  onToggle,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean;
    nameKey?: string;
    /** Keys currently hidden (from useChartSeriesToggle) */
    hiddenKeys?: string[];
    /** When provided, legend items become toggle buttons */
    onToggle?: (key: string) => void;
  }) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        const dataKey = String(item.dataKey ?? key);
        const isHidden = hiddenKeys?.includes(dataKey) ?? false;

        const content = (
          <>
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label ?? item.value}
          </>
        );

        const itemClass = cn(
          "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3",
          isHidden && "opacity-40 line-through",
        );

        return onToggle ? (
          <button
            key={String(item.value)}
            type="button"
            aria-pressed={!isHidden}
            onClick={() => onToggle(dataKey)}
            className={cn(
              itemClass,
              "hover:text-foreground cursor-pointer rounded-sm transition-opacity focus-visible:ring-2 focus-visible:outline-none",
            )}
          >
            {content}
          </button>
        ) : (
          <div key={String(item.value)} className={itemClass}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  useChartSeriesToggle,
  getChartColor,
};
