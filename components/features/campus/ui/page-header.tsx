import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CampusPageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-primary md:text-[2rem] md:leading-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-primary/65">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
