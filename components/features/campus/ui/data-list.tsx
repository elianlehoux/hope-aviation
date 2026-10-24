import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DataListColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
};

/**
 * Responsive list: a table from `md` up, stacked cards below.
 * The first column is the card title on mobile; the rest render as label/value pairs.
 */
export function DataList<T>({
  rows,
  columns,
  rowKey,
  rowHref,
  empty,
}: {
  rows: T[];
  columns: DataListColumn<T>[];
  rowKey: (row: T) => string;
  rowHref?: (row: T) => string;
  empty: ReactNode;
}) {
  if (rows.length === 0) return <>{empty}</>;
  const [first, ...rest] = columns;

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white">
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="border-b border-primary/10 bg-paper/60">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn("px-5 py-3 text-xs font-semibold text-primary/55", c.className)}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/5">
          {rows.map((row) => {
            const href = rowHref?.(row);
            return (
              <tr key={rowKey(row)} className={cn("text-primary/80", href && "relative hover:bg-paper/50")}>
                {columns.map((c, i) => (
                  <td key={c.key} className={cn("px-5 py-3.5 align-middle", c.className)}>
                    {href && i === 0 ? (
                      <Link
                        href={href}
                        className="font-medium text-primary outline-none after:absolute after:inset-0 focus-visible:underline"
                      >
                        {c.cell(row)}
                      </Link>
                    ) : (
                      c.cell(row)
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <ul className="divide-y divide-primary/5 md:hidden">
        {rows.map((row) => {
          const href = rowHref?.(row);
          const body = (
            <>
              <div className="font-medium text-primary">{first.cell(row)}</div>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                {rest
                  .filter((c) => !c.hideOnMobile)
                  .map((c) => (
                    <div key={c.key} className="contents">
                      <dt className="text-primary/50">{c.header}</dt>
                      <dd className="min-w-0 text-primary/80">{c.cell(row)}</dd>
                    </div>
                  ))}
              </dl>
            </>
          );
          return (
            <li key={rowKey(row)} className="px-4 py-4">
              {href ? (
                <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
