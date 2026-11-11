import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CampusSurface } from "./surface";

/** Centered empty/zero state with an optional icon and call to action. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <CampusSurface className="flex flex-col items-center px-6 py-14 text-center">
      {Icon ? (
        <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-paper text-primary/65">
          <Icon className="size-6" aria-hidden />
        </span>
      ) : null}
      <h2 className="font-display text-lg font-semibold text-primary">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-primary/65">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </CampusSurface>
  );
}
