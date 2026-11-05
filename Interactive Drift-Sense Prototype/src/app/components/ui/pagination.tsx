"use client";

import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "./utils";
import { Button, buttonVariants } from "./button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  /** Blocks interaction and removes the link from the tab order */
  disabled?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  disabled = false,
  size = "icon",
  onClick,
  tabIndex,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      data-slot="pagination-link"
      data-active={isActive ? true : undefined}
      data-disabled={disabled ? true : undefined}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon aria-hidden="true" />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon aria-hidden="true" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon aria-hidden="true" className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Page numbers to display, with ellipsis markers. Always returns the same
 * number of slots (2 * siblings + 5) once there are enough pages, so the
 * control doesn't change width while paging.
 */
function getPaginationRange(
  page: number,
  totalPages: number,
  siblings: number = 1,
): PageItem[] {
  const total = Math.max(0, Math.floor(totalPages));
  const slots = siblings * 2 + 5; // first, last, current, 2 siblings sides, 2 ellipses

  if (total <= slots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const current = Math.min(Math.max(1, page), total);
  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);

  const showLeftEllipsis = leftSibling > 3;
  const showRightEllipsis = rightSibling < total - 2;
  const edgeCount = siblings * 2 + 3;

  if (!showLeftEllipsis && showRightEllipsis) {
    const left = Array.from({ length: edgeCount }, (_, i) => i + 1);
    return [...left, "ellipsis-end", total];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const right = Array.from(
      { length: edgeCount },
      (_, i) => total - edgeCount + 1 + i,
    );
    return [1, "ellipsis-start", ...right];
  }

  const middle = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  );
  return [1, "ellipsis-start", ...middle, "ellipsis-end", total];
}

type PaginationPagesProps = {
  /** Current page, 1-based */
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current page (default 1) */
  siblings?: number;
  /** Build real hrefs (for SSR/SEO). Without it, links use "#" and onPageChange. */
  getHref?: (page: number) => string;
  className?: string;
};

/** Complete control: previous, numbered links with ellipses, next */
function PaginationPages({
  page,
  totalPages,
  onPageChange,
  siblings = 1,
  getHref,
  className,
}: PaginationPagesProps) {
  if (totalPages <= 1) return null;

  const items = getPaginationRange(page, totalPages, siblings);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  const linkProps = (target: number) => ({
    href: getHref ? getHref(target) : "#",
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!getHref) event.preventDefault();
      onPageChange?.(target);
    },
  });

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled={isFirst} {...linkProps(page - 1)} />
        </PaginationItem>
        {items.map((item) =>
          typeof item === "number" ? (
            <PaginationItem key={item}>
              <PaginationLink
                isActive={item === page}
                aria-label={`Go to page ${item}`}
                {...linkProps(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationEllipsis />
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext disabled={isLast} {...linkProps(page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

/** "Showing 21 to 30 of 245" text */
function PaginationSummary({
  start,
  end,
  total,
  className,
  ...props
}: React.ComponentProps<"p"> & {
  /** 1-based index of the first visible item */
  start: number;
  /** 1-based index of the last visible item */
  end: number;
  total: number;
}) {
  return (
    <p
      data-slot="pagination-summary"
      aria-live="polite"
      className={cn("text-muted-foreground text-sm tabular-nums", className)}
      {...props}
    >
      {total === 0 ? "No results" : `Showing ${start} to ${end} of ${total}`}
    </p>
  );
}

/**
 * State for page and page size. `startIndex` and `endIndex` are 0-based and
 * ready for `items.slice(startIndex, endIndex)`.
 */
function usePagination({
  total,
  pageSize: initialPageSize = 10,
  initialPage = 1,
}: {
  total: number;
  pageSize?: number;
  initialPage?: number;
}) {
  const [page, setPageState] = React.useState(initialPage);
  const [pageSize, setPageSizeState] = React.useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const setPage = React.useCallback(
    (next: number) => setPageState(Math.min(Math.max(1, next), totalPages)),
    [totalPages],
  );
  const next = React.useCallback(() => setPage(currentPage + 1), [setPage, currentPage]);
  const prev = React.useCallback(() => setPage(currentPage - 1), [setPage, currentPage]);
  const first = React.useCallback(() => setPage(1), [setPage]);
  const last = React.useCallback(() => setPage(totalPages), [setPage, totalPages]);

  // Changing page size resets to page 1 so the user isn't dropped off the end
  const setPageSize = React.useCallback((size: number) => {
    setPageSizeState(Math.max(1, size));
    setPageState(1);
  }, []);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  return {
    page: currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    /** 1-based, for PaginationSummary */
    start: total === 0 ? 0 : startIndex + 1,
    end: endIndex,
    isFirst: currentPage <= 1,
    isLast: currentPage >= totalPages,
    setPage,
    setPageSize,
    next,
    prev,
    first,
    last,
  };
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationPages,
  PaginationSummary,
  getPaginationRange,
  usePagination,
};
export type { PaginationLinkProps, PaginationPagesProps, PageItem };
