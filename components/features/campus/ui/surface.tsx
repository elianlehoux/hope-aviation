import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CampusSurface({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/10 bg-white",
        className,
      )}
      {...props}
    />
  );
}

export function CampusEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <CampusSurface className="flex flex-col items-center px-6 py-16 text-center">
      <h2 className="font-display text-lg font-bold text-primary">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-primary/65">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </CampusSurface>
  );
}
