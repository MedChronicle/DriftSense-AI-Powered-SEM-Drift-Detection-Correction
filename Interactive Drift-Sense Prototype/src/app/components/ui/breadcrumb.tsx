import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "./utils";

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex min-w-0 items-center gap-1.5", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 truncate rounded-sm transition-colors outline-none focus-visible:ring-[3px] [&>svg]:size-3.5 [&>svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground inline-flex items-center gap-1.5 truncate font-normal [&>svg]:size-3.5 [&>svg]:shrink-0", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

/**
 * Passive by default (as before). Pass `onClick` and it becomes a real button
 * with an accessible "Show hidden pages" label; without it, it stays decorative.
 */
function BreadcrumbEllipsis({
  className,
  onClick,
  ...props
}: React.ComponentProps<"span"> & { onClick?: React.MouseEventHandler<HTMLButtonElement> }) {
  const icon = <MoreHorizontal className="size-4" />;
  if (onClick) {
    return (
      <button
        type="button"
        data-slot="breadcrumb-ellipsis"
        aria-label="Show hidden pages"
        onClick={onClick}
        className={cn(
          "hover:text-foreground focus-visible:ring-ring/50 flex size-9 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-[3px]",
          className,
        )}
      >
        {icon}
      </button>
    );
  }
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      {icon}
    </span>
  );
}

interface BreadcrumbEntry {
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

interface BreadcrumbsProps extends Omit<React.ComponentProps<"nav">, "children"> {
  items: BreadcrumbEntry[];
  /** Collapse the middle behind an expandable "…" once there are more than this many. 0 disables. */
  maxItems?: number;
  separator?: React.ReactNode;
  /** Render links with your router's Link, e.g. renderLink={(p) => <Link to={p.href} {...p} />}. */
  renderLink?: (props: { href: string; className?: string; children: React.ReactNode }) => React.ReactElement;
}

/** Data-driven version: <Breadcrumbs items={[{label:"Home",href:"/"},{label:"Results"}]} />. Last item is the current page. */
function Breadcrumbs({ items, maxItems = 4, separator, renderLink, ...props }: BreadcrumbsProps) {
  const [expanded, setExpanded] = React.useState(false);
  const collapse = maxItems > 0 && !expanded && items.length > maxItems;

  // keep the first item, an ellipsis, and the last (maxItems - 2) items
  const tail = collapse ? items.slice(items.length - (maxItems - 2)) : [];
  const visible: (BreadcrumbEntry | "ellipsis")[] = collapse
    ? [items[0], "ellipsis", ...tail]
    : items;

  return (
    <Breadcrumb {...props}>
      <BreadcrumbList>
        {visible.map((entry, i) => {
          const isLast = i === visible.length - 1;
          return (
            <React.Fragment key={entry === "ellipsis" ? "ellipsis" : i}>
              <BreadcrumbItem>
                {entry === "ellipsis" ? (
                  <BreadcrumbEllipsis onClick={() => setExpanded(true)} />
                ) : isLast ? (
                  <BreadcrumbPage>{entry.icon}{entry.label}</BreadcrumbPage>
                ) : entry.href && renderLink ? (
                  renderLink({
                    href: entry.href,
                    className: "hover:text-foreground inline-flex items-center gap-1.5 truncate transition-colors",
                    children: <>{entry.icon}{entry.label}</>,
                  })
                ) : (
                  <BreadcrumbLink href={entry.href} onClick={entry.onClick}>
                    {entry.icon}
                    {entry.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export {
  Breadcrumb,
  Breadcrumbs,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
