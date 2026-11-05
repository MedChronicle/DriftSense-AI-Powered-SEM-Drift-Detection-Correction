"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*                                   Context                                  */
/* -------------------------------------------------------------------------- */

type TableDensity = "compact" | "default" | "comfortable";
type SortDirection = "asc" | "desc" | false;

interface TableContextValue {
  density: TableDensity;
  striped: boolean;
  stickyHeader: boolean;
}

const TableContext = React.createContext<TableContextValue>({
  density: "default",
  striped: false,
  stickyHeader: false,
});

const useTableContext = () => React.useContext(TableContext);

const cellDensity: Record<TableDensity, string> = {
  compact: "px-2 py-1 text-xs",
  default: "p-2",
  comfortable: "px-3 py-3",
};

const headDensity: Record<TableDensity, string> = {
  compact: "h-8 px-2 text-xs",
  default: "h-10 px-2",
  comfortable: "h-12 px-3",
};

/* -------------------------------------------------------------------------- */
/*                                    Table                                   */
/* -------------------------------------------------------------------------- */

interface TableProps extends React.ComponentProps<"table"> {
  /** Row/cell spacing. */
  density?: TableDensity;
  /** Zebra-stripe body rows. */
  striped?: boolean;
  /**
   * Keep the header visible while scrolling. Give the container a height
   * limit, e.g. containerClassName="max-h-96".
   */
  stickyHeader?: boolean;
  /** Classes for the scroll container around the table. */
  containerClassName?: string;
}

function Table({
  className,
  containerClassName,
  density = "default",
  striped = false,
  stickyHeader = false,
  ...props
}: TableProps) {
  const value = React.useMemo(
    () => ({ density, striped, stickyHeader }),
    [density, striped, stickyHeader],
  );

  return (
    <TableContext.Provider value={value}>
      <div
        data-slot="table-container"
        className={cn(
          "relative w-full overflow-x-auto",
          stickyHeader && "overflow-y-auto",
          containerClassName,
        )}
      >
        <table
          data-slot="table"
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    </TableContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Structural parts                              */
/* -------------------------------------------------------------------------- */

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  const { striped } = useTableContext();

  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0",
        striped && "[&_tr:nth-child(even)]:bg-muted/30",
        className,
      )}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                     Row                                    */
/* -------------------------------------------------------------------------- */

interface TableRowProps extends React.ComponentProps<"tr"> {
  /** Marks the row as selected (styles via data-state). */
  selected?: boolean;
}

function TableRow({
  className,
  selected,
  onClick,
  onKeyDown,
  ...props
}: TableRowProps) {
  const interactive = typeof onClick === "function";

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !interactive) return;
    // Only react when the row itself is focused, not inner buttons/inputs.
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <tr
      data-slot="table-row"
      data-state={selected ? "selected" : undefined}
      aria-selected={selected || undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors motion-reduce:transition-none",
        interactive &&
          "focus-visible:ring-ring/50 cursor-pointer focus-visible:ring-[3px] focus-visible:outline-none focus-visible:ring-inset",
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Head                                    */
/* -------------------------------------------------------------------------- */

interface TableHeadProps extends React.ComponentProps<"th"> {
  /** Render a sort button inside the header. */
  sortable?: boolean;
  /** Current sort state for this column. */
  sortDirection?: SortDirection;
  /** Called when the sort button is activated. */
  onSort?: () => void;
  /** Right-align and use tabular figures (for number columns). */
  numeric?: boolean;
}

function TableHead({
  className,
  children,
  sortable = false,
  sortDirection = false,
  onSort,
  numeric = false,
  ...props
}: TableHeadProps) {
  const { density, stickyHeader } = useTableContext();

  const SortIcon =
    sortDirection === "asc"
      ? ArrowUp
      : sortDirection === "desc"
        ? ArrowDown
        : ChevronsUpDown;

  const ariaSort = sortable
    ? sortDirection === "asc"
      ? "ascending"
      : sortDirection === "desc"
        ? "descending"
        : "none"
    : undefined;

  return (
    <th
      data-slot="table-head"
      aria-sort={ariaSort}
      className={cn(
        "text-foreground align-middle font-medium whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        numeric ? "text-right tabular-nums" : "text-left",
        headDensity[density],
        stickyHeader &&
          "bg-background sticky top-0 z-10 shadow-[inset_0_-1px_0_var(--border)]",
        className,
      )}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            "hover:bg-muted focus-visible:ring-ring/50 -mx-2 inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
            numeric && "flex-row-reverse",
          )}
        >
          {children}
          <SortIcon
            aria-hidden
            className={cn(
              "size-3.5 shrink-0",
              sortDirection ? "text-foreground" : "text-muted-foreground/60",
            )}
          />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Cell                                    */
/* -------------------------------------------------------------------------- */

interface TableCellProps extends React.ComponentProps<"td"> {
  /** Right-align and use tabular figures (for number columns). */
  numeric?: boolean;
  /** Truncate overflowing text with an ellipsis (set a max width via className). */
  truncate?: boolean;
}

function TableCell({
  className,
  numeric = false,
  truncate = false,
  ...props
}: TableCellProps) {
  const { density } = useTableContext();

  return (
    <td
      data-slot="table-cell"
      className={cn(
        "align-middle",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        truncate ? "max-w-0 truncate" : "whitespace-nowrap",
        numeric && "text-right tabular-nums",
        cellDensity[density],
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                         Loading and empty-state rows                       */
/* -------------------------------------------------------------------------- */

interface TableSkeletonProps {
  rows?: number;
  columns: number;
}

/** Placeholder rows to show inside <TableBody> while data loads. */
function TableSkeleton({ rows = 5, columns }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <TableRow
          key={r}
          aria-hidden
          className="hover:bg-transparent"
          data-slot="table-skeleton-row"
        >
          {Array.from({ length: columns }, (_, c) => (
            <TableCell key={c}>
              <div className="bg-muted h-4 w-full animate-pulse rounded motion-reduce:animate-none" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

interface TableEmptyProps extends React.ComponentProps<"td"> {
  /** Number of columns the message should span. */
  colSpan: number;
}

/** A full-width "no results" row to show inside <TableBody>. */
function TableEmpty({ className, colSpan, children, ...props }: TableEmptyProps) {
  return (
    <TableRow className="hover:bg-transparent" data-slot="table-empty-row">
      <TableCell
        colSpan={colSpan}
        className={cn(
          "text-muted-foreground h-24 text-center whitespace-normal",
          className,
        )}
        {...props}
      >
        {children ?? "No results."}
      </TableCell>
    </TableRow>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableSkeleton,
  TableEmpty,
};
export type {
  TableProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
  TableDensity,
  SortDirection,
};
